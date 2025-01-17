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

    // Constants for time calculations
    uint256 constant SECONDS_PER_DAY = 86400;
    uint256 constant SECONDS_PER_HOUR = 3600;
    uint256 constant SECONDS_PER_MINUTE = 60;

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

    // Split timestamp calculations into smaller functions
    function calculateYear(uint256 timestamp) internal pure returns (uint256 year, uint256 remainingSeconds) {
        year = 1970;
        uint256 secondsAccountedFor = 0;
        
        while (true) {
            uint256 yearInSeconds = SECONDS_PER_DAY * 365;
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                yearInSeconds += SECONDS_PER_DAY;
            }
            if (secondsAccountedFor + yearInSeconds > timestamp) {
                remainingSeconds = timestamp - secondsAccountedFor;
                break;
            }
            secondsAccountedFor += yearInSeconds;
            year += 1;
        }
    }

    function calculateMonthAndDay(uint256 remainingSeconds, uint256 year) internal pure 
        returns (uint256 month, uint256 day) {
        uint256 dayOfYear = remainingSeconds / SECONDS_PER_DAY;
        bool isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        
        uint8[12] memory monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        day = dayOfYear + 1;
        month = 1;
        
        for (uint256 i = 0; i < 12; i++) {
            uint256 daysInMonth = monthDays[i];
            if (i == 1 && isLeapYear) {
                daysInMonth = 29;
            }
            if (day <= daysInMonth) {
                month = i + 1;
                break;
            }
            day -= daysInMonth;
        }
    }

    function calculateTime(uint256 remainingSeconds) internal pure 
        returns (uint256 hour, uint256 minute, uint256 second) {
        uint256 timeOfDay = remainingSeconds % SECONDS_PER_DAY;
        hour = timeOfDay / SECONDS_PER_HOUR;
        minute = (timeOfDay % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE;
        second = timeOfDay % SECONDS_PER_MINUTE;
    }

    function getLastTransactionTimestampFormatted() public view returns (string memory) {
        uint256 timestamp = lastTransaction.timestamp;
        
        // Calculate components
        (uint256 year, uint256 remainingSeconds) = calculateYear(timestamp);
        (uint256 month, uint256 day) = calculateMonthAndDay(remainingSeconds, year);
        (uint256 hour, uint256 minute, uint256 second) = calculateTime(remainingSeconds);
        
        // Format the date string
        return string(abi.encodePacked(
            toString(year), "-",
            padZero(month), "-",
            padZero(day), " ",
            padZero(hour), ":",
            padZero(minute), ":",
            padZero(second)
        ));
    }

    function padZero(uint256 value) internal pure returns (string memory) {
        if (value < 10) {
            return string(abi.encodePacked("0", toString(value)));
        }
        return toString(value);
    }

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

