import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const { read, limit = 50 } = req.query;

        let query = { userId: req.user._id };

        // Filter by read status if provided
        if (read !== undefined) {
            query.read = read === 'true';
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await Notification.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
export const deleteReadNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({
            userId: req.user._id,
            read: true
        });

        res.json({
            success: true,
            message: `${result.deletedCount} notifications deleted`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting notifications',
            error: error.message
        });
    }
};
