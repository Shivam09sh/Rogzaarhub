import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token and attach user to request
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Require worker role
export const requireWorker = (req, res, next) => {
    if (req.user && req.user.role === 'worker') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Worker role required.'
        });
    }
};

// Require employer role
export const requireEmployer = (req, res, next) => {
    if (req.user && req.user.role === 'employer') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Employer role required.'
        });
    }
};
