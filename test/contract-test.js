const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITU_SE2331 Contracts", function () {
  describe("Original Contract", function () {
    let Token, token;
    let owner, addr1, addr2;
    const INITIAL_SUPPLY = 2000;

    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      Token = await ethers.getContractFactory("AITU_SE2331");
      token = await Token.deploy();
      await token.waitForDeployment();
    });

    it("should transfer tokens and store transaction info", async function () {
      const transferAmount = 100;
      const tx = await token.transfer(addr1.address, transferAmount);
      const receipt = await tx.wait();
      const blockNumber = receipt.blockNumber;
      const blockData = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = blockData.timestamp;

      // Get transaction info using contract methods
      const [sender, receiver, amount, timestamp] = await token.getLastTransaction();
      
      console.log("Transaction Info:", {
        sender,
        receiver,
        amount: amount.toString(),
        timestamp: timestamp.toString()
      });

      // Verify transaction details
      expect(sender).to.equal(owner.address);
      expect(receiver).to.equal(addr1.address);
      expect(amount).to.equal(transferAmount);
      expect(timestamp).to.equal(blockTimestamp);

      // Test individual getter functions
      expect(await token.getLastTransactionSender()).to.equal(owner.address);
      expect(await token.getLastTransactionReceiver()).to.equal(addr1.address);
      expect(await token.getLastTransactionTimestamp()).to.equal(blockTimestamp);

      // Test formatted timestamp
      const formattedTime = await token.getLastTransactionTimestampFormatted();
      const jsFormattedTime = convertTimestampToReadable(blockTimestamp);
      console.log("Solidity Formatted Time:", formattedTime);
      console.log("JS Formatted Time:", jsFormattedTime);
    });

    it("should handle transferFrom correctly", async function () {
      const transferAmount = 100;
      await token.approve(addr1.address, transferAmount);
      const tx = await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const [sender, receiver, amount, timestamp] = await token.getLastTransaction();
      expect(sender).to.equal(owner.address);
      expect(receiver).to.equal(addr2.address);
      expect(amount).to.equal(transferAmount);
      expect(timestamp).to.equal(blockTimestamp);
    });
  });

  describe("Modified Contract", function () {
    let Token, token;
    let owner, addr1, addr2;
    const INITIAL_SUPPLY = 1000;

    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      Token = await ethers.getContractFactory("AITU_SE2331Modified");
      token = await Token.deploy(INITIAL_SUPPLY);
      await token.waitForDeployment();
    });

    it("should set initial parameters correctly", async function () {
      expect(await token.contractOwner()).to.equal(owner.address);
      expect(await token.initialSupply()).to.equal(INITIAL_SUPPLY);
      const expectedSupply = ethers.parseUnits(INITIAL_SUPPLY.toString(), 18);
      expect(await token.totalSupply()).to.equal(expectedSupply);
    });

    it("should transfer tokens and store transaction info", async function () {
      const transferAmount = 100;
      const tx = await token.transfer(addr1.address, transferAmount);
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const [sender, receiver, amount, timestamp] = await token.getLastTransaction();
      
      console.log("Modified Contract Transaction Info:", {
        sender,
        receiver,
        amount: amount.toString(),
        timestamp: timestamp.toString()
      });

      expect(sender).to.equal(owner.address);
      expect(receiver).to.equal(addr1.address);
      expect(amount).to.equal(transferAmount);
      expect(timestamp).to.equal(blockTimestamp);
    });

    it("should fail when deploying with zero initial supply", async function () {
      const Token = await ethers.getContractFactory("AITU_SE2331Modified");
      await expect(Token.deploy(0)).to.be.revertedWith("Initial supply must be greater than 0");
    });
  });
});

function convertTimestampToReadable(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}