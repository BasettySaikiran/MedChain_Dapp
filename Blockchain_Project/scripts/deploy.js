const hre = require("hardhat");

async function main() {
  // Get the contract factory for MedChain
  const MedChain = await hre.ethers.getContractFactory("MedChain");

  // Deploy the contract
  const medChain = await MedChain.deploy();

  // Wait until the contract is deployed
  await medChain.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await medChain.getAddress();
  console.log("MedChain contract deployed to:", contractAddress);
}

// Catch errors and handle them
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
