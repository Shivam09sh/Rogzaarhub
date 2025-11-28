import express from 'express';
import {
    getJobById,
    getUserById,
    submitReview,
    getUserReviews,
    deleteCalendarEvent
} from '../controllers/userController.js';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteReadNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/jobs/:id', getJobById);
router.get('/user/:id', getUserById);
router.get('/reviews/:userId', getUserReviews);

// Protected routes
router.post('/reviews', protect, submitReview);
router.delete('/calendar/:id', protect, deleteCalendarEvent);

// Notification routes
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsAsRead);
router.put('/notifications/:id/read', protect, markNotificationAsRead);
router.delete('/notifications/read', protect, deleteReadNotifications);
router.delete('/notifications/:id', protect, deleteNotification);

export default router;
