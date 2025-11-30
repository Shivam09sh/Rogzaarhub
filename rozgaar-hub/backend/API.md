# RozgaarHub Backend API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user (worker or employer).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210",
  "role": "worker",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

**Validation:**
- Name: 2-100 characters
- Email: Valid email format
- Password: Min 8 characters, must contain uppercase, lowercase, and number
- Phone: Valid 10-digit Indian phone number
- Role: "worker" or "employer"

**Rate Limit:** 5 requests per 15 minutes

---

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Get Current User
**GET** `/auth/me`

Get current authenticated user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker",
    "skills": ["Plumbing", "Electrical"],
    "rating": 4.5,
    "completedJobs": 25
  }
}
```

---

## Blockchain Endpoints

### Get Blockchain Status
**GET** `/blockchain/status`

Check if blockchain service is available.

**Response:**
```json
{
  "success": true,
  "available": true,
  "network": "localhost"
}
```

---

### Register User on Blockchain
**POST** `/blockchain/user/register`

Register user's wallet on blockchain.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "privateKey": "0x...",
  "profileHash": "QmXxxx..." // Optional IPFS hash
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered on blockchain",
  "walletAddress": "0x1234...",
  "transactionHash": "0xabcd..."
}
```

---

### Create Job Escrow
**POST** `/blockchain/escrow/create`

Create blockchain escrow for job payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Role Required:** Employer

**Request Body:**
```json
{
  "jobId": "65abc123...",
  "workerId": "65def456...",
  "amount": "0.1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Escrow created successfully",
  "escrowId": 1,
  "transactionHash": "0x...",
  "payment": {
    "_id": "...",
    "escrowId": 1,
    "blockchainStatus": "funded"
  }
}
```

---

### Get Escrow Details
**GET** `/blockchain/escrow/:escrowId`

Get escrow details from blockchain.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "escrow": {
    "escrowId": 1,
    "jobId": "65abc123...",
    "employer": "0x1234...",
    "worker": "0x5678...",
    "amount": "0.0975",
    "platformFee": "0.0025",
    "status": "Funded",
    "workerConfirmed": false,
    "employerApproved": false,
    "disputed": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Confirm Job Completion
**POST** `/blockchain/escrow/:escrowId/confirm`

Worker confirms job completion on blockchain.

**Headers:**
```
Authorization: Bearer <token>
```

**Role Required:** Worker

**Request Body:**
```json
{
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job completion confirmed",
  "transactionHash": "0x..."
}
```

---

### Release Payment
**POST** `/blockchain/escrow/:escrowId/release`

Employer releases payment to worker.

**Headers:**
```
Authorization: Bearer <token>
```

**Role Required:** Employer

**Response:**
```json
{
  "success": true,
  "message": "Payment released successfully",
  "transactionHash": "0x..."
}
```

---

### Raise Dispute
**POST** `/blockchain/escrow/:escrowId/dispute`

Raise dispute on escrow (employer or worker).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Work not completed as agreed",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute raised successfully",
  "transactionHash": "0x..."
}
```

---

## Worker Endpoints

### Browse Jobs
**GET** `/worker/jobs`

Browse available jobs with filters and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `location` (string): Filter by location
- `skills` (string): Comma-separated skills
- `minPay` (number): Minimum pay amount
- `maxPay` (number): Maximum pay amount
- `payType` (string): hourly, daily, or fixed
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Example:**
```
GET /worker/jobs?location=Mumbai&skills=Plumbing,Electrical&minPay=500&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "jobs": [
    {
      "_id": "...",
      "title": "Plumbing Work Required",
      "description": "Fix bathroom pipes",
      "location": "Mumbai, Maharashtra",
      "payAmount": 1500,
      "payType": "fixed",
      "requiredSkills": ["Plumbing"],
      "status": "open"
    }
  ]
}
```

---

### Apply to Job
**POST** `/worker/apply/:jobId`

Apply to a job posting.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "I have 5 years of experience in plumbing",
  "teamMembers": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "_id": "...",
    "jobId": "...",
    "workerId": "...",
    "status": "pending"
  }
}
```

---

## Employer Endpoints

### Create Job
**POST** `/employer/jobs`

Create a new job posting.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Plumbing Work Required",
  "description": "Need experienced plumber to fix bathroom pipes and install new fixtures",
  "location": "Mumbai, Maharashtra",
  "payAmount": 1500,
  "payType": "fixed",
  "duration": "1 day",
  "startDate": "2024-01-20",
  "requiredSkills": ["Plumbing"],
  "teamRequired": false,
  "teamSize": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "job": {
    "_id": "...",
    "title": "Plumbing Work Required",
    "status": "open",
    "postedDate": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Search Workers
**GET** `/employer/workers`

Search for workers with filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `skills` (string): Comma-separated skills
- `location` (string): Filter by location
- `minRating` (number): Minimum rating (0-5)
- `verified` (boolean): Only verified workers

**Response:**
```json
{
  "success": true,
  "count": 10,
  "workers": [
    {
      "_id": "...",
      "name": "John Doe",
      "skills": ["Plumbing", "Electrical"],
      "location": "Mumbai",
      "rating": 4.5,
      "completedJobs": 25,
      "verified": true
    }
  ]
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- **Auth endpoints** (`/auth/login`, `/auth/register`): 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Job creation**: 10 requests per hour
- **Job applications**: 20 requests per hour

Rate limit headers are included in responses:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

---

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```
