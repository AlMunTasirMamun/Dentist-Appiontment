const express = require('express');
const router = express.Router();
const {
    createMessage,
    getAllMessages,
    updateMessageStatus,
    deleteMessage,
} = require('../controllers/contactController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Public route for creating messages
router.post('/', createMessage);

// Protected admin routes for managing messages
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllMessages);
router.route('/:id')
    .put(updateMessageStatus)
    .delete(deleteMessage);

module.exports = router;
