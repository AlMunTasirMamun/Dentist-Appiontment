const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    dosage: {
        type: String, // e.g., "1-0-1"
        required: true,
    },
    duration: {
        type: String, // e.g., "7 days"
        required: true,
    },
    instructions: {
        type: String,
        trim: true,
    },
});

const prescriptionSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        medicines: [medicineSchema],
        diagnosis: {
            type: String,
            required: true,
            trim: true,
        },
        advice: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
