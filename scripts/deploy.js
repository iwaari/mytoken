const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Get the deployer's account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);
    
    const provider = ethers.provider;
    const balance = await provider.getBalance(deployer.address);

    if (!balance) {
        throw new Error("Failed to fetch deployer's balance. Check your provider setup.");
    }

    const formattedBalance = ethers.formatEther(balance);
    console.log("Deployer's balance:", formattedBalance, "ETH");

    if (balance < ethers.parseEther("0.01")) {
        console.error("Error: Insufficient funds for deployment. Please top up your account.");
        process.exit(1);
    }

    // Get the contract factory
    const Token = await ethers.getContractFactory("AITU_SE2331");

    console.log("Deploying the token contract...");
    // Deploy without parameters since constructor doesn't take any
    const token = await Token.deploy();

    console.log("Waiting for the contract to be deployed...");
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("Token successfully deployed to:", tokenAddress);

    // Additional logs
    console.log("Contract deployed with the following details:");
    console.log("Token Name:", await token.name());
    console.log("Token Symbol:", await token.symbol());
    console.log("Token Total Supply:", ethers.formatUnits(await token.totalSupply(), 18), "UGT");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error.message || error);
        process.exit(1);
    });