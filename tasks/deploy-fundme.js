const{task} = require("hardhat/config");
const {networkConfig,LOCK_TIME} = require("../helper-hardhat-config");
task("deploy-fundme", "部署合约并验证").setAction(async(taskArgs,hre) => {
  const dataFeedAddr =await networkConfig[network.config.chainId].ethUsdDataFeed
    //部署合约
        //先创建一个合约工厂
        const fundMeFactory =await ethers.getContractFactory("FundMe");//创建了一个FundMe的合约工厂
        console.log("合约正在部署...");
        //通过合约工厂部署合约
        const fundMe =await fundMeFactory.deploy(LOCK_TIME,dataFeedAddr);//只发送deploy请求不代表成功
    
    
        //以下是V5版本，已不适配
      //   await fundMe.waitForDeployment();//等待入块
      //   console.log("合约部署完成: " + fundMe.target);//打印合约地址
      //   //验证合约
      //   // console.log("等待 20 秒后开始验证合约...");
      //   // await delay(20000);
      //   await fundMe.deploymentTransaction.wait(5)
      //   console.log("正在等待.....")
      //  await verifyFundMe(fundMe.target, [10]);、
    
    
       // 等待合约部署完成（在 ethers.js v6 中的正确方式）
       await fundMe.waitForDeployment();//等待入块
       const deployedAddress = await fundMe.getAddress();
       console.log("合约部署完成:", deployedAddress);
    
       if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
       // 等待区块确认（新方式v6）
       console.log("等待五个区块确认...")
       const deploymentReceipt = await fundMe.deploymentTransaction()?.wait(5);
       console.log("区块确认完成，区块号:", deploymentReceipt?.blockNumber);
      // 验证合约
        console.log("开始验证合约...");
        await verifyFundMe(deployedAddress, [300]);
        console.log("^^^验证成功！点击上方链接查看详情^^^")
       }else{
        console.log("已跳过验证...")
       }
       
}) 
async function verifyFundMe(fundaddr, args) {
    await hre.run("verify:verify", {
      address: fundaddr,
      constructorArguments: args,
    });
  }

module.exports = {}
