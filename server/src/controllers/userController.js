const User = require('../models/User');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin or Owner
 */
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is admin or the owner
        if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this user',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin or Owner
 */
const updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if user is admin or the owner
        if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user',
            });
        }

        // Fields that can be updated
        const { name, phone } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        // Only admin can update role
        if (req.user.role === 'admin' && req.body.role) {
            updateData.role = req.body.role;
        }

        user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Create user (Admin only)
 * @route   POST /api/users
 * @access  Admin
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'client',
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    createUser,
};
