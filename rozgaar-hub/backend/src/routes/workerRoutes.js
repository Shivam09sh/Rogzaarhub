import express from 'express';
import {
    getWorkerProfile,
    browseJobs,
    applyToJob,
    getMyApplications,
    getCalendarEvents,
    createCalendarEvent,
    getEarnings,
    getPayments,
    getHireRequests,
    updateHireRequestStatus
} from '../controllers/workerController.js';
import { protect, requireWorker } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and worker role
router.use(protect);
router.use(requireWorker);

router.get('/profile', getWorkerProfile);
router.get('/jobs', browseJobs);
router.post('/apply/:jobId', applyToJob);
router.get('/applications', getMyApplications);
router.get('/calendar', getCalendarEvents);
router.post('/calendar', createCalendarEvent);
router.get('/earnings', getEarnings);
router.get('/payments', getPayments);
router.get('/hire-requests', getHireRequests);
router.put('/hire-requests/:id', updateHireRequestStatus);

export default router;
