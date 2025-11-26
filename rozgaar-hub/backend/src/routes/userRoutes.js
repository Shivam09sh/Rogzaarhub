import express from 'express';
import {
    getJobById,
    getUserById,
    submitReview,
    getUserReviews,
    deleteCalendarEvent
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/jobs/:id', getJobById);
router.get('/user/:id', getUserById);
router.get('/reviews/:userId', getUserReviews);

// Protected routes
router.post('/reviews', protect, submitReview);
router.delete('/calendar/:id', protect, deleteCalendarEvent);

export default router;
