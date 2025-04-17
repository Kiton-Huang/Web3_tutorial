//任务点

// import ethers

//创建函数
  //初始化两个账号
  //fund从第一个账户转到合约
  //查看合约的余额
  //第二个账户转到合约
  //查看合约的余额
  //查看mapping

//执行函数


const {ethers} = require("hardhat");
// 延迟函数
// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
async function main(){
  //部署合约
    //先创建一个合约工厂
    const fundMeFactory =await ethers.getContractFactory("FundMe");//创建了一个FundMe的合约工厂
    console.log("合约正在部署...");
    //通过合约工厂部署合约
    const fundMe =await fundMeFactory.deploy(300);//只发送deploy请求不代表成功


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

   if(hre.network.config.chainID == 11155111 && process.env.ETHERSCAN_API_KEY){
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


   //开始与合约内容进行交互

   //初始化两个账号
   const[firstAccount,secondAccount] = await ethers.getSigners();

   //第一个账户调用合约fund函数
   const fundTx = await fundMe.fund({value: ethers.parseEther("0.1")})//字符串，只确保了发送，不代表成功
   await fundTx.wait();

   //查看合约的余额
  const balanceOf = await ethers.provider.getBalance(deployedAddress)
  console.log(`合约余额为： ${balanceOf}`)

  //第二个账户调用合约fund函数
  const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.1")})//字符串，只确保了发送，不代表成功
   await fundTxWithSecondAccount.wait();

   //查看合约的余额
   const balanceOfAfterSecondFund = await ethers.provider.getBalance(deployedAddress)
   console.log(`合约余额为： ${balanceOfAfterSecondFund}`)

   //查看mapping
   const firstAccountMapping = await fundMe.funderToAmount(firstAccount.address);
   const secondAccountMapping = await fundMe.funderToAmount(secondAccount.address);
   console.log(`账户1:${firstAccount.address}的捐赠金额为${firstAccountMapping}`)
   console.log(`账户2:${secondAccount.address}的捐赠金额为${secondAccountMapping}`)


}
async function verifyFundMe(fundaddr, args) {
  await hre.run("verify:verify", {
    address: fundaddr,
    constructorArguments: args,
  });
}
main().then().catch((error) =>{
    console.error(error)
    process.exit(1)
})