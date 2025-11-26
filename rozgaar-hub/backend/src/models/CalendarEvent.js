import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        default: '#FF9933'
    },
    description: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for user queries
calendarEventSchema.index({ userId: 1, start: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
