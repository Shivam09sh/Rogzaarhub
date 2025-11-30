// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserRegistry
 * @dev Registry for linking wallet addresses to RozgaarHub user profiles
 * @notice Stores user reputation and verification status on-chain
 */
contract UserRegistry is Ownable {
    
    struct UserProfile {
        string userId;          // Backend MongoDB ID
        string profileHash;     // IPFS hash of profile data (encrypted)
        string role;            // "worker" or "employer"
        bool isRegistered;
        uint256 reputationScore; // 0-100
        uint256 totalJobs;
        uint256 verifiedAt;
        bool isVerified;
    }
    
    struct VerificationBadge {
        string badgeType;       // e.g., "KYC", "SKILL_PLUMBING"
        string issuer;
        uint256 issuedAt;
        string evidenceHash;    // IPFS hash of proof
    }
    
    // Mappings
    mapping(address => UserProfile) public users;
    mapping(string => address) public userIdToAddress;
    mapping(address => VerificationBadge[]) public userBadges;
    
    // Events
    event UserRegistered(address indexed wallet, string userId, string role);
    event ProfileUpdated(address indexed wallet, string newProfileHash);
    event ReputationUpdated(address indexed wallet, uint256 newScore);
    event BadgeIssued(address indexed wallet, string badgeType, string issuer);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new user
     * @param _userId Backend user ID
     * @param _profileHash IPFS hash of profile data
     * @param _role User role
     */
    function registerUser(
        string memory _userId,
        string memory _profileHash,
        string memory _role
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(userIdToAddress[_userId] == address(0), "User ID already linked");
        
        users[msg.sender] = UserProfile({
            userId: _userId,
            profileHash: _profileHash,
            role: _role,
            isRegistered: true,
            reputationScore: 0,
            totalJobs: 0,
            verifiedAt: 0,
            isVerified: false
        });
        
        userIdToAddress[_userId] = msg.sender;
        
        emit UserRegistered(msg.sender, _userId, _role);
    }
    
    /**
     * @dev Update user profile hash
     * @param _newProfileHash New IPFS hash
     */
    function updateProfile(string memory _newProfileHash) external {
        require(users[msg.sender].isRegistered, "User not registered");
        users[msg.sender].profileHash = _newProfileHash;
        emit ProfileUpdated(msg.sender, _newProfileHash);
    }
    
    /**
     * @dev Update user reputation (only owner/admin or authorized contract)
     * @param _user User address
     * @param _score New reputation score
     */
    function updateReputation(address _user, uint256 _score) external onlyOwner {
        require(users[_user].isRegistered, "User not registered");
        require(_score <= 100, "Invalid score");
        
        users[_user].reputationScore = _score;
        emit ReputationUpdated(_user, _score);
    }
    
    /**
     * @dev Issue a verification badge (only owner/admin)
     * @param _user User address
     * @param _badgeType Type of badge
     * @param _evidenceHash IPFS hash of evidence
     */
    function issueBadge(
        address _user,
        string memory _badgeType,
        string memory _evidenceHash
    ) external onlyOwner {
        require(users[_user].isRegistered, "User not registered");
        
        userBadges[_user].push(VerificationBadge({
            badgeType: _badgeType,
            issuer: "RozgaarHub",
            issuedAt: block.timestamp,
            evidenceHash: _evidenceHash
        }));
        
        if (!users[_user].isVerified) {
            users[_user].isVerified = true;
            users[_user].verifiedAt = block.timestamp;
        }
        
        emit BadgeIssued(_user, _badgeType, "RozgaarHub");
    }
    
    // View functions
    
    function getUser(address _user) external view returns (UserProfile memory) {
        return users[_user];
    }
    
    function getAddressByUserId(string memory _userId) external view returns (address) {
        return userIdToAddress[_userId];
    }
    
    function getUserBadges(address _user) external view returns (VerificationBadge[] memory) {
        return userBadges[_user];
    }
}
