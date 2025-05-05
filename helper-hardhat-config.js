const DECIMAL = 8;
const INITIAL_ANSWER = 300000000000;
const developmentChains = ["hardhat","localhost"];//指定本地开发网络
const LOCK_TIME = 180;
const CONFIRMATIONS = 5;

const networkConfig = {
    11155111: {//sepolia
        ethUsdDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
}
module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS
}