const express = require('express');
const router = express.Router();
const {
    createPrescription,
    getPatientPrescriptions,
    getPrescription,
    getPrescriptionByAppointment,
} = require('../controllers/prescriptionController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/patient/:patientId', getPatientPrescriptions);
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);
router.get('/:id', getPrescription);

module.exports = router;
