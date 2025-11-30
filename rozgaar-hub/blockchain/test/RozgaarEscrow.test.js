const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RozgaarEscrow", function () {
  let RozgaarEscrow;
  let rozgaarEscrow;
  let owner;
  let employer;
  let worker;
  let otherAccount;

  beforeEach(async function () {
    [owner, employer, worker, otherAccount] = await ethers.getSigners();
    RozgaarEscrow = await ethers.getContractFactory("RozgaarEscrow");
    rozgaarEscrow = await RozgaarEscrow.deploy();
  });

  describe("Escrow Creation", function () {
    it("Should create a new escrow with correct values", async function () {
      const jobId = "job_123";
      const amount = ethers.parseEther("1.0"); // 1 ETH

      await expect(rozgaarEscrow.connect(employer).createEscrow(jobId, worker.address, { value: amount }))
        .to.emit(rozgaarEscrow, "EscrowCreated")
        .withArgs(1, jobId, employer.address, worker.address, ethers.parseEther("0.975")); // 1.0 - 2.5% fee

      const escrow = await rozgaarEscrow.getEscrow(1);
      expect(escrow.employer).to.equal(employer.address);
      expect(escrow.worker).to.equal(worker.address);
      expect(escrow.status).to.equal(1); // Funded
    });

    it("Should fail if amount is 0", async function () {
      await expect(
        rozgaarEscrow.connect(employer).createEscrow("job_123", worker.address, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Payment Flow", function () {
    it("Should allow worker to confirm completion", async function () {
      const amount = ethers.parseEther("1.0");
      await rozgaarEscrow.connect(employer).createEscrow("job_123", worker.address, { value: amount });

      await expect(rozgaarEscrow.connect(worker).confirmCompletion(1))
        .to.emit(rozgaarEscrow, "WorkCompleted")
        .withArgs(1, worker.address);

      const escrow = await rozgaarEscrow.getEscrow(1);
      expect(escrow.workerConfirmed).to.be.true;
      expect(escrow.status).to.equal(2); // Completed
    });

    it("Should allow employer to release payment", async function () {
      const amount = ethers.parseEther("1.0");
      await rozgaarEscrow.connect(employer).createEscrow("job_123", worker.address, { value: amount });
      await rozgaarEscrow.connect(worker).confirmCompletion(1);

      const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

      await expect(rozgaarEscrow.connect(employer).releasePayment(1))
        .to.emit(rozgaarEscrow, "PaymentReleased");

      const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

      // Worker should receive 97.5% of 1 ETH (2.5% fee)
      // 0.975 ETH
      const expectedPayment = ethers.parseEther("0.975");
      expect(finalWorkerBalance - initialWorkerBalance).to.equal(expectedPayment);
    });
  });

  describe("Disputes", function () {
    it("Should allow raising a dispute", async function () {
      const amount = ethers.parseEther("1.0");
      await rozgaarEscrow.connect(employer).createEscrow("job_123", worker.address, { value: amount });

      await expect(rozgaarEscrow.connect(employer).raiseDispute(1, "Work not done"))
        .to.emit(rozgaarEscrow, "DisputeRaised")
        .withArgs(1, employer.address, "Work not done");

      const escrow = await rozgaarEscrow.getEscrow(1);
      expect(escrow.disputed).to.be.true;
      expect(escrow.status).to.equal(4); // Disputed
    });
  });
});
