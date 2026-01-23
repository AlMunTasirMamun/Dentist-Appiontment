const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * @desc    Get all appointments (filtered by role)
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res) => {
    try {
        const { status, date, doctorId } = req.query;
        let query = {};

        // Admin sees all, but can filter.
        // If non-admin hits this, it's captured by getMyAppointments or filtered here
        if (req.user.role === 'client') {
            query.patient = req.user._id;
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (doctor) {
                query.doctor = doctor._id;
            }
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        // Filter by doctor (admin only)
        if (doctorId && req.user.role === 'admin') {
            query.doctor = doctorId;
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty image')
            .populate('patient', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Private (Admin or Owner)
 */
const getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'name specialty email phone image')
            .populate('patient', 'name email phone');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Check authorization
        if (req.user.role === 'client') {
            if (!appointment.patient || appointment.patient._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this appointment',
                });
            }
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!appointment.doctor || appointment.doctor._id.toString() !== doctor?._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this appointment',
                });
            }
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Create appointment (Guest or Client)
 * @route   POST /api/appointments
 * @access  Public
 */
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason, guestInfo } = req.body;

        // Validate required fields
        if (!doctorId || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Please provide doctor, date, and time slot',
            });
        }

        // Check if doctor exists and is active
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        if (doctor.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Doctor is not available for appointments',
            });
        }

        // Check for guest booking without guest info
        if (!req.user && !guestInfo) {
            return res.status(400).json({
                success: false,
                message: 'Guest info is required for unregistered users',
            });
        }

        if (!req.user && guestInfo && (!guestInfo.name || !guestInfo.email)) {
            return res.status(400).json({
                success: false,
                message: 'Guest name and email are required',
            });
        }

        // Check for double booking
        const appointmentDate = new Date(date);
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            'timeSlot.start': timeSlot.start,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked',
            });
        }

        // Create appointment
        const appointmentData = {
            doctor: doctorId,
            date: appointmentDate,
            timeSlot,
            reason,
            amount: doctor.price || 0,
            status: 'pending',
            paymentStatus: 'pending',
        };

        // Add patient or guest info
        if (req.user) {
            appointmentData.patient = req.user._id;
        } else {
            appointmentData.guestInfo = guestInfo;
        }

        const appointment = await Appointment.create(appointmentData);

        // Populate for response
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctor', 'name specialty image');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: populatedAppointment,
        });
    } catch (error) {
        console.error('Create appointment error:', error);

        // Handle duplicate booking error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/appointments/:id
 * @access  Private (Admin or Owner)
 */
const updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Check authorization
        let isOwner = false;
        const isAdmin = req.user.role === 'admin';

        if (req.user.role === 'client') {
            isOwner = appointment.patient &&
                appointment.patient.toString() === req.user._id.toString();
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            isOwner = appointment.doctor &&
                appointment.doctor.toString() === doctor?._id.toString();
        }

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this appointment',
            });
        }

        // Allowed updates based on role
        const { status, notes } = req.body;
        const updateData = {};

        // Clients can only cancel their appointments
        if (isOwner && !isAdmin) {
            if (status && status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only cancel your appointments',
                });
            }
            if (status === 'cancelled') {
                updateData.status = status;
            }
        }

        // Admin can update any field
        if (isAdmin) {
            if (status) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;
        }

        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('doctor', 'name specialty image')
            .populate('patient', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment,
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete/Cancel appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Admin or Owner)
 */
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Check authorization
        let isOwner = false;
        const isAdmin = req.user.role === 'admin';

        if (req.user.role === 'client') {
            isOwner = appointment.patient &&
                appointment.patient.toString() === req.user._id.toString();
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ user: req.user._id });
            isOwner = appointment.doctor &&
                appointment.doctor.toString() === doctor?._id.toString();
        }

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this appointment',
            });
        }

        // Soft delete - just update status to cancelled
        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get appointments by doctor (Admin)
 * @route   GET /api/appointments/doctor/:doctorId
 * @access  Admin
 */
const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = { doctor: req.params.doctorId };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty')
            .populate('patient', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        console.error('Get appointments by doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get appointments for the currently logged in user (Client)
 * @route   GET /api/appointments/my
 * @access  Private (Client)
 */
const getMyAppointments = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { patient: req.user._id };

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialty image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getAppointments,
    getAppointment,
    getMyAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDoctor,
};
