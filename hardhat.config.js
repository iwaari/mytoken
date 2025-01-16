require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20", // OpenZeppelin compatibility
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.28", // Compatibility with Lock.sol
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    holesky: {
      url: process.env.HOLESKI_RPC_URL, // Use your Holeski RPC URL
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: "GA8GAI456UFRQSF2HMTY5UISHC8TJJKXU7"  // You'll need to get this from Etherscan
  }
};
