const { ethers } = require("hardhat");

async function testEthers() {
  // Use a valid Ethereum address (replace with an actual address or deployer's address)
  const address = "0x5968972ee30817E8d10De52097A91E89225ed57d"; // Replace this with a valid address
  const balance = await ethers.provider.getBalance(address);
  console.log("Balance of", address, ":", ethers.utils.formatEther(balance)); // Convert to human-readable format
}

testEthers().catch((error) => {
  console.error("Error:", error);
});
