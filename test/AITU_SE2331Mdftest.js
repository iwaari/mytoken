const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AITU_SE2331Modified", function () {
    let Token, token, owner, addr1, addr2;
    const INITIAL_SUPPLY = 5000;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Token = await ethers.getContractFactory("AITU_SE2331Modified");
        token = await Token.deploy(INITIAL_SUPPLY);
        await token.waitForDeployment();
    });

    it("Should initialize with the correct owner and initial supply", async function () {
        expect(await token.contractOwner()).to.equal(owner.address);
        expect(await token.initialSupply()).to.equal(INITIAL_SUPPLY);
        expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits(INITIAL_SUPPLY.toString(), 18));
    });

    it("Should fail to deploy with zero initial supply", async function () {
        const Token = await ethers.getContractFactory("AITU_SE2331Modified");
        await expect(Token.deploy(0)).to.be.revertedWith("Initial supply must be greater than 0");
    });

    it("Should have correct name and symbol", async function () {
        expect(await token.name()).to.equal("AITU_SE2331");
        expect(await token.symbol()).to.equal("UGT");
    });

    it("Should allow transfers and log transactions", async function () {
        const transferAmount = ethers.parseUnits("200", 18);
        await token.transfer(addr1.address, transferAmount);
        
        expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
        
        const [sender, receiver, amount, ] = await token.getLastTransaction();
        expect(sender).to.equal(owner.address);
        expect(receiver).to.equal(addr1.address);
        expect(amount).to.equal(transferAmount);
    });

    it("Should store and retrieve last transaction details correctly", async function () {
        const transferAmount = ethers.parseUnits("100", 18);
        const tx = await token.transfer(addr1.address, transferAmount);
        await tx.wait();

        // Check individual getter functions
        expect(await token.getLastTransactionSender()).to.equal(owner.address);
        expect(await token.getLastTransactionReceiver()).to.equal(addr1.address);
        const lastTimestamp = await token.getLastTransactionTimestamp();
        expect(lastTimestamp).to.be.gt(0);

        // Check formatted timestamp
        const formattedTime = await token.getLastTransactionTimestampFormatted();
        expect(formattedTime).to.match(/^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2}$/);
    });

    it("Should allow transferFrom after approval", async function () {
        const transferAmount = ethers.parseUnits("150", 18);
        
        await token.approve(addr1.address, transferAmount);
        await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
        
        expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
        
        // Verify last transaction details
        const [sender, receiver, amount, ] = await token.getLastTransaction();
        expect(sender).to.equal(owner.address);
        expect(receiver).to.equal(addr2.address);
        expect(amount).to.equal(transferAmount);
    });

    it("Should emit TransactionDetails event for transfer", async function () {
        const amount = ethers.parseUnits("25", 18);
        const blockTimestamp = await time.latest();
        
        await expect(token.transfer(addr1.address, amount))
            .to.emit(token, "TransactionDetails")
            .withArgs(owner.address, addr1.address, amount, blockTimestamp + 1);
    });

    it("Should emit TransactionDetails event for transferFrom", async function () {
        const amount = ethers.parseUnits("25", 18);
        await token.approve(addr1.address, amount);
        const blockTimestamp = await time.latest();
        
        await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, amount))
            .to.emit(token, "TransactionDetails")
            .withArgs(owner.address, addr2.address, amount, blockTimestamp + 1);
    });
});