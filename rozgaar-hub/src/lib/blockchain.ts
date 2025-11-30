import { ethers } from 'ethers';
import { toast } from 'sonner';

// Contract Addresses (from .env or hardcoded for dev)
// In a real app, these should be environment variables
const ESCROW_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with actual address after deploy
const USER_REGISTRY_ADDRESS = import.meta.env.VITE_USER_REGISTRY_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual address after deploy

// ABIs (Simplified for what we need)
const ESCROW_ABI = [
  "function createEscrow(string memory _jobId, address _worker) external payable returns (uint256)",
  "function confirmCompletion(uint256 _escrowId) external",
  "function releasePayment(uint256 _escrowId) external",
  "function raiseDispute(uint256 _escrowId, string memory _reason) external",
  "function getEscrowByJobId(string memory _jobId) external view returns (tuple(uint256 escrowId, string jobId, address employer, address worker, uint256 amount, uint256 platformFee, uint8 status, uint256 createdAt, uint256 completedAt, uint256 releasedAt, bool workerConfirmed, bool employerApproved, bool disputed, string disputeReason))",
  "event EscrowCreated(uint256 indexed escrowId, string indexed jobId, address indexed employer, address worker, uint256 amount)",
  "event WorkCompleted(uint256 indexed escrowId, address worker)",
  "event PaymentReleased(uint256 indexed escrowId, uint256 amount, uint256 fee)",
  "event DisputeRaised(uint256 indexed escrowId, address raiser, string reason)"
];

export enum EscrowStatus {
  Created,
  Funded,
  Completed,
  Released,
  Disputed,
  Refunded,
  Cancelled
}

export interface EscrowDetails {
  escrowId: number;
  jobId: string;
  employer: string;
  worker: string;
  amount: string;
  status: EscrowStatus;
  workerConfirmed: boolean;
  employerApproved: boolean;
  disputed: boolean;
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private escrowContract: ethers.Contract | null = null;

  constructor() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider) {
      toast.error("MetaMask not installed");
      return null;
    }

    try {
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      this.initializeContracts();
      return address;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return null;
    }
  }

  private initializeContracts() {
    if (!this.signer) return;
    this.escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, this.signer);
  }

  async createEscrow(jobId: string, workerAddress: string, amountEth: string): Promise<boolean> {
    if (!this.escrowContract) {
      await this.connectWallet();
      if (!this.escrowContract) return false;
    }

    try {
      const amountWei = ethers.parseEther(amountEth);
      const tx = await this.escrowContract!.createEscrow(jobId, workerAddress, { value: amountWei });
      toast.info("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      toast.success("Escrow created successfully!");
      return true;
    } catch (error: any) {
      console.error("Error creating escrow:", error);
      toast.error(error.reason || "Failed to create escrow");
      return false;
    }
  }

  async confirmCompletion(escrowId: number): Promise<boolean> {
    if (!this.escrowContract) await this.connectWallet();

    try {
      const tx = await this.escrowContract!.confirmCompletion(escrowId);
      toast.info("Confirming completion...");
      await tx.wait();
      toast.success("Work completion confirmed!");
      return true;
    } catch (error: any) {
      console.error("Error confirming completion:", error);
      toast.error(error.reason || "Failed to confirm completion");
      return false;
    }
  }

  async releasePayment(escrowId: number): Promise<boolean> {
    if (!this.escrowContract) await this.connectWallet();

    try {
      const tx = await this.escrowContract!.releasePayment(escrowId);
      toast.info("Releasing payment...");
      await tx.wait();
      toast.success("Payment released to worker!");
      return true;
    } catch (error: any) {
      console.error("Error releasing payment:", error);
      toast.error(error.reason || "Failed to release payment");
      return false;
    }
  }

  async getEscrowDetails(jobId: string): Promise<EscrowDetails | null> {
    if (!this.provider) return null;

    // Read-only calls don't need a signer, but we need a provider
    // If signer is not set, we can use provider directly with a contract instance connected to provider
    const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, this.provider);

    try {
      const data = await contract.getEscrowByJobId(jobId);
      return {
        escrowId: Number(data.escrowId),
        jobId: data.jobId,
        employer: data.employer,
        worker: data.worker,
        amount: ethers.formatEther(data.amount),
        status: Number(data.status),
        workerConfirmed: data.workerConfirmed,
        employerApproved: data.employerApproved,
        disputed: data.disputed
      };
    } catch (error) {
      // Escrow might not exist for this job
      return null;
    }
  }
  async getWorkerAddress(userId: string): Promise<string | null> {
    if (!this.provider) return null;

    const contract = new ethers.Contract(USER_REGISTRY_ADDRESS, ["function getAddressByUserId(string memory _userId) external view returns (address)"], this.provider);

    try {
      const address = await contract.getAddressByUserId(userId);
      return address === ethers.ZeroAddress ? null : address;
    } catch (error) {
      console.error("Error fetching worker address:", error);
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();
