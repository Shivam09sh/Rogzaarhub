import express from 'express';
import {
    initializeBlockchain,
    getBlockchainStatus,
    createJobEscrow,
    getEscrowDetails,
    confirmJobCompletion,
    releaseEscrowPayment,
    raiseEscrowDispute,
    registerUserOnBlockchain
} from '../controllers/blockchainController.js';
import { protect, requireEmployer, requireWorker } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/status', getBlockchainStatus);

// Protected routes
router.post('/init', protect, initializeBlockchain);
router.post('/user/register', protect, registerUserOnBlockchain);

// Escrow routes
router.post('/escrow/create', protect, requireEmployer, createJobEscrow);
router.get('/escrow/:escrowId', protect, getEscrowDetails);
router.post('/escrow/:escrowId/confirm', protect, requireWorker, confirmJobCompletion);
router.post('/escrow/:escrowId/release', protect, requireEmployer, releaseEscrowPayment);
router.post('/escrow/:escrowId/dispute', protect, raiseEscrowDispute);

export default router;
