const express = require('express');
const router = express.Router();
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getMyAppointments,
    getAppointmentsByDoctor,
} = require('../controllers/appointmentController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Public route with optional auth (for both guests and logged-in users)
router.post('/', optionalAuth, createAppointment);

// Protected routes
router.get('/my', protect, authorize('client', 'doctor'), getMyAppointments);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

// Admin only route
router.get('/doctor/:doctorId', protect, authorize('admin'), getAppointmentsByDoctor);

module.exports = router;
