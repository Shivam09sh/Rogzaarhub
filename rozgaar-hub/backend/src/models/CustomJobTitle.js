import mongoose from 'mongoose';

const customJobTitleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Job title must be at least 2 characters'],
        maxlength: [100, 'Job title must not exceed 100 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
customJobTitleSchema.index({ title: 1 });

export default mongoose.model('CustomJobTitle', customJobTitleSchema);

