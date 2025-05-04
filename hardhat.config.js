require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();//加载.env文件;
require("./tasks")//自动加载tasks目录下的index
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");


const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  mocha:{
    timeout: 300000
  },
  networks:{
    sepolia:{//远程调度RPC: Alchemy，Infura，QuickNode
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY,PRIVATE_KEY_1],
      chainId: 11155111
    },
    hardhat: {
      chainId: 1337  
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  namedAccounts: {
    firstAccount:{
      default: 0
    },
    secondAccount:{
      default: 1
    }
  },
  gasReporter: {//gas预估
    enabled: true
  }
};
