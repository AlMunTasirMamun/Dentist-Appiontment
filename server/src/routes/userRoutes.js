const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    createUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.delete('/:id', authorize('admin'), deleteUser);

// Admin or Owner routes
router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;
