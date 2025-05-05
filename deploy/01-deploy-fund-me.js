// function DeployFunciton(){
//     console.log("这是一个部署函数")
// }
// module.exports.default = DeployFunciton

const { network } = require("hardhat");
const { developmentChains,networkConfig,LOCK_TIME,CONFIRMATIONS } = require("../helper-hardhat-config");


//简写如下

// module.exports = async(hre) =>{
//     // console.log("这是一个部署函数")
//     const getNamedAccounts = hre.getNamedAccounts;// Hardhat 中用于获取配置文件 hardhat.config.js 中定义的账户信息的一个函数。这个函数帮助你方便地在测试和脚本中获取预先设置的账户地址
//     const deployments = hre.deployments;//用于管理和操作智能合约部署过程的一个功能
//     console.log("这是一个部署函数")
// }

//简写如下
module.exports = async({ getNamedAccounts, deployments, network}) =>{
    const firstAccount = (await getNamedAccounts()).firstAccount;//原始写法
    const {deploy} = deployments;//简单写法
    let dataFeedAddr;
    let confirmations;
    if(developmentChains.includes(network.name)){
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
        // console.log("MockV3Aggregator Address:", mockV3Aggregator.address); //bug的显示，无需理会
        confirmations = 0;
        
    }else{
        
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;//当前链id获取datafeed
        confirmations = CONFIRMATIONS;
    }
    // console.log("Network Name:", network.name);  //bug的显示，无需理会
    // console.log("Chain ID:", network.config.chainID);
    // console.log("Data Feed Address:", dataFeedAddr);
   
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args: [LOCK_TIME,dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    })
    
    
   if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
    await hre.run("verify:verify", {
        
        address: fundMe.address,
        constructorArguments: [LOCK_TIME,dataFeedAddr],
    });
    console.log("^^^验证成功！点击上方链接查看详情^^^")
   }else{
    console.log("网络不是sepolia,跳过测试网合约部署与验证")
   }
    // console.log("这是一个部署函数")
    // console.log(`第一个账户的地址为${firstAccount}`)
    
}
module.exports.tags = ["all","fundme"];