const express = require('express');
const router = express.Router();
const {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorAvailability,
} = require('../controllers/doctorController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { handleUpload } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/availability', getDoctorAvailability);

// Admin only routes (with image upload support)
router.post('/', protect, authorize('admin'), handleUpload, createDoctor);
router.put('/:id', protect, authorize('admin'), handleUpload, updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;

