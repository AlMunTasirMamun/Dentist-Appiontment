const axios = require('axios');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Initiate payment with Aamarpay
 * @route   POST /api/payment/initiate
 * @access  Public
 */
const initiatePayment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason, guestInfo } = req.body;

        // 1. Validate doctor and get price
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const amount = doctor.price;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid consultation price' });
        }

        // 2. Generate unique transaction ID
        const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

        // 3. Create pending appointment
        const appointmentData = {
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            reason,
            amount,
            transactionId,
            paymentStatus: 'pending',
            status: 'pending',
        };

        if (req.user) {
            appointmentData.patient = req.user._id;
        } else {
            appointmentData.guestInfo = guestInfo;
        }

        const appointment = await Appointment.create(appointmentData);

        // 4. Prepare Aamarpay payload
        const payload = {
            store_id: process.env.AAMARPAY_STORE_ID || 'aamarpaytest',
            signature_key: process.env.AAMARPAY_SIGNATURE_KEY || 'dbb74894e82415a2f7ff0ec3a97e4183',
            tran_id: transactionId,
            success_url: `${process.env.BACKEND_URL}/api/payment/callback/success?transactionId=${transactionId}`,
            fail_url: `${process.env.BACKEND_URL}/api/payment/callback/fail?transactionId=${transactionId}`,
            cancel_url: `${process.env.BACKEND_URL}/api/payment/callback/cancel?transactionId=${transactionId}`,
            amount: amount.toString(),
            currency: 'BDT',
            desc: `Consultation with Dr. ${doctor.name}`,
            cus_name: req.user ? req.user.name : guestInfo.name,
            cus_email: req.user ? req.user.email : guestInfo.email,
            cus_phone: (req.user ? req.user.phone : guestInfo.phone) || '01700000000',
            type: 'json',
        };

        // 5. Call Aamarpay API
        const response = await axios.post(
            `${process.env.AAMARPAY_BASE_URL || 'https://sandbox.aamarpay.com'}/jsonpost.php`,
            payload
        );

        if (response.data && response.data.result === 'true') {
            res.status(200).json({
                success: true,
                payment_url: response.data.payment_url,
            });
        } else {
            console.error('Aamarpay initiation error:', response.data);
            res.status(400).json({
                success: false,
                message: 'Payment initiation failed',
                error: response.data,
            });
        }
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during payment initiation',
            error: error.message,
        });
    }
};

/**
 * @desc    Handle Aamarpay callback
 * @route   POST /api/payment/callback/:status
 * @access  Public
 */
const paymentCallback = async (req, res) => {
    try {
        const { status } = req.params;
        const { transactionId } = req.query;
        const { pg_txnid, pay_status } = req.body;

        const appointment = await Appointment.findOne({ transactionId });
        if (!appointment) {
            return res.redirect(`${process.env.CLIENT_URL}/payment/fail?message=Appointment not found`);
        }

        if (status === 'success' && pay_status === 'Successful') {
            // Verify payment with Aamarpay Search API
            const verified = await verifyTransaction(transactionId);

            if (verified.success) {
                appointment.paymentStatus = 'paid';
                appointment.status = 'confirmed';
                appointment.pg_txnid = pg_txnid;
                await appointment.save();
                return res.redirect(`${process.env.CLIENT_URL}/payment/success?transactionId=${transactionId}`);
            }
        }

        // Handle failure or cancellation
        appointment.paymentStatus = status === 'fail' ? 'failed' : 'cancelled';
        appointment.status = 'cancelled';
        await appointment.save();

        res.redirect(`${process.env.CLIENT_URL}/payment/${status}?transactionId=${transactionId}`);
    } catch (error) {
        console.error('Payment callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment/fail?message=Error processing payment`);
    }
};

/**
 * @desc    Verify transaction with Aamarpay
 */
const verifyTransaction = async (transactionId) => {
    try {
        const store_id = process.env.AAMARPAY_STORE_ID || 'aamarpaytest';
        const signature_key = process.env.AAMARPAY_SIGNATURE_KEY || 'dbb74894e82415a2f7ff0ec3a97e4183';
        const base_url = process.env.AAMARPAY_BASE_URL || 'https://sandbox.aamarpay.com';

        const url = `${base_url}/api/v1/trxcheck/request.php?request_id=${transactionId}&store_id=${store_id}&signature_key=${signature_key}&type=json`;

        const response = await axios.get(url);

        if (response.data && response.data.pay_status === 'Successful' && response.data.status_code === '2') {
            return { success: true, data: response.data };
        }

        return { success: false, data: response.data };
    } catch (error) {
        console.error('Verify transaction error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    initiatePayment,
    paymentCallback,
};
