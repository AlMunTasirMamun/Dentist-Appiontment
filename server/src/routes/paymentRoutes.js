const express = require('express');
const router = express.Router();
const { initiatePayment, paymentCallback } = require('../controllers/paymentController');
const { optionalAuth } = require('../middlewares/authMiddleware');

// Route to initiate payment (works for both logged-in users and guests)
router.post('/initiate', optionalAuth, initiatePayment);

// Callback routes (called by Aamarpay)
// Note: These must be POST routes as per Aamarpay documentation
router.post('/callback/:status', paymentCallback);

module.exports = router;
