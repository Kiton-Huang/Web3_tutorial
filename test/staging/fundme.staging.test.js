const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const developmentChains = require("../../helper-hadhat-config").developmentChains;

//mock合约中
//1eth = 2500usd
//0.04eth = 100usd 最小值
//0.08eth = 200usd 
//0.2就完成了500usd 



//集成测试模拟一些真实环境，比如上块的延迟什么的


// 测试fundme合约
//developmentChains.includes(network.name)为hardhat跳过
//检查 developmentChains 数组是否包含当前网络的名字。includes 方法返回一个布尔值，表示数组是否包含指定的元素。
developmentChains.includes(network.name)? describe.skip:
describe("测试fundme合约", async function() {
    let fundMe;
    let firstAccount;
    // 每次测试前执行
    beforeEach(async function(){
        // 部署所有合约
        await deployments.fixture(["all"])
        // 获取第一个账户
        firstAccount = (await getNamedAccounts()).firstAccount;
        // 获取FundMe合约部署信息
        const fundMeDeployment =await deployments.get("FundMe");
        // 获取FundMe合约实例
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
    })
    //test fund and getfund succeedfully
    it("fund和getfund成功",async function(){
        //达成目标
        await fundMe.fund({value: ethers.parseEther("0.11")})
        //真实时间流失
        await new Promise(resolve => setTimeout(resolve,181 * 1000))
        //等待回执
        const getFundTx = await fundMe.getFund();
        const getFundReceipt = await getFundTx.wait();
        expect(getFundReceipt)
            .to.be.emit(fundMe,"FundWithdrawByOwner")
            .withArgs(ethers.parseEther("0.11"));
    })
    //test fund and refund succeedfully
    it("fund和refund成功",async function(){
        await fundMe.fund({value: ethers.parseEther("0.06")})
        await new Promise(resolve => setTimeout(resolve,181 * 1000))
        const reFundTx = await fundMe.refund();
        const reFundReceipt = await reFundTx.wait();
        expect(reFundReceipt)
            .to.be.emit(fundMe,"ReturnedToAccount")
            .withArgs(firstAccount,ethers.parseEther("0.06"));
    })
})