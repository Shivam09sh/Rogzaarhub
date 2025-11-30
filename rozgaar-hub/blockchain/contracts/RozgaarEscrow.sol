// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RozgaarEscrow
 * @dev Escrow contract for secure job payments between employers and workers
 * @notice This contract holds payments in escrow until job completion is confirmed
 */
contract RozgaarEscrow is ReentrancyGuard, Ownable, Pausable {
    
    // Escrow status enum
    enum EscrowStatus {
        Created,
        Funded,
        Completed,
        Released,
        Disputed,
        Refunded,
        Cancelled
    }
    
    // Escrow structure
    struct Escrow {
        uint256 escrowId;
        string jobId;
        address employer;
        address worker;
        uint256 amount;
        uint256 platformFee;
        EscrowStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 releasedAt;
        bool workerConfirmed;
        bool employerApproved;
        bool disputed;
        string disputeReason;
    }
    
    // State variables
    uint256 public escrowCounter;
    uint256 public platformFeePercentage = 250; // 2.5% (basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public disputeTimeoutDays = 7;
    
    // Mappings
    mapping(uint256 => Escrow) public escrows;
    mapping(string => uint256) public jobIdToEscrowId;
    mapping(address => uint256[]) public employerEscrows;
    mapping(address => uint256[]) public workerEscrows;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        string indexed jobId,
        address indexed employer,
        address worker,
        uint256 amount
    );
    
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event WorkCompleted(uint256 indexed escrowId, address worker);
    event PaymentApproved(uint256 indexed escrowId, address employer);
    event PaymentReleased(uint256 indexed escrowId, uint256 amount, uint256 fee);
    event DisputeRaised(uint256 indexed escrowId, address raiser, string reason);
    event DisputeResolved(uint256 indexed escrowId, address winner);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId);
    event PlatformFeeUpdated(uint256 newFee);
    
    // Modifiers
    modifier onlyEmployer(uint256 _escrowId) {
        require(escrows[_escrowId].employer == msg.sender, "Not the employer");
        _;
    }
    
    modifier onlyWorker(uint256 _escrowId) {
        require(escrows[_escrowId].worker == msg.sender, "Not the worker");
        _;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId > 0 && _escrowId <= escrowCounter, "Escrow does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new escrow for a job
     * @param _jobId Unique job identifier from backend
     * @param _worker Address of the worker
     */
    function createEscrow(
        string memory _jobId,
        address _worker
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(_worker != address(0), "Invalid worker address");
        require(_worker != msg.sender, "Employer cannot be worker");
        require(msg.value > 0, "Amount must be greater than 0");
        require(jobIdToEscrowId[_jobId] == 0, "Escrow already exists for this job");
        
        escrowCounter++;
        uint256 escrowId = escrowCounter;
        
        uint256 platformFee = (msg.value * platformFeePercentage) / FEE_DENOMINATOR;
        uint256 workerAmount = msg.value - platformFee;
        
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            jobId: _jobId,
            employer: msg.sender,
            worker: _worker,
            amount: workerAmount,
            platformFee: platformFee,
            status: EscrowStatus.Funded,
            createdAt: block.timestamp,
            completedAt: 0,
            releasedAt: 0,
            workerConfirmed: false,
            employerApproved: false,
            disputed: false,
            disputeReason: ""
        });
        
        jobIdToEscrowId[_jobId] = escrowId;
        employerEscrows[msg.sender].push(escrowId);
        workerEscrows[_worker].push(escrowId);
        
        emit EscrowCreated(escrowId, _jobId, msg.sender, _worker, workerAmount);
        emit EscrowFunded(escrowId, msg.value);
        
        return escrowId;
    }
    
    /**
     * @dev Worker confirms job completion
     * @param _escrowId ID of the escrow
     */
    function confirmCompletion(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyWorker(_escrowId) 
        whenNotPaused 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Invalid escrow status");
        require(!escrow.workerConfirmed, "Already confirmed");
        
        escrow.workerConfirmed = true;
        escrow.completedAt = block.timestamp;
        escrow.status = EscrowStatus.Completed;
        
        emit WorkCompleted(_escrowId, msg.sender);
    }
    
    /**
     * @dev Employer approves and releases payment to worker
     * @param _escrowId ID of the escrow
     */
    function releasePayment(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyEmployer(_escrowId) 
        whenNotPaused 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(
            escrow.status == EscrowStatus.Completed || escrow.status == EscrowStatus.Funded,
            "Invalid escrow status"
        );
        require(!escrow.disputed, "Escrow is disputed");
        
        escrow.employerApproved = true;
        escrow.releasedAt = block.timestamp;
        escrow.status = EscrowStatus.Released;
        
        // Transfer payment to worker
        (bool success, ) = escrow.worker.call{value: escrow.amount}("");
        require(success, "Payment transfer failed");
        
        // Transfer platform fee to owner
        (bool feeSuccess, ) = owner().call{value: escrow.platformFee}("");
        require(feeSuccess, "Fee transfer failed");
        
        emit PaymentApproved(_escrowId, msg.sender);
        emit PaymentReleased(_escrowId, escrow.amount, escrow.platformFee);
    }
    
    /**
     * @dev Raise a dispute on the escrow
     * @param _escrowId ID of the escrow
     * @param _reason Reason for the dispute
     */
    function raiseDispute(uint256 _escrowId, string memory _reason) 
        external 
        escrowExists(_escrowId) 
        whenNotPaused 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(
            msg.sender == escrow.employer || msg.sender == escrow.worker,
            "Not authorized"
        );
        require(
            escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.Completed,
            "Invalid escrow status"
        );
        require(!escrow.disputed, "Already disputed");
        
        escrow.disputed = true;
        escrow.disputeReason = _reason;
        escrow.status = EscrowStatus.Disputed;
        
        emit DisputeRaised(_escrowId, msg.sender, _reason);
    }
    
    /**
     * @dev Resolve dispute (only owner/admin)
     * @param _escrowId ID of the escrow
     * @param _releaseToWorker True to release to worker, false to refund employer
     */
    function resolveDispute(uint256 _escrowId, bool _releaseToWorker) 
        external 
        onlyOwner 
        escrowExists(_escrowId) 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        
        if (_releaseToWorker) {
            escrow.status = EscrowStatus.Released;
            
            (bool success, ) = escrow.worker.call{value: escrow.amount}("");
            require(success, "Payment transfer failed");
            
            (bool feeSuccess, ) = owner().call{value: escrow.platformFee}("");
            require(feeSuccess, "Fee transfer failed");
            
            emit DisputeResolved(_escrowId, escrow.worker);
            emit PaymentReleased(_escrowId, escrow.amount, escrow.platformFee);
        } else {
            escrow.status = EscrowStatus.Refunded;
            
            uint256 refundAmount = escrow.amount + escrow.platformFee;
            (bool success, ) = escrow.employer.call{value: refundAmount}("");
            require(success, "Refund transfer failed");
            
            emit DisputeResolved(_escrowId, escrow.employer);
            emit EscrowRefunded(_escrowId, refundAmount);
        }
    }
    
    /**
     * @dev Emergency refund after timeout (if no action taken)
     * @param _escrowId ID of the escrow
     */
    function emergencyRefund(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyEmployer(_escrowId) 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded, "Invalid escrow status");
        require(
            block.timestamp >= escrow.createdAt + (disputeTimeoutDays * 1 days),
            "Timeout not reached"
        );
        require(!escrow.workerConfirmed, "Worker already confirmed");
        
        escrow.status = EscrowStatus.Refunded;
        
        uint256 refundAmount = escrow.amount + escrow.platformFee;
        (bool success, ) = escrow.employer.call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit EscrowRefunded(_escrowId, refundAmount);
    }
    
    /**
     * @dev Cancel escrow before funding (only employer)
     * @param _escrowId ID of the escrow
     */
    function cancelEscrow(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyEmployer(_escrowId) 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Created, "Cannot cancel funded escrow");
        
        escrow.status = EscrowStatus.Cancelled;
        emit EscrowCancelled(_escrowId);
    }
    
    // View functions
    
    function getEscrow(uint256 _escrowId) 
        external 
        view 
        escrowExists(_escrowId) 
        returns (Escrow memory) 
    {
        return escrows[_escrowId];
    }
    
    function getEmployerEscrows(address _employer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return employerEscrows[_employer];
    }
    
    function getWorkerEscrows(address _worker) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return workerEscrows[_worker];
    }
    
    function getEscrowByJobId(string memory _jobId) 
        external 
        view 
        returns (Escrow memory) 
    {
        uint256 escrowId = jobIdToEscrowId[_jobId];
        require(escrowId > 0, "Escrow not found");
        return escrows[escrowId];
    }
    
    // Admin functions
    
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high (max 10%)");
        platformFeePercentage = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }
    
    function setDisputeTimeout(uint256 _days) external onlyOwner {
        require(_days >= 1 && _days <= 30, "Invalid timeout");
        disputeTimeoutDays = _days;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Fallback
    receive() external payable {
        revert("Direct payments not allowed");
    }
}
