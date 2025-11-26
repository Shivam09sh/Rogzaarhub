import Job from '../models/Job.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import CalendarEvent from '../models/CalendarEvent.js';

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employerId', 'name companyName profilePhoto rating phone email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job details'
        });
    }
};

// @desc    Get user profile by ID
// @route   GET /api/user/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

// @desc    Submit review
// @route   POST /api/reviews
// @access  Private
export const submitReview = async (req, res) => {
    try {
        const { jobId, revieweeId, rating, comment, reviewType } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const review = await Review.create({
            jobId,
            reviewerId: req.user._id,
            reviewerName: req.user.name,
            revieweeId,
            rating,
            comment: comment || '',
            reviewType
        });

        // Update user's average rating
        const userReviews = await Review.find({ revieweeId });
        const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;

        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avgRating * 10) / 10
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this user for this job'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error submitting review',
            error: error.message
        });
    }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
// @access  Public
export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ revieweeId: req.params.userId })
            .populate('reviewerId', 'name profilePhoto')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private
export const deleteCalendarEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or unauthorized'
            });
        }

        await CalendarEvent.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
};
