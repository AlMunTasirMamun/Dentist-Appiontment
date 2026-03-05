const mongoose = require('mongoose');

const guestInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
});

const timeSlotSchema = new mongoose.Schema({
    start: {
        type: String, // Format: "10:00"
        required: true,
    },
    end: {
        type: String, // Format: "10:30"
        required: true,
    },
});

const appointmentSchema = new mongoose.Schema(
    {
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Please select a doctor'],
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Null for guest bookings
        },
        guestInfo: {
            type: guestInfoSchema,
            default: null, // Only for unregistered users
        },
        date: {
            type: Date,
            required: [true, 'Please select a date'],
        },
        timeSlot: {
            type: timeSlotSchema,
            required: [true, 'Please select a time slot'],
        },
        reason: {
            type: String,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'consulted', 'completed'],
            default: 'pending',
        },
        notes: {
            type: String,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
        amount: {
            type: Number,
            default: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
            default: 'pending',
        },
        refundAmount: {
            type: Number,
            default: 0,
        },
        refundStatus: {
            type: String,
            enum: ['none', 'requested', 'pending', 'approved', 'rejected', 'processed'],
            default: 'none',
        },
        refundRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RefundRequest',
        },
        transactionId: {
            type: String, // Merchant's txn ID
        },
        pg_txnid: {
            type: String, // Aamarpay's txn ID
        },
        paymentDetails: {
            pg_txnid: String,
            cardType: String,
            cardNumber: String, // Last 4 digits
            customerName: String,
            customerEmail: String,
            customerPhone: String,
            paymentMethod: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for preventing double bookings
appointmentSchema.index({ doctor: 1, date: 1, 'timeSlot.start': 1 }, { unique: true });

// Virtual to check if appointment is for guest or registered user
appointmentSchema.virtual('isGuestBooking').get(function () {
    return !this.patient && this.guestInfo;
});

// Ensure either patient or guestInfo is provided
appointmentSchema.pre('save', function (next) {
    if (!this.patient && !this.guestInfo) {
        next(new Error('Either patient or guest info is required'));
    }
    if (this.patient && this.guestInfo) {
        this.guestInfo = null; // Clear guest info if patient is provided
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
