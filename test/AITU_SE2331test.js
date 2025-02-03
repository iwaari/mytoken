const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AITU_SE2331", function () {
    let Token, token, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Token = await ethers.getContractFactory("AITU_SE2331");
        token = await Token.deploy();
        await token.waitForDeployment();
    });

    it("Should have correct name and symbol", async function () {
        expect(await token.name()).to.equal("AITU_SE2331");
        expect(await token.symbol()).to.equal("UGT");
    });

    it("Should assign initial supply to owner", async function () {
        const ownerBalance = await token.balanceOf(owner.address);
        expect(ownerBalance).to.equal(ethers.parseUnits("2000", 18));
    });

    it("Should transfer tokens between accounts", async function () {
        // Transfer 100 tokens from owner to addr1
        await token.transfer(addr1.address, ethers.parseUnits("100", 18));
        
        // Check addr1 balance
        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseUnits("100", 18));
        
        // Verify last transaction details
        const [sender, receiver, amount, timestamp] = await token.getLastTransaction();
        expect(sender).to.equal(owner.address);
        expect(receiver).to.equal(addr1.address);
        expect(amount).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should record last transaction details", async function () {
        const tx = await token.transfer(addr1.address, ethers.parseUnits("50", 18));
        await tx.wait();

        // Check individual getter functions
        expect(await token.getLastTransactionSender()).to.equal(owner.address);
        expect(await token.getLastTransactionReceiver()).to.equal(addr1.address);
        
        // Check timestamp is set
        const timestamp = await token.getLastTransactionTimestamp();
        expect(timestamp).to.be.gt(0);
    });

    it("Should transferFrom with approval", async function () {
        // Approve addr1 to spend tokens
        await token.approve(addr1.address, ethers.parseUnits("50", 18));
        
        // Transfer tokens from owner to addr2 using addr1
        await token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseUnits("50", 18));
        
        // Check addr2 balance
        expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseUnits("50", 18));
        
        // Verify last transaction details
        const [sender, receiver, amount, ] = await token.getLastTransaction();
        expect(sender).to.equal(owner.address);
        expect(receiver).to.equal(addr2.address);
        expect(amount).to.equal(ethers.parseUnits("50", 18));
    });

    it("Should format timestamp correctly", async function () {
        // Make a transfer to create a transaction
        await token.transfer(addr1.address, ethers.parseUnits("30", 18));
        
        // Get formatted timestamp
        const formattedTime = await token.getLastTransactionTimestampFormatted();
        
        // Check that the formatted string matches expected pattern (DD/MM/YYYY HH:MM)
        expect(formattedTime).to.match(/^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2}$/);
    });

    it("Should emit TransactionDetails event", async function () {
        const amount = ethers.parseUnits("25", 18);
        const blockTimestamp = await time.latest();
        
        await expect(token.transfer(addr1.address, amount))
            .to.emit(token, "TransactionDetails")
            .withArgs(owner.address, addr1.address, amount, blockTimestamp + 1); // +1 because the transfer will be in the next block
    });
});