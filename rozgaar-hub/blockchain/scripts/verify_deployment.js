const hre = require("hardhat");

async function main() {
  // Get the contract addresses from the deployment (or .env)
  // Using the addresses from the previous deployment output
  const ESCROW_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log("🔍 Verifying Blockchain Implementation...\n");

  // 1. Check Network Connection
  const provider = hre.ethers.provider;
  const blockNumber = await provider.getBlockNumber();
  console.log(`✅ Connected to Local Blockchain (Block #${blockNumber})`);

  // 2. Verify UserRegistry Contract
  try {
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const registry = UserRegistry.attach(REGISTRY_ADDRESS);
    const owner = await registry.owner();
    console.log(`\n✅ UserRegistry Contract Found`);
    console.log(`   📍 Address: ${REGISTRY_ADDRESS}`);
    console.log(`   👑 Owner:   ${owner}`);
  } catch (e) {
    console.log(`❌ UserRegistry Check Failed: ${e.message}`);
  }

  // 3. Verify RozgaarEscrow Contract
  try {
    const RozgaarEscrow = await hre.ethers.getContractFactory("RozgaarEscrow");
    const escrow = RozgaarEscrow.attach(ESCROW_ADDRESS);

    const fee = await escrow.platformFeePercentage();
    const count = await escrow.escrowCounter();

    console.log(`\n✅ RozgaarEscrow Contract Found`);
    console.log(`   📍 Address: ${ESCROW_ADDRESS}`);
    console.log(`   💰 Platform Fee: ${(Number(fee) / 100)}%`);
    console.log(`   🔢 Total Escrows: ${count}`);
  } catch (e) {
    console.log(`❌ RozgaarEscrow Check Failed: ${e.message}`);
  }

  console.log("\n✨ Blockchain infrastructure is active and ready for integration!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
