const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reason: {
            type: String,
            required: [true, 'Please provide a reason for refund'],
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        originalAmount: {
            type: Number,
            required: true,
        },
        refundAmount: {
            type: Number,
            required: true,
        },
        refundPercentage: {
            type: Number,
            default: 50, // 50% refund
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'processed'],
            default: 'pending',
        },
        adminNote: {
            type: String,
            maxlength: [500, 'Admin note cannot exceed 500 characters'],
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        processedAt: {
            type: Date,
        },
        transactionId: {
            type: String, // Original transaction ID
        },
        refundTransactionId: {
            type: String, // Refund transaction ID from payment gateway
        },
        paymentMethod: {
            type: String, // Store original payment method for refund
        },
        paymentDetails: {
            pg_txnid: String, // Aamarpay transaction ID
            cardType: String,
            cardNumber: String, // Last 4 digits if applicable
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
refundRequestSchema.index({ status: 1, createdAt: -1 });
refundRequestSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
