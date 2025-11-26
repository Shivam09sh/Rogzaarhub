import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewerName: {
        type: String,
        required: true
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    reviewType: {
        type: String,
        enum: ['worker_review', 'employer_review'],
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews for same job
reviewSchema.index({ jobId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
