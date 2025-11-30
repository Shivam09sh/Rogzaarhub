import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Registration validation
export const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['worker', 'employer']).withMessage('Role must be either worker or employer'),
    body('language')
        .optional()
        .isIn(['en', 'hi']).withMessage('Language must be either en or hi'),
    validate
];

// Login validation
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Job creation validation
export const validateJobCreation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Job description is required')
        .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required'),
    body('payAmount')
        .notEmpty().withMessage('Pay amount is required')
        .isFloat({ min: 0 }).withMessage('Pay amount must be a positive number'),
    body('payType')
        .notEmpty().withMessage('Pay type is required')
        .isIn(['hourly', 'daily', 'fixed']).withMessage('Pay type must be hourly, daily, or fixed'),
    body('duration')
        .notEmpty().withMessage('Duration is required'),
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Please provide a valid date'),
    body('requiredSkills')
        .optional()
        .isArray().withMessage('Required skills must be an array'),
    validate
];

// Application validation
export const validateApplication = [
    param('jobId')
        .notEmpty().withMessage('Job ID is required')
        .isMongoId().withMessage('Invalid job ID'),
    body('message')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Message must not exceed 500 characters'),
    validate
];

// Payment creation validation
export const validatePaymentCreation = [
    body('jobId')
        .notEmpty().withMessage('Job ID is required')
        .isMongoId().withMessage('Invalid job ID'),
    body('workerId')
        .notEmpty().withMessage('Worker ID is required')
        .isMongoId().withMessage('Invalid worker ID'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('dueDate')
        .notEmpty().withMessage('Due date is required')
        .isISO8601().withMessage('Please provide a valid date'),
    validate
];

// Pagination validation
export const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
];

// MongoDB ID validation
export const validateMongoId = [
    param('id')
        .notEmpty().withMessage('ID is required')
        .isMongoId().withMessage('Invalid ID format'),
    validate
];
