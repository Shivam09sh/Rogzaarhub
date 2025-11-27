import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, language } = req.body;

        // Log incoming request data
        console.log('📝 Registration request:', { name, email, phone, role, language });

        // Validation
        if (!name || !email || !password || !phone || !role) {
            console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password, phone: !!phone, role: !!role });
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        console.log('✅ Creating user with data:', { name, email, phone, role, language: language || 'en' });
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
            language: language || 'en'
        });

        // Generate token
        const token = generateToken(user._id);

        console.log('✅ User created successfully:', user._id);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('❌ Register error:', error);
        console.error('❌ Error details:', error.errors);

        // Extract validation error messages
        let errorMessage = 'Error registering user';
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            errorMessage = validationErrors.join(', ');
        } else if (error.code === 11000) {
            // Duplicate key error (unique constraint)
            errorMessage = 'User already exists with this email';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
            details: error.errors
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow updating sensitive fields
        delete updates.password;
        delete updates.email;
        delete updates.role;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};
