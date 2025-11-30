import blockchainService from '../services/blockchainService.js';
import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * @desc    Initialize blockchain service
 * @route   POST /api/blockchain/init
 * @access  Private (Admin)
 */
export const initializeBlockchain = async (req, res, next) => {
    try {
        await blockchainService.initialize();

        res.json({
            success: true,
            message: 'Blockchain service initialized',
            available: blockchainService.isAvailable()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get blockchain service status
 * @route   GET /api/blockchain/status
 * @access  Public
 */
export const getBlockchainStatus = async (req, res) => {
    res.json({
        success: true,
        available: blockchainService.isAvailable(),
        network: process.env.BLOCKCHAIN_NETWORK || 'not configured'
    });
};

/**
 * @desc    Create escrow for job payment
 * @route   POST /api/blockchain/escrow/create
 * @access  Private (Employer)
 */
export const createJobEscrow = async (req, res, next) => {
    try {
        const { jobId, workerId, amount } = req.body;

        // Validate inputs
        if (!jobId || !workerId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Job ID, worker ID, and amount are required'
            });
        }

        // Verify job belongs to employer
        const job = await Job.findOne({
            _id: jobId,
            employerId: req.user._id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        // Get worker details
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({
                success: false,
                message: 'Worker not found'
            });
        }

        // Check if worker has wallet address
        if (!worker.walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Worker does not have a wallet address registered'
            });
        }

        // Create escrow on blockchain
        const result = await blockchainService.createEscrow(
            jobId,
            worker.walletAddress,
            amount
        );

        // Create payment record in database
        const payment = await Payment.create({
            jobId,
            workerId,
            employerId: req.user._id,
            amount,
            status: 'pending',
            dueDate: job.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            useBlockchain: true,
            escrowId: result.escrowId,
            blockchainTxHash: result.transactionHash,
            blockchainStatus: 'funded'
        });

        // Update job with escrow ID
        job.escrowId = result.escrowId;
        job.useBlockchain = true;
        await job.save();

        logger.info(`Escrow created for job ${jobId}, escrow ID: ${result.escrowId}`);

        res.status(201).json({
            success: true,
            message: 'Escrow created successfully',
            escrowId: result.escrowId,
            transactionHash: result.transactionHash,
            payment
        });
    } catch (error) {
        logger.error('Error creating job escrow:', error);
        next(error);
    }
};

/**
 * @desc    Get escrow details
 * @route   GET /api/blockchain/escrow/:escrowId
 * @access  Private
 */
export const getEscrowDetails = async (req, res, next) => {
    try {
        const { escrowId } = req.params;

        const escrowDetails = await blockchainService.getEscrow(Number(escrowId));

        res.json({
            success: true,
            escrow: escrowDetails
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Worker confirms job completion
 * @route   POST /api/blockchain/escrow/:escrowId/confirm
 * @access  Private (Worker)
 */
export const confirmJobCompletion = async (req, res, next) => {
    try {
        const { escrowId } = req.params;
        const { privateKey } = req.body;

        if (!privateKey) {
            return res.status(400).json({
                success: false,
                message: 'Private key is required'
            });
        }

        // Find payment record
        const payment = await Payment.findOne({ escrowId: Number(escrowId) });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify worker
        if (payment.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Confirm completion on blockchain
        const result = await blockchainService.confirmCompletion(Number(escrowId), privateKey);

        // Update payment status
        payment.blockchainStatus = 'completed';
        await payment.save();

        res.json({
            success: true,
            message: 'Job completion confirmed',
            transactionHash: result.transactionHash
        });
    } catch (error) {
        logger.error('Error confirming completion:', error);
        next(error);
    }
};

/**
 * @desc    Release payment to worker
 * @route   POST /api/blockchain/escrow/:escrowId/release
 * @access  Private (Employer)
 */
export const releaseEscrowPayment = async (req, res, next) => {
    try {
        const { escrowId } = req.params;

        // Find payment record
        const payment = await Payment.findOne({ escrowId: Number(escrowId) });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify employer
        if (payment.employerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Release payment on blockchain
        const result = await blockchainService.releasePayment(Number(escrowId));

        // Update payment status
        payment.status = 'paid';
        payment.paidDate = new Date();
        payment.blockchainStatus = 'released';
        payment.blockchainTxHash = result.transactionHash;
        await payment.save();

        // Update worker's total earnings
        await User.findByIdAndUpdate(payment.workerId, {
            $inc: { totalEarnings: payment.amount }
        });

        res.json({
            success: true,
            message: 'Payment released successfully',
            transactionHash: result.transactionHash
        });
    } catch (error) {
        logger.error('Error releasing payment:', error);
        next(error);
    }
};

/**
 * @desc    Raise dispute on escrow
 * @route   POST /api/blockchain/escrow/:escrowId/dispute
 * @access  Private
 */
export const raiseEscrowDispute = async (req, res, next) => {
    try {
        const { escrowId } = req.params;
        const { reason, privateKey } = req.body;

        if (!reason || !privateKey) {
            return res.status(400).json({
                success: false,
                message: 'Reason and private key are required'
            });
        }

        // Find payment record
        const payment = await Payment.findOne({ escrowId: Number(escrowId) });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify user is employer or worker
        const isEmployer = payment.employerId.toString() === req.user._id.toString();
        const isWorker = payment.workerId.toString() === req.user._id.toString();

        if (!isEmployer && !isWorker) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Raise dispute on blockchain
        const result = await blockchainService.raiseDispute(Number(escrowId), reason, privateKey);

        // Update payment status
        payment.blockchainStatus = 'disputed';
        await payment.save();

        res.json({
            success: true,
            message: 'Dispute raised successfully',
            transactionHash: result.transactionHash
        });
    } catch (error) {
        logger.error('Error raising dispute:', error);
        next(error);
    }
};

/**
 * @desc    Register user on blockchain
 * @route   POST /api/blockchain/user/register
 * @access  Private
 */
export const registerUserOnBlockchain = async (req, res, next) => {
    try {
        const { privateKey, profileHash } = req.body;

        if (!privateKey) {
            return res.status(400).json({
                success: false,
                message: 'Private key is required'
            });
        }

        // Register user on blockchain
        const result = await blockchainService.registerUser(
            req.user._id.toString(),
            profileHash || '',
            req.user.role,
            privateKey
        );

        // Update user with wallet address
        req.user.walletAddress = result.walletAddress;
        req.user.blockchainUserId = req.user._id.toString();
        await req.user.save();

        res.json({
            success: true,
            message: 'User registered on blockchain',
            walletAddress: result.walletAddress,
            transactionHash: result.transactionHash
        });
    } catch (error) {
        logger.error('Error registering user on blockchain:', error);
        next(error);
    }
};

