const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

/**
 * @desc    Create a new prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor)
 */
const createPrescription = async (req, res) => {
    try {
        let { appointmentId, medicines, diagnosis, advice } = req.body;

        // Parse medicines if it's a string (from FormData)
        if (typeof medicines === 'string') {
            medicines = JSON.parse(medicines);
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to prescribe for this appointment' });
        }

        // Handle prescription file upload
        let prescriptionFile = null;
        if (req.file) {
            prescriptionFile = `/uploads/prescriptions/${req.file.filename}`;
        }

        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: doctor._id,
            patient: appointment.patient,
            medicines,
            diagnosis,
            advice,
            prescriptionFile,
        });

        res.status(201).json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get prescriptions for a patient
 * @route   GET /api/prescriptions/patient/:patientId
 * @access  Private (Admin, Doctor, or the Patient)
 */
const getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Authorization check
        if (req.user.role === 'client' && req.user._id.toString() !== patientId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const prescriptions = await Prescription.find({ patient: patientId })
            .populate('doctor', 'name specialty')
            .populate('appointment', 'date')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: prescriptions,
        });
    } catch (error) {
        console.error('Get patient prescriptions error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get prescription details
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
const getPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name email');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // Authorization check
        if (req.user.role === 'client' && req.user._id.toString() !== prescription.patient.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Get prescription by appointment ID
 * @route   GET /api/prescriptions/appointment/:appointmentId
 * @access  Private
 */
const getPrescriptionByAppointment = async (req, res) => {
    try {
        const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
            .populate('doctor', 'name specialty')
            .populate('patient', 'name email');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.status(200).json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error('Get prescription by appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Download prescription file
 * @route   GET /api/prescriptions/:id/download
 * @access  Private
 */
const downloadPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('patient', 'name');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // Authorization check - only patient, doctor, or admin can download
        if (req.user.role === 'client' && prescription.patient && req.user._id.toString() !== prescription.patient._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to download this prescription' });
        }

        if (!prescription.prescriptionFile) {
            return res.status(404).json({ success: false, message: 'No prescription file available' });
        }

        // Construct the file path
        const filePath = path.join(__dirname, '../../', prescription.prescriptionFile);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Prescription file not found on server' });
        }

        // Get the file extension
        const ext = path.extname(prescription.prescriptionFile).toLowerCase();
        
        // Set content type based on file extension
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.avif': 'image/avif',
            '.webp': 'image/webp',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        // Generate a meaningful filename
        const patientName = prescription.patient?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'patient';
        const date = new Date(prescription.createdAt).toISOString().split('T')[0];
        const downloadFilename = `prescription_${patientName}_${date}${ext}`;

        // Set headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Generate and download prescription as PDF
 * @route   GET /api/prescriptions/:id/pdf
 * @access  Private
 */
const downloadPrescriptionPDF = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name email')
            .populate('appointment', 'date');

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // Authorization check - only patient, doctor, or admin can download
        if (req.user.role === 'client' && prescription.patient && req.user._id.toString() !== prescription.patient._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to download this prescription' });
        }

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });

        // Generate filename
        const patientName = prescription.patient?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'patient';
        const date = new Date(prescription.createdAt).toISOString().split('T')[0];
        const downloadFilename = `prescription_${patientName}_${date}.pdf`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('DentCare Clinic', { align: 'center' });
        doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('Your Trusted Dental Care Partner', { align: 'center' });
        doc.moveDown(0.5);
        
        // Divider line
        doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Title
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#111827').text('Medical Prescription', { align: 'center' });
        doc.moveDown(1);

        // Patient & Doctor Info Box
        const infoBoxY = doc.y;
        doc.rect(50, infoBoxY, 500, 80).fillColor('#f3f4f6').fill();
        
        doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold');
        doc.text('Patient Information', 70, infoBoxY + 15);
        doc.font('Helvetica').fontSize(10).fillColor('#4b5563');
        doc.text(`Name: ${prescription.patient?.name || 'N/A'}`, 70, infoBoxY + 32);
        doc.text(`Email: ${prescription.patient?.email || 'N/A'}`, 70, infoBoxY + 47);
        
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#374151');
        doc.text('Doctor Information', 320, infoBoxY + 15);
        doc.font('Helvetica').fontSize(10).fillColor('#4b5563');
        doc.text(`Dr. ${prescription.doctor?.name || 'N/A'}`, 320, infoBoxY + 32);
        doc.text(`${prescription.doctor?.specialty || 'Dentist'}`, 320, infoBoxY + 47);
        
        doc.y = infoBoxY + 95;

        // Date
        doc.fontSize(10).fillColor('#6b7280');
        const prescriptionDate = prescription.appointment?.date 
            ? new Date(prescription.appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Date: ${prescriptionDate}`, { align: 'right' });
        doc.moveDown(1.5);

        // Diagnosis Section
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af').text('DIAGNOSIS');
        doc.moveDown(0.3);
        doc.rect(50, doc.y, 500, 0.5).fillColor('#1e40af').fill();
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor('#374151').text(prescription.diagnosis || 'Not specified');
        doc.moveDown(1.5);

        // Medicines Section
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af').text('PRESCRIBED MEDICINES');
        doc.moveDown(0.3);
        doc.rect(50, doc.y, 500, 0.5).fillColor('#1e40af').fill();
        doc.moveDown(0.5);

        if (prescription.medicines && prescription.medicines.length > 0) {
            // Table Header
            const tableTop = doc.y;
            const tableHeaders = ['#', 'Medicine Name', 'Dosage', 'Duration', 'Instructions'];
            const colWidths = [30, 140, 100, 80, 150];
            
            doc.rect(50, tableTop, 500, 25).fillColor('#e5e7eb').fill();
            doc.fillColor('#374151').font('Helvetica-Bold').fontSize(9);
            
            let xPos = 55;
            tableHeaders.forEach((header, i) => {
                doc.text(header, xPos, tableTop + 8, { width: colWidths[i] - 10 });
                xPos += colWidths[i];
            });

            // Table Rows
            let rowY = tableTop + 25;
            doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
            
            prescription.medicines.forEach((med, index) => {
                const rowHeight = 30;
                
                // Alternate row background
                if (index % 2 === 0) {
                    doc.rect(50, rowY, 500, rowHeight).fillColor('#f9fafb').fill();
                }
                
                doc.fillColor('#4b5563');
                xPos = 55;
                const rowData = [
                    `${index + 1}`,
                    med.name || '-',
                    med.dosage || '-',
                    med.duration || '-',
                    med.instructions || '-'
                ];
                
                rowData.forEach((data, i) => {
                    doc.text(data, xPos, rowY + 10, { width: colWidths[i] - 10 });
                    xPos += colWidths[i];
                });
                
                rowY += rowHeight;
            });
            
            doc.y = rowY + 10;
        } else {
            doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('No medicines prescribed');
        }
        doc.moveDown(1.5);

        // Advice Section
        if (prescription.advice) {
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af').text('ADVICE & INSTRUCTIONS');
            doc.moveDown(0.3);
            doc.rect(50, doc.y, 500, 0.5).fillColor('#1e40af').fill();
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('#374151').text(`"${prescription.advice}"`);
            doc.moveDown(1.5);
        }

        // Footer
        const footerY = doc.page.height - 80;
        doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, footerY).lineTo(550, footerY).stroke();
        doc.fontSize(8).font('Helvetica').fillColor('#9ca3af');
        doc.text('This is a computer-generated prescription. Please consult your doctor if you have any questions.', 50, footerY + 15, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, footerY + 30, { align: 'center' });

        // Finalize PDF
        doc.end();
    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Update/Edit a prescription
 * @route   PUT /api/prescriptions/:id
 * @access  Private (Doctor)
 */
const updatePrescription = async (req, res) => {
    try {
        let { medicines, diagnosis, advice } = req.body;

        // Parse medicines if it's a string (from FormData)
        if (typeof medicines === 'string') {
            medicines = JSON.parse(medicines);
        }

        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // Check if the doctor owns this prescription
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this prescription' });
        }

        // Handle prescription file upload
        let prescriptionFile = prescription.prescriptionFile;
        if (req.file) {
            // Delete old file if exists
            if (prescription.prescriptionFile) {
                const oldFilePath = path.join(__dirname, '../../', prescription.prescriptionFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            prescriptionFile = `/uploads/prescriptions/${req.file.filename}`;
        }

        // Update the prescription
        prescription.medicines = medicines || prescription.medicines;
        prescription.diagnosis = diagnosis || prescription.diagnosis;
        prescription.advice = advice !== undefined ? advice : prescription.advice;
        prescription.prescriptionFile = prescriptionFile;
        prescription.updatedAt = new Date();

        await prescription.save();

        // Populate for response
        await prescription.populate('doctor', 'name specialty');
        await prescription.populate('patient', 'name email');

        res.status(200).json({
            success: true,
            data: prescription,
            message: 'Prescription updated successfully',
        });
    } catch (error) {
        console.error('Update prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPrescription,
    getPatientPrescriptions,
    getPrescription,
    getPrescriptionByAppointment,
    downloadPrescription,
    downloadPrescriptionPDF,
    updatePrescription,
};
