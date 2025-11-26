import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// @desc    Get employer profile
// @route   GET /api/employer/profile
// @access  Private (Employer)
export const getEmployerProfile = async (req, res) => {
    try {
        const employer = await User.findById(req.user._id);
        res.json({
            success: true,
            employer: employer.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employer profile'
        });
    }
};

// @desc    Create job posting
// @route   POST /api/employer/jobs
// @access  Private (Employer)
export const createJob = async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            employerId: req.user._id,
            employerName: req.user.companyName || req.user.name,
            employerPhoto: req.user.profilePhoto
        };

        const job = await Job.create(jobData);

        // Update employer's projects posted count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { projectsPosted: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating job',
            error: error.message
        });
    }
};

// @desc    Get my job postings
// @route   GET /api/employer/jobs
// @access  Private (Employer)
export const getMyJobs = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { employerId: req.user._id };
        if (status) {
            query.status = status;
        }

        const jobs = await Job.find(query).sort({ postedDate: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs'
        });
    }
};

// @desc    Update job posting
// @route   PUT /api/employer/jobs/:id
// @access  Private (Employer)
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            employerId: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
};

// @desc    Delete job posting
// @route   DELETE /api/employer/jobs/:id
// @access  Private (Employer)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            employerId: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        await Job.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting job'
        });
    }
};

// @desc    Search workers
// @route   GET /api/employer/workers
// @access  Private (Employer)
export const searchWorkers = async (req, res) => {
    try {
        const { skills, location, minRating, verified } = req.query;

        let query = { role: 'worker' };

        if (skills) {
            const skillsArray = skills.split(',');
            query.skills = { $in: skillsArray };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (minRating) {
            query.rating = { $gte: Number(minRating) };
        }

        if (verified === 'true') {
            query.verified = true;
        }

        const workers = await User.find(query)
            .select('-password')
            .sort({ rating: -1, completedJobs: -1 })
            .limit(50);

        res.json({
            success: true,
            count: workers.length,
            workers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching workers',
            error: error.message
        });
    }
};

// @desc    Get applications for a job
// @route   GET /api/employer/applications/:jobId
// @access  Private (Employer)
export const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Verify job belongs to employer
        const job = await Job.findOne({
            _id: jobId,
            employerId: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        const applications = await Application.find({ jobId })
            .populate('workerId', 'name phone profilePhoto skills rating completedJobs verified')
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

// @desc    Accept/reject application
// @route   PUT /api/employer/applications/:id
// @access  Private (Employer)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const application = await Application.findById(req.params.id).populate('jobId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify job belongs to employer
        if (application.jobId.employerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        application.status = status;
        await application.save();

        // If accepted, update job status and create calendar event
        if (status === 'accepted') {
            await Job.findByIdAndUpdate(application.jobId._id, {
                status: 'in-progress'
            });

            // Create calendar event for worker
            await CalendarEvent.create({
                title: application.jobId.title,
                start: application.jobId.startDate,
                end: application.jobId.endDate || application.jobId.startDate,
                jobId: application.jobId._id,
                userId: application.workerId,
                location: application.jobId.location
            });
        }

        res.json({
            success: true,
            message: `Application ${status}`,
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating application',
            error: error.message
        });
    }
};

// @desc    Create payment record
// @route   POST /api/employer/payments
// @access  Private (Employer)
export const createPayment = async (req, res) => {
    try {
        const { jobId, workerId, amount, dueDate, paymentMethod, notes } = req.body;

        const payment = await Payment.create({
            jobId,
            workerId,
            employerId: req.user._id,
            amount,
            dueDate,
            paymentMethod: paymentMethod || 'cash',
            notes: notes || ''
        });

        // Update worker's total earnings
        await User.findByIdAndUpdate(workerId, {
            $inc: { totalEarnings: amount }
        });

        res.status(201).json({
            success: true,
            message: 'Payment record created',
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error.message
        });
    }
};

// @desc    Get employer analytics
// @route   GET /api/employer/analytics
// @access  Private (Employer)
export const getAnalytics = async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments({ employerId: req.user._id });
        const activeJobs = await Job.countDocuments({
            employerId: req.user._id,
            status: 'in-progress'
        });
        const completedJobs = await Job.countDocuments({
            employerId: req.user._id,
            status: 'completed'
        });

        const totalApplications = await Application.countDocuments({
            jobId: { $in: await Job.find({ employerId: req.user._id }).distinct('_id') }
        });

        const totalPayments = await Payment.find({ employerId: req.user._id });
        const totalSpent = totalPayments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            success: true,
            analytics: {
                totalJobs,
                activeJobs,
                completedJobs,
                totalApplications,
                totalSpent,
                paymentsCount: totalPayments.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
};
