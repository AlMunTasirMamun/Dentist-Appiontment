const express = require('express');
const router = express.Router();
const {
    createRefundRequest,
    getRefundRequests,
    getPendingRefundCount,
    getMyRefundRequests,
    approveRefund,
    rejectRefund,
    getRefundRequest,
} = require('../controllers/refundController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/request', authorize('client'), createRefundRequest);
router.get('/my-requests', authorize('client'), getMyRefundRequests);

// Admin routes
router.get('/', authorize('admin'), getRefundRequests);
router.get('/pending-count', authorize('admin'), getPendingRefundCount);
router.put('/:id/approve', authorize('admin'), approveRefund);
router.put('/:id/reject', authorize('admin'), rejectRefund);

// Common route
router.get('/:id', getRefundRequest);

module.exports = router;
