const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to network:", hre.network.name);

  // 1. Deploy UserRegistry
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.deployed();

  console.log("UserRegistry deployed to:", userRegistry.address);

  // 2. Deploy RozgaarEscrow
  const RozgaarEscrow = await hre.ethers.getContractFactory("RozgaarEscrow");
  const rozgaarEscrow = await RozgaarEscrow.deploy();
  await rozgaarEscrow.deployed();

  console.log("RozgaarEscrow deployed to:", rozgaarEscrow.address);

  // 3. Verify contracts if on testnet/mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    // Wait for 6 blocks to ensure propagation
    await rozgaarEscrow.deployTransaction.wait(6);

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: userRegistry.address,
        constructorArguments: [],
      });
      console.log("UserRegistry verified");
    } catch (error) {
      console.error("UserRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: rozgaarEscrow.address,
        constructorArguments: [],
      });
      console.log("RozgaarEscrow verified");
    } catch (error) {
      console.error("RozgaarEscrow verification failed:", error.message);
    }
  }

  // Output for .env
  console.log("\nUpdate your .env file with these addresses:");
  console.log(`USER_REGISTRY_CONTRACT_ADDRESS=${userRegistry.address}`);
  console.log(`ESCROW_CONTRACT_ADDRESS=${rozgaarEscrow.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



