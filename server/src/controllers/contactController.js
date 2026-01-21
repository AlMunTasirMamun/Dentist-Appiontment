const ContactMessage = require('../models/ContactMessage');

/**
 * @desc    Create a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
exports.createMessage = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        const contactMessage = await ContactMessage.create({
            name,
            email,
            message,
        });

        res.status(201).json({
            success: true,
            data: contactMessage,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all contact messages
 * @route   GET /api/contact
 * @access  Private/Admin
 */
exports.getAllMessages = async (req, res, next) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update message status
 * @route   PUT /api/contact/:id
 * @access  Private/Admin
 */
exports.updateMessageStatus = async (req, res, next) => {
    try {
        let message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        message = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        next(err);
    }
};
