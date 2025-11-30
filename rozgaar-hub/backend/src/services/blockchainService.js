import { ethers } from 'ethers';
import logger from '../config/logger.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const RozgaarEscrowABI = require('../abis/RozgaarEscrow.json');
const UserRegistryABI = require('../abis/UserRegistry.json');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.escrowContract = null;
        this.userRegistryContract = null;
        this.platformWallet = null;
        this.initialized = false;
    }

    /**
     * Initialize blockchain connection
     */
    async initialize() {
        try {
            // Connect to blockchain network
            const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Test connection
            const network = await this.provider.getNetwork();
            logger.info(`Connected to blockchain network: ${network.name} (Chain ID: ${network.chainId})`);

            // Initialize platform wallet
            if (process.env.PLATFORM_WALLET_PRIVATE_KEY) {
                this.platformWallet = new ethers.Wallet(
                    process.env.PLATFORM_WALLET_PRIVATE_KEY,
                    this.provider
                );
                logger.info(`Platform wallet initialized: ${this.platformWallet.address}`);
            } else {
                logger.warn('Platform wallet private key not configured');
            }

            // Initialize contracts
            if (process.env.ESCROW_CONTRACT_ADDRESS) {
                this.escrowContract = new ethers.Contract(
                    process.env.ESCROW_CONTRACT_ADDRESS,
                    RozgaarEscrowABI.abi,
                    this.platformWallet || this.provider
                );
                logger.info(`Escrow contract initialized at: ${process.env.ESCROW_CONTRACT_ADDRESS}`);
            }

            if (process.env.USER_REGISTRY_CONTRACT_ADDRESS) {
                this.userRegistryContract = new ethers.Contract(
                    process.env.USER_REGISTRY_CONTRACT_ADDRESS,
                    UserRegistryABI.abi,
                    this.platformWallet || this.provider
                );
                logger.info(`User Registry contract initialized at: ${process.env.USER_REGISTRY_CONTRACT_ADDRESS}`);
            }

            this.initialized = true;
            logger.info('Blockchain service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize blockchain service:', error);
            this.initialized = false;
        }
    }

    /**
     * Check if blockchain service is available
     */
    isAvailable() {
        return this.initialized && this.escrowContract !== null;
    }

    /**
     * Create escrow for a job
     * @param {string} jobId - MongoDB job ID
     * @param {string} workerAddress - Worker's wallet address
     * @param {string} amount - Amount in ETH
     * @returns {Object} - Transaction details
     */
    async createEscrow(jobId, workerAddress, amount) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            logger.info(`Creating escrow for job ${jobId}, worker: ${workerAddress}, amount: ${amount} ETH`);

            // Validate addresses
            if (!ethers.isAddress(workerAddress)) {
                throw new Error('Invalid worker wallet address');
            }

            // Convert amount to Wei
            const amountWei = ethers.parseEther(amount.toString());

            // Create escrow transaction
            const tx = await this.escrowContract.createEscrow(
                jobId,
                workerAddress,
                { value: amountWei }
            );

            logger.info(`Escrow creation transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();
            logger.info(`Escrow created successfully. Gas used: ${receipt.gasUsed.toString()}`);

            // Extract escrow ID from event
            const escrowCreatedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'EscrowCreated'
            );

            let escrowId = null;
            if (escrowCreatedEvent) {
                escrowId = Number(escrowCreatedEvent.args[0]);
                logger.info(`Escrow ID: ${escrowId}`);
            }

            return {
                success: true,
                escrowId,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            logger.error('Error creating escrow:', error);
            throw new Error(`Blockchain escrow creation failed: ${error.message}`);
        }
    }

    /**
     * Get escrow details
     * @param {number} escrowId - Escrow ID
     * @returns {Object} - Escrow details
     */
    async getEscrow(escrowId) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            const escrow = await this.escrowContract.getEscrow(escrowId);

            return {
                escrowId: Number(escrow.escrowId),
                jobId: escrow.jobId,
                employer: escrow.employer,
                worker: escrow.worker,
                amount: ethers.formatEther(escrow.amount),
                platformFee: ethers.formatEther(escrow.platformFee),
                status: this.getEscrowStatusName(Number(escrow.status)),
                workerConfirmed: escrow.workerConfirmed,
                employerApproved: escrow.employerApproved,
                disputed: escrow.disputed,
                createdAt: new Date(Number(escrow.createdAt) * 1000),
                completedAt: escrow.completedAt > 0 ? new Date(Number(escrow.completedAt) * 1000) : null,
                releasedAt: escrow.releasedAt > 0 ? new Date(Number(escrow.releasedAt) * 1000) : null
            };
        } catch (error) {
            logger.error('Error getting escrow:', error);
            throw new Error(`Failed to get escrow details: ${error.message}`);
        }
    }

    /**
     * Worker confirms job completion
     * @param {number} escrowId - Escrow ID
     * @param {string} workerPrivateKey - Worker's private key
     * @returns {Object} - Transaction details
     */
    async confirmCompletion(escrowId, workerPrivateKey) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            const workerWallet = new ethers.Wallet(workerPrivateKey, this.provider);
            const escrowWithWorker = this.escrowContract.connect(workerWallet);

            logger.info(`Worker confirming completion for escrow ${escrowId}`);

            const tx = await escrowWithWorker.confirmCompletion(escrowId);
            const receipt = await tx.wait();

            logger.info(`Completion confirmed. Transaction: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            logger.error('Error confirming completion:', error);
            throw new Error(`Failed to confirm completion: ${error.message}`);
        }
    }

    /**
     * Employer releases payment to worker
     * @param {number} escrowId - Escrow ID
     * @returns {Object} - Transaction details
     */
    async releasePayment(escrowId) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            logger.info(`Releasing payment for escrow ${escrowId}`);

            const tx = await this.escrowContract.releasePayment(escrowId);
            const receipt = await tx.wait();

            logger.info(`Payment released. Transaction: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            logger.error('Error releasing payment:', error);
            throw new Error(`Failed to release payment: ${error.message}`);
        }
    }

    /**
     * Raise a dispute
     * @param {number} escrowId - Escrow ID
     * @param {string} reason - Dispute reason
     * @param {string} userPrivateKey - User's private key (employer or worker)
     * @returns {Object} - Transaction details
     */
    async raiseDispute(escrowId, reason, userPrivateKey) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            const userWallet = new ethers.Wallet(userPrivateKey, this.provider);
            const escrowWithUser = this.escrowContract.connect(userWallet);

            logger.info(`Raising dispute for escrow ${escrowId}: ${reason}`);

            const tx = await escrowWithUser.raiseDispute(escrowId, reason);
            const receipt = await tx.wait();

            logger.info(`Dispute raised. Transaction: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            logger.error('Error raising dispute:', error);
            throw new Error(`Failed to raise dispute: ${error.message}`);
        }
    }

    /**
     * Resolve dispute (admin only)
     * @param {number} escrowId - Escrow ID
     * @param {boolean} releaseToWorker - True to release to worker, false to refund employer
     * @returns {Object} - Transaction details
     */
    async resolveDispute(escrowId, releaseToWorker) {
        try {
            if (!this.isAvailable()) {
                throw new Error('Blockchain service not available');
            }

            logger.info(`Resolving dispute for escrow ${escrowId}, release to worker: ${releaseToWorker}`);

            const tx = await this.escrowContract.resolveDispute(escrowId, releaseToWorker);
            const receipt = await tx.wait();

            logger.info(`Dispute resolved. Transaction: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            logger.error('Error resolving dispute:', error);
            throw new Error(`Failed to resolve dispute: ${error.message}`);
        }
    }

    /**
     * Register user on blockchain
     * @param {string} userId - MongoDB user ID
     * @param {string} profileHash - IPFS hash of profile
     * @param {string} role - User role (worker/employer)
     * @param {string} userPrivateKey - User's private key
     * @returns {Object} - Transaction details
     */
    async registerUser(userId, profileHash, role, userPrivateKey) {
        try {
            if (!this.userRegistryContract) {
                throw new Error('User Registry contract not available');
            }

            const userWallet = new ethers.Wallet(userPrivateKey, this.provider);
            const registryWithUser = this.userRegistryContract.connect(userWallet);

            logger.info(`Registering user ${userId} on blockchain`);

            const tx = await registryWithUser.registerUser(userId, profileHash, role);
            const receipt = await tx.wait();

            logger.info(`User registered. Transaction: ${tx.hash}`);

            return {
                success: true,
                transactionHash: tx.hash,
                walletAddress: userWallet.address
            };
        } catch (error) {
            logger.error('Error registering user:', error);
            throw new Error(`Failed to register user: ${error.message}`);
        }
    }

    /**
     * Get escrow status name
     * @param {number} status - Status code
     * @returns {string} - Status name
     */
    getEscrowStatusName(status) {
        const statuses = ['Created', 'Funded', 'Completed', 'Released', 'Disputed', 'Refunded', 'Cancelled'];
        return statuses[status] || 'Unknown';
    }

    /**
     * Listen to escrow events
     * @param {Function} callback - Callback function for events
     */
    listenToEscrowEvents(callback) {
        if (!this.isAvailable()) {
            logger.warn('Cannot listen to events: Blockchain service not available');
            return;
        }

        // Listen to EscrowCreated events
        this.escrowContract.on('EscrowCreated', (escrowId, jobId, employer, worker, amount, event) => {
            logger.info(`EscrowCreated event: ${escrowId}`);
            callback('EscrowCreated', { escrowId, jobId, employer, worker, amount, event });
        });

        // Listen to PaymentReleased events
        this.escrowContract.on('PaymentReleased', (escrowId, amount, fee, event) => {
            logger.info(`PaymentReleased event: ${escrowId}`);
            callback('PaymentReleased', { escrowId, amount, fee, event });
        });

        // Listen to DisputeRaised events
        this.escrowContract.on('DisputeRaised', (escrowId, raiser, reason, event) => {
            logger.info(`DisputeRaised event: ${escrowId}`);
            callback('DisputeRaised', { escrowId, raiser, reason, event });
        });

        logger.info('Listening to blockchain events');
    }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
