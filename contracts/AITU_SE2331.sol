// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AITU_SE2331 is ERC20 {
    event TransactionDetails(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    struct TransactionInfo {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    TransactionInfo public lastTransaction;

    constructor() ERC20("AITU_SE2331", "UGT") {
        _mint(msg.sender, 2000 * 10**decimals());
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        bool success = super.transfer(recipient, amount);
        if (success) {
            lastTransaction = TransactionInfo(msg.sender, recipient, amount, block.timestamp);
            emit TransactionDetails(msg.sender, recipient, amount, block.timestamp);
        }
        return success;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(sender, recipient, amount);
        if (success) {
            lastTransaction = TransactionInfo(sender, recipient, amount, block.timestamp);
            emit TransactionDetails(sender, recipient, amount, block.timestamp);
        }
        return success;
    }

    function getLastTransaction() public view returns (address, address, uint256, uint256) {
        return (
            lastTransaction.sender,
            lastTransaction.receiver,
            lastTransaction.amount,
            lastTransaction.timestamp
        );
    }

    function getLastTransactionTimestamp() public view returns (uint256) {
        return lastTransaction.timestamp;
    }

    function getLastTransactionSender() public view returns (address) {
        return lastTransaction.sender;
    }

    function getLastTransactionReceiver() public view returns (address) {
        return lastTransaction.receiver;
    }

    function getLastTransactionTimestampFormatted() public view returns (string memory) {
        uint256 timestamp = lastTransaction.timestamp;
        return formatTimestamp(timestamp);
    }

    function formatTimestamp(uint256 _timestamp) internal pure returns (string memory) {
        uint256 day = (_timestamp / 86400) % 31 + 1; // Calculate day
        uint256 month = (_timestamp / 2592000) % 12 + 1; // Calculate month
        uint256 year = 1970 + _timestamp / 31536000; // Calculate year
        uint256 hour = (_timestamp % 86400) / 3600; // Calculate hour
        uint256 minute = (_timestamp % 3600) / 60; // Calculate minute
        return string(
            abi.encodePacked(
                uintToString(day), "/", uintToString(month), "/", uintToString(year),
                " ", uintToString(hour), ":", uintToString(minute)
            )
        );
    }

    function uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) {
            return "0";
        }
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (v != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + v % 10);
            bstr[k] = bytes1(temp);
            v /= 10;
        }
        return string(bstr);
    }
}