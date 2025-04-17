
const { task } = require ("hardhat/config");
task("interact-contract","对fundme合约进行交互")
.addParam("addr","fundme contract address")//
.setAction(async(taskArgs,hre)=>{
    const fundMeFactory= await ethers.getContractFactory("FundMe");//取得合约的工厂
// 将fundMeFactory合约实例与taskArgs.addr地址进行绑定
    const fundMe = fundMeFactory.attach(taskArgs.addr);
    //初始化两个账户
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
    
    

    
});
module.exports = {};