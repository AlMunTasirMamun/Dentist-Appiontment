const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true,
    },
    startTime: {
        type: String, // Format: "09:00"
        required: true,
    },
    endTime: {
        type: String, // Format: "17:00"
        required: true,
    },
    slotDuration: {
        type: Number, // Duration in minutes
        default: 30,
    },
});

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide doctor name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        specialty: {
            type: String,
            required: [true, 'Please provide specialty'],
            trim: true,
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },
        image: {
            type: String,
            default: '/images/default-doctor.png',
        },
        availability: [availabilitySchema],
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching doctors
doctorSchema.index({ name: 'text', specialty: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
