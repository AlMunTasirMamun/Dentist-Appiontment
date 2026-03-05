const RefundRequest = require('../models/RefundRequest');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const axios = require('axios');

/**
 * Process refund via Aamarpay API
 * Note: Aamarpay refund API requires merchant approval and specific setup
 */
const processAamarpayRefund = async (refundRequest, appointment) => {
    try {
        const store_id = process.env.AAMARPAY_STORE_ID || 'aamarpaytest';
        const signature_key = process.env.AAMARPAY_SIGNATURE_KEY || 'dbb74894e82415a2f7ff0ec3a97e4183';
        const base_url = process.env.AAMARPAY_BASE_URL || 'https://sandbox.aamarpay.com';

        // Aamarpay refund API endpoint (if available for your merchant account)
        // Note: This is a typical refund API structure - actual endpoint may vary
        const refundPayload = {
            store_id: store_id,
            signature_key: signature_key,
            tran_id: appointment.transactionId,
            pg_txnid: appointment.pg_txnid || appointment.paymentDetails?.pg_txnid,
            refund_amount: refundRequest.refundAmount.toString(),
            refund_reason: refundRequest.reason,
        };

        // Try to call Aamarpay refund API
        // Note: In sandbox/test mode, this may not work. Production requires Aamarpay support.
        const response = await axios.post(
            `${base_url}/api/v1/refund/request.php`,
            refundPayload,
            { timeout: 30000 }
        );

        if (response.data && response.data.result === 'success') {
            return {
                success: true,
                refundTransactionId: response.data.refund_txn_id || `REFUND-${Date.now()}`,
                message: 'Refund processed via payment gateway',
            };
        }

        // If API fails, return manual processing required
        return {
            success: false,
            message: 'Automatic refund not available. Manual processing required.',
            requiresManual: true,
        };
    } catch (error) {
        console.error('Aamarpay refund API error:', error.message);
        // Return manual processing required if API call fails
        return {
            success: false,
            message: 'Automatic refund failed. Manual processing required.',
            requiresManual: true,
            error: error.message,
        };
    }
};

/**
 * @desc    Create a refund request (Patient)
 * @route   POST /api/refunds/request
 * @access  Private (Client)
 */
const createRefundRequest = async (req, res) => {
    try {
        const { appointmentId, reason } = req.body;

        // Validate appointment exists
        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'name')
            .populate('patient', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        // Check if user owns the appointment
        if (!appointment.patient || appointment.patient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to request refund for this appointment',
            });
        }

        // Check if appointment is paid
        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Can only request refund for paid appointments',
            });
        }

        // Check if refund already requested
        if (appointment.refundStatus !== 'none') {
            return res.status(400).json({
                success: false,
                message: `Refund already ${appointment.refundStatus}`,
            });
        }

        // Check if appointment can be cancelled (not completed or consulted)
        if (['completed', 'consulted'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot request refund for completed or consulted appointments',
            });
        }

        // Calculate refund amount (50% of original amount)
        const refundPercentage = 50;
        const refundAmount = (appointment.amount * refundPercentage) / 100;

        // Create refund request
        const refundRequest = await RefundRequest.create({
            appointment: appointmentId,
            patient: req.user._id,
            reason,
            originalAmount: appointment.amount,
            refundAmount,
            refundPercentage,
            transactionId: appointment.transactionId,
            paymentMethod: appointment.paymentDetails?.paymentMethod || 'Online Payment',
            paymentDetails: {
                pg_txnid: appointment.pg_txnid || appointment.paymentDetails?.pg_txnid,
                cardType: appointment.paymentDetails?.cardType,
                cardNumber: appointment.paymentDetails?.cardNumber,
                customerName: appointment.paymentDetails?.customerName || appointment.patient?.name,
                customerEmail: appointment.paymentDetails?.customerEmail || appointment.patient?.email,
                customerPhone: appointment.paymentDetails?.customerPhone || appointment.patient?.phone,
            },
        });

        // Update appointment
        appointment.refundStatus = 'requested';
        appointment.refundAmount = refundAmount;
        appointment.refundRequest = refundRequest._id;
        appointment.status = 'cancelled'; // Cancel the appointment
        await appointment.save();

        // Populate for response
        await refundRequest.populate('patient', 'name email');
        await refundRequest.populate({
            path: 'appointment',
            populate: { path: 'doctor', select: 'name specialty' }
        });

        res.status(201).json({
            success: true,
            message: 'Refund request submitted successfully. Admin will review and process it.',
            data: refundRequest,
        });
    } catch (error) {
        console.error('Create refund request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all refund requests (Admin)
 * @route   GET /api/refunds
 * @access  Private (Admin)
 */
const getRefundRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const refundRequests = await RefundRequest.find(query)
            .populate('patient', 'name email phone')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialty' }
            })
            .populate('processedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: refundRequests.length,
            data: refundRequests,
        });
    } catch (error) {
        console.error('Get refund requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get pending refund requests count (Admin)
 * @route   GET /api/refunds/pending-count
 * @access  Private (Admin)
 */
const getPendingRefundCount = async (req, res) => {
    try {
        const count = await RefundRequest.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('Get pending refund count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get my refund requests (Patient)
 * @route   GET /api/refunds/my-requests
 * @access  Private (Client)
 */
const getMyRefundRequests = async (req, res) => {
    try {
        const refundRequests = await RefundRequest.find({ patient: req.user._id })
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialty' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: refundRequests.length,
            data: refundRequests,
        });
    } catch (error) {
        console.error('Get my refund requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Approve refund request (Admin)
 * @route   PUT /api/refunds/:id/approve
 * @access  Private (Admin)
 */
const approveRefund = async (req, res) => {
    try {
        const { adminNote } = req.body;

        const refundRequest = await RefundRequest.findById(req.params.id)
            .populate('patient', 'name email')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialty' }
            });

        if (!refundRequest) {
            return res.status(404).json({
                success: false,
                message: 'Refund request not found',
            });
        }

        if (refundRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Refund request already ${refundRequest.status}`,
            });
        }

        // Get appointment with full details
        const appointment = await Appointment.findById(refundRequest.appointment);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Associated appointment not found',
            });
        }

        // Update refund request status to approved
        refundRequest.status = 'approved';
        refundRequest.adminNote = adminNote || 'Refund approved by admin';
        refundRequest.processedBy = req.user._id;
        refundRequest.processedAt = new Date();

        // Try to process refund via payment gateway
        const refundResult = await processAamarpayRefund(refundRequest, appointment);

        if (refundResult.success) {
            // Automatic refund successful
            refundRequest.status = 'processed';
            refundRequest.refundTransactionId = refundResult.refundTransactionId;
            appointment.refundStatus = 'processed';
            appointment.paymentStatus = 'refunded';
        } else {
            // Manual processing required - mark as processed since admin approved
            // The actual money transfer needs to be done manually via Aamarpay dashboard or bank transfer
            refundRequest.status = 'processed';
            refundRequest.refundTransactionId = `MANUAL-${Date.now()}`;
            refundRequest.adminNote = (adminNote || 'Refund approved by admin') + 
                `. Manual processing required. Payment details: ${appointment.paymentDetails?.paymentMethod || 'Online Payment'}` +
                `, Customer: ${appointment.paymentDetails?.customerEmail || refundRequest.patient?.email}` +
                `, Amount: BDT ${refundRequest.refundAmount}`;
            appointment.refundStatus = 'processed';
            appointment.paymentStatus = 'refunded';
        }

        await refundRequest.save();
        await appointment.save();

        await refundRequest.populate('processedBy', 'name');

        // Prepare response with payment details for admin
        const paymentInfo = {
            originalTransactionId: appointment.transactionId,
            pgTransactionId: appointment.pg_txnid || appointment.paymentDetails?.pg_txnid,
            paymentMethod: appointment.paymentDetails?.paymentMethod || 'Online Payment',
            cardType: appointment.paymentDetails?.cardType,
            cardNumber: appointment.paymentDetails?.cardNumber,
            customerName: appointment.paymentDetails?.customerName || refundRequest.patient?.name,
            customerEmail: appointment.paymentDetails?.customerEmail || refundRequest.patient?.email,
            customerPhone: appointment.paymentDetails?.customerPhone,
        };

        res.status(200).json({
            success: true,
            message: refundResult.success 
                ? `Refund of BDT ${refundRequest.refundAmount} processed successfully via payment gateway.`
                : `Refund of BDT ${refundRequest.refundAmount} approved. Please process manually using the payment details below.`,
            data: refundRequest,
            paymentInfo,
            requiresManualProcessing: !refundResult.success,
        });
    } catch (error) {
        console.error('Approve refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Reject refund request (Admin)
 * @route   PUT /api/refunds/:id/reject
 * @access  Private (Admin)
 */
const rejectRefund = async (req, res) => {
    try {
        const { adminNote } = req.body;

        if (!adminNote) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for rejection',
            });
        }

        const refundRequest = await RefundRequest.findById(req.params.id)
            .populate('patient', 'name email')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialty' }
            });

        if (!refundRequest) {
            return res.status(404).json({
                success: false,
                message: 'Refund request not found',
            });
        }

        if (refundRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Refund request already ${refundRequest.status}`,
            });
        }

        // Update refund request
        refundRequest.status = 'rejected';
        refundRequest.adminNote = adminNote;
        refundRequest.processedBy = req.user._id;
        refundRequest.processedAt = new Date();
        await refundRequest.save();

        // Update appointment
        const appointment = await Appointment.findById(refundRequest.appointment);
        if (appointment) {
            appointment.refundStatus = 'rejected';
            appointment.refundAmount = 0;
            await appointment.save();
        }

        await refundRequest.populate('processedBy', 'name');

        res.status(200).json({
            success: true,
            message: 'Refund request rejected',
            data: refundRequest,
        });
    } catch (error) {
        console.error('Reject refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single refund request
 * @route   GET /api/refunds/:id
 * @access  Private
 */
const getRefundRequest = async (req, res) => {
    try {
        const refundRequest = await RefundRequest.findById(req.params.id)
            .populate('patient', 'name email phone')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name specialty' }
            })
            .populate('processedBy', 'name');

        if (!refundRequest) {
            return res.status(404).json({
                success: false,
                message: 'Refund request not found',
            });
        }

        // Check authorization
        if (req.user.role === 'client' && refundRequest.patient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this refund request',
            });
        }

        res.status(200).json({
            success: true,
            data: refundRequest,
        });
    } catch (error) {
        console.error('Get refund request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    createRefundRequest,
    getRefundRequests,
    getPendingRefundCount,
    getMyRefundRequests,
    approveRefund,
    rejectRefund,
    getRefundRequest,
};
