const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * @desc    Create a new prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor)
 */
const createPrescription = async (req, res) => {
    try {
        const { appointmentId, medicines, diagnosis, advice } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to prescribe for this appointment' });
        }

        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: doctor._id,
            patient: appointment.patient,
            medicines,
            diagnosis,
            advice,
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

module.exports = {
    createPrescription,
    getPatientPrescriptions,
    getPrescription,
    getPrescriptionByAppointment,
};
