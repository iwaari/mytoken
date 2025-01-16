// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniversityToken is ERC20 {
    // Event to log transaction details
    event TransactionDetails(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    // Struct to store transaction details
    struct TransactionInfo {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    TransactionInfo public lastTransaction;

    // Constructor to create token with 2000 initial supply
    constructor() ERC20("AITU_SE2331", "UGT") {
        _mint(msg.sender, 2000 * 10**decimals());
    }

    // Override transfer function to emit transaction details
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        bool success = super.transfer(recipient, amount);
        if (success) {
            lastTransaction = TransactionInfo(msg.sender, recipient, amount, block.timestamp);
            emit TransactionDetails(msg.sender, recipient, amount, block.timestamp);
        }
        return success;
    }

    // Override transferFrom to emit transaction details
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(sender, recipient, amount);
        if (success) {
            lastTransaction = TransactionInfo(sender, recipient, amount, block.timestamp);
            emit TransactionDetails(sender, recipient, amount, block.timestamp);
        }
        return success;
    }

    // Retrieve last transaction details
    function getLastTransaction() public view returns (address, address, uint256, uint256) {
        return (
            lastTransaction.sender,
            lastTransaction.receiver,
            lastTransaction.amount,
            lastTransaction.timestamp
        );
    }

    // Retrieve last transaction timestamp in human-readable format (implementation depends on your logic)
    function getLastTransactionTimestamp() public view returns (uint256) {
        return lastTransaction.timestamp;
    }

    function getLastTransactionSender() public view returns (address) {
        return lastTransaction.sender;
    }

    function getLastTransactionReceiver() public view returns (address) {
        return lastTransaction.receiver;
    }
    // Add this function to convert timestamp to date components
function getLastTransactionTimestampFormatted() public view returns (
    string memory formattedDate
) {
    uint256 timestamp = lastTransaction.timestamp;
    
    // Convert Unix timestamp to human-readable format
    uint256 year = 1970;
    uint256 month = 1;
    uint256 day = 1;
    uint256 hour = 0;
    uint256 minute = 0;
    uint256 second = timestamp;
    
    // Calculate years
    year += second / 31536000;  // 60*60*24*365
    second = second % 31536000;
    
    // Calculate months (approximate)
    month += second / 2628000;  // 60*60*24*30.44
    second = second % 2628000;
    
    // Calculate days
    day += second / 86400;     // 60*60*24
    second = second % 86400;
    
    // Calculate hours/minutes/seconds
    hour = second / 3600;      // 60*60
    second = second % 3600;
    minute = second / 60;
    second = second % 60;
    
    // Format the string (you can modify this format as needed)
    return string(abi.encodePacked(
        toString(year), "-",
        toString(month), "-",
        toString(day), " ",
        toString(hour), ":",
        toString(minute), ":",
        toString(second)
    ));
}

// Helper function to convert uint to string
function toString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
        return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
        digits++;
        temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
        digits -= 1;
        buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
        value /= 10;
    }
    return string(buffer);
}
}
