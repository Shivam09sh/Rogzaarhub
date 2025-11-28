import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['application', 'job_update', 'payment', 'message', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // Can reference different models based on type
    },
    relatedModel: {
        type: String,
        enum: ['Application', 'Job', 'Payment', 'Message', 'HireRequest']
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
