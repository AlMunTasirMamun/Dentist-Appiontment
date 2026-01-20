const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { generateToken } = require('../middlewares/authMiddleware');
const { generateTimeSlots, getDayName } = require('../utils/helpers');

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res) => {
    try {
        const { status, specialty, search } = req.query;
        const query = {};

        // Filter by status (default to active for public, skip if 'all')
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = 'active';
        }
        // If status === 'all', don't add status filter (return all doctors)

        // Filter by specialty
        if (specialty) {
            query.specialty = { $regex: specialty, $options: 'i' };
        }

        // Search by name or specialty
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } },
            ];
        }

        const doctors = await Doctor.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single doctor
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Create doctor
 * @route   POST /api/doctors
 * @access  Admin
 */
const createDoctor = async (req, res) => {
    try {
        // Parse availability if it's a string (from FormData)
        let availability = req.body.availability;
        if (typeof availability === 'string') {
            try {
                availability = JSON.parse(availability);
            } catch (e) {
                availability = [];
            }
        }

        const doctorData = {
            ...req.body,
            availability,
            createdBy: req.user._id,
        };

        // Add image path if file was uploaded
        if (req.file) {
            doctorData.image = `/uploads/doctors/${req.file.filename}`;
        }

        // Create User account first
        const user = await User.create({
            name: doctorData.name,
            email: doctorData.email,
            password: req.body.password,
            phone: doctorData.phone,
            role: 'doctor',
        });

        // Create Doctor linked to User
        const doctor = await Doctor.create({
            ...doctorData,
            user: user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Create doctor error:', error);

        // Handle duplicate email
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A doctor with this email already exists',
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
 * @desc    Update doctor
 * @route   PUT /api/doctors/:id
 * @access  Admin
 */
const updateDoctor = async (req, res) => {
    try {
        let doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        // Parse availability if it's a string (from FormData)
        let updateData = { ...req.body };
        if (typeof updateData.availability === 'string') {
            try {
                updateData.availability = JSON.parse(updateData.availability);
            } catch (e) {
                delete updateData.availability;
            }
        }

        // Add image path if new file was uploaded
        if (req.file) {
            updateData.image = `/uploads/doctors/${req.file.filename}`;
        }

        doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        // Synchronize with User account if name or email changed
        if (updateData.name || updateData.email) {
            await User.findByIdAndUpdate(doctor.user, {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.email && { email: updateData.email }),
            });
        }

        res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor,
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete doctor
 * @route   DELETE /api/doctors/:id
 * @access  Admin
 */
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        // Check for existing appointments
        const appointments = await Appointment.countDocuments({
            doctor: req.params.id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (appointments > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete doctor with ${appointments} pending/confirmed appointments`,
            });
        }

        const userId = doctor.user;
        await Doctor.findByIdAndDelete(req.params.id);

        // Also delete the associated User account
        if (userId) {
            await User.findByIdAndDelete(userId);
        }

        res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully',
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get doctor's available time slots for a specific date
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
const getDoctorAvailability = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date',
            });
        }

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        if (doctor.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Doctor is not available',
            });
        }

        // Get day of week from date
        const requestedDate = new Date(date);
        const dayName = getDayName(requestedDate);

        // Find availability for that day
        const dayAvailability = doctor.availability.find(
            (avail) => avail.day === dayName
        );

        if (!dayAvailability) {
            return res.status(200).json({
                success: true,
                message: 'Doctor is not available on this day',
                data: {
                    date,
                    dayName,
                    availableSlots: [],
                },
            });
        }

        // Generate all possible time slots
        const allSlots = generateTimeSlots(
            dayAvailability.startTime,
            dayAvailability.endTime,
            dayAvailability.slotDuration
        );

        // Get booked appointments for this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctor: req.params.id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'confirmed'] },
        });

        // Filter out booked slots
        const bookedTimes = bookedAppointments.map((apt) => apt.timeSlot.start);
        const availableSlots = allSlots.filter(
            (slot) => !bookedTimes.includes(slot.start)
        );

        res.status(200).json({
            success: true,
            data: {
                date,
                dayName,
                availableSlots,
                bookedSlots: bookedTimes,
            },
        });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get current logged in doctor profile
 * @route   GET /api/doctors/me
 * @access  Doctor
 */
const getDoctorMe = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }
        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get appointments for logged in doctor
 * @route   GET /api/doctors/me/appointments
 * @access  Doctor
 */
const getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor profile not found',
            });
        }

        const { status } = req.query;
        const query = { doctor: doctor._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email phone')
            .sort({ date: 1, 'timeSlot.start': 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorAvailability,
    getDoctorMe,
    getDoctorAppointments,
};
