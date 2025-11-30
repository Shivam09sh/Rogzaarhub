import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['worker', 'employer'],
        required: [true, 'Role is required']
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },
    // Blockchain fields
    walletAddress: {
        type: String,
        default: '',
        lowercase: true,
        sparse: true,
        index: true
    },
    blockchainUserId: {
        type: String,
        default: ''
    },
    // Worker-specific fields
    skills: [{
        type: String
    }],
    location: {
        type: String,
        default: ''
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    dailyRate: {
        type: Number,
        default: 0
    },
    bio: {
        type: String,
        default: ''
    },
    workPhotos: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        enum: ['bronze', 'silver', 'gold'],
        default: 'bronze'
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    // Employer-specific fields
    companyName: {
        type: String,
        default: ''
    },
    projectsPosted: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
