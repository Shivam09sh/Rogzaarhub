import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Payment from '../models/Payment.js';
import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';

// @desc    Get worker profile
// @route   GET /api/worker/profile
// @access  Private (Worker)
export const getWorkerProfile = async (req, res) => {
    try {
        const worker = await User.findById(req.user._id);
        res.json({
            success: true,
            worker: worker.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching worker profile'
        });
    }
};

// @desc    Browse available jobs
// @route   GET /api/worker/jobs
// @access  Private (Worker)
export const browseJobs = async (req, res) => {
    try {
        const { location, skills, minPay, maxPay, payType, status } = req.query;

        let query = { status: status || 'open' };

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (skills) {
            const skillsArray = skills.split(',');
            query.requiredSkills = { $in: skillsArray };
        }

        if (minPay || maxPay) {
            query.payAmount = {};
            if (minPay) query.payAmount.$gte = Number(minPay);
            if (maxPay) query.payAmount.$lte = Number(maxPay);
        }

        if (payType) {
            query.payType = payType;
        }

        const jobs = await Job.find(query)
            .populate('employerId', 'name companyName profilePhoto rating')
            .sort({ postedDate: -1 })
            .limit(50);

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
            error: error.message
        });
    }
};

// @desc    Apply to a job
// @route   POST /api/worker/apply/:jobId
// @access  Private (Worker)
export const applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { message, teamMembers } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            jobId,
            workerId: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Create application
        const application = await Application.create({
            jobId,
            workerId: req.user._id,
            workerName: req.user.name,
            workerPhone: req.user.phone,
            workerPhoto: req.user.profilePhoto,
            message: message || '',
            teamMembers: teamMembers || []
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
};

// @desc    Get my applications
// @route   GET /api/worker/applications
// @access  Private (Worker)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ workerId: req.user._id })
            .populate('jobId')
            .sort({ appliedDate: -1 });

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
};

// @desc    Get calendar events
// @route   GET /api/worker/calendar
// @access  Private (Worker)
export const getCalendarEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find({ userId: req.user._id })
            .populate('jobId', 'title location')
            .sort({ start: 1 });

        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar events'
        });
    }
};

// @desc    Create calendar event
// @route   POST /api/worker/calendar
// @access  Private (Worker)
export const createCalendarEvent = async (req, res) => {
    try {
        const { title, start, end, jobId, color, description, location } = req.body;

        const event = await CalendarEvent.create({
            title,
            start,
            end,
            jobId,
            userId: req.user._id,
            color: color || '#FF9933',
            description: description || '',
            location: location || ''
        });

        res.status(201).json({
            success: true,
            message: 'Calendar event created',
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating calendar event',
            error: error.message
        });
    }
};

// @desc    Get earnings summary
// @route   GET /api/worker/earnings
// @access  Private (Worker)
export const getEarnings = async (req, res) => {
    try {
        const payments = await Payment.find({ workerId: req.user._id });

        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
        const paidAmount = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        res.json({
            success: true,
            earnings: {
                total: totalEarnings,
                paid: paidAmount,
                pending: pendingAmount,
                payments: payments.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings'
        });
    }
};

// @desc    Get payment history
// @route   GET /api/worker/payments
// @access  Private (Worker)
export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ workerId: req.user._id })
            .populate('jobId', 'title')
            .populate('employerId', 'name companyName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
};
