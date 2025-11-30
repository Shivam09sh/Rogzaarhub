import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'bank_transfer', 'other'],
        default: 'cash'
    },
    transactionId: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    // Blockchain fields
    escrowId: {
        type: Number,
        default: null
    },
    blockchainTxHash: {
        type: String,
        default: ''
    },
    blockchainStatus: {
        type: String,
        enum: ['none', 'created', 'funded', 'completed', 'released', 'disputed', 'refunded'],
        default: 'none'
    },
    useBlockchain: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for queries
paymentSchema.index({ workerId: 1, status: 1 });
paymentSchema.index({ employerId: 1 });
paymentSchema.index({ jobId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
