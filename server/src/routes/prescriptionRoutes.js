const express = require('express');
const router = express.Router();
const {
    createPrescription,
    getPatientPrescriptions,
    getPrescription,
    getPrescriptionByAppointment,
    downloadPrescription,
    downloadPrescriptionPDF,
    updatePrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { handlePrescriptionUpload } = require('../middlewares/prescriptionUploadMiddleware');

router.use(protect);

router.post('/', authorize('doctor'), handlePrescriptionUpload, createPrescription);
router.put('/:id', authorize('doctor'), handlePrescriptionUpload, updatePrescription);
router.get('/patient/:patientId', getPatientPrescriptions);
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);
router.get('/:id/download', downloadPrescription);
router.get('/:id/pdf', downloadPrescriptionPDF);
router.get('/:id', getPrescription);

module.exports = router;
