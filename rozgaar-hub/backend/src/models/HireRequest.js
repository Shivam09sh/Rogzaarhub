import mongoose from 'mongoose';

const hireRequestSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    employerName: {
        type: String,
        required: true
    },
    employerPhoto: {
        type: String,
        default: ''
    },
    employerPhoneNumber: {
        type: String,
        default: ''
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
    },
    jobTitle: {
        type: String,
        default: ''
    },
    jobDescription: {
        type: String,
        default: ''
    },
    jobLocation: {
        state: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        }
    },
    salaryType: {
        type: String,
        enum: ['hourly', 'daily', 'fixed', ''],
        default: ''
    },
    salaryAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient querying
hireRequestSchema.index({ employerId: 1, workerId: 1 });
hireRequestSchema.index({ workerId: 1, status: 1 });

const HireRequest = mongoose.model('HireRequest', hireRequestSchema);

export default HireRequest;
