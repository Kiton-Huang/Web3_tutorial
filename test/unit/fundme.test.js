const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect} = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const developmentChains = require("../../helper-hadhat-config").developmentChains;


//mock合约中
//1eth = 2500usd
//0.04eth = 100usd 最小值
//0.08eth = 200usd 
//0.2就完成了500usd 



// 测试fundme合约
!developmentChains.includes(network.name)? describe.skip:
describe("测试fundme合约", async function() {
    let fundMe;
    let firstAccount;
    let fundMesecondAccount;
    let secondAccount;//用于测试管理员权限
    let MockV3Aggregator;
    // 每次测试前执行
    beforeEach(async function(){
        // 部署所有合约
        await deployments.fixture(["all"])
        // 获取第一个账户
        firstAccount = (await getNamedAccounts()).firstAccount;
        // console.log(firstAccount)
        secondAccount = (await getNamedAccounts()).secondAccount;
        // console.log(secondAccount)
        // 获取FundMe合约部署信息
        const fundMeDeployment =await deployments.get("FundMe");
        // 获取MockV3Aggregator合约部署信息
        MockV3Aggregator = await deployments.get("MockV3Aggregator");
        // 获取FundMe合约实例
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
        fundMesecondAccount = await ethers.getContract("FundMe",secondAccount)
        
        
    })

    // 测试合约owner是否为msg.sender
    it("检测合约owner是否为msg.sender",async function () {
        // const [firstAccount] = await ethers.getSigners();
        // const fundMeFactory = await ethers.getContractFactory("FundMe");
        // const fundMe =await fundMeFactory.deploy(180);
        await fundMe.waitForDeployment();
        // 断言合约owner是否为第一个账户
        assert.equal((await fundMe.owner()),firstAccount);
        // assert.equal((await fundMe.owner()),firstAccount.address);
    })
    // 测试dataFeed是否被正确赋值
    it("dataFeed是否被正确赋值",async function () {
        // const [firstAccount] = await ethers.getSigners();
        // const fundMeFactory = await ethers.getContractFactory("FundMe");
        // const fundMe =await fundMeFactory.deploy(180);
        await fundMe.waitForDeployment();
        
        // 断言dataFeed是否为MockV3Aggregator合约地址
        assert.equal((await fundMe.dataFeed()),MockV3Aggregator.address);
    })
    //fund,getfund,refund单元测试
    //fund
    it("窗口关闭,输入值大于min,fundme失败",async function () {
        //模拟窗口关闭
        await helpers.time.increase(200);
        await helpers.mine();
        //输入值大于min
        await expect(fundMe.fund({value: ethers.parseEther("0.04")})).to.be.revertedWith("window is closed");
    })

    it("窗口开启,输入值小于min,fundme失败",async function () {
        //输入值大于min
        await expect(fundMe.fund({value: ethers.parseEther("0.01")})).to.be.revertedWith("You need to send more eth");
    })

    it("窗口开启,输入值大于min,fundme成功",async function () {
        await fundMe.fund({value: ethers.parseEther("0.04")})
        //检测mapping有没有更新,比较值
        const balance = await fundMe.funderToAmount(firstAccount);
        expect(balance).to.equal(ethers.parseEther("0.04"))
    })

    //getfund
    it("不是管理员账号,窗口关闭,达到目标,getfund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.08")})
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMesecondAccount.getFund()).to.be.revertedWith("You are not owner");
        
    })
    it("是管理员账号,窗口开启中,达到目标,getfund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.08")})
        // await helpers.time.increase(200);
        // await helpers.mine();
        await expect(fundMe.getFund()).to.be.revertedWith("window is not closed")
    })
    it("是管理员账号,窗口关闭,未达到目标,getfund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.05")})
        //1eth = 2500usd
        //0.2就完成了500usd
        
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund()).to.be.revertedWith("TARGET IS NOT REACHED");
    })
    //事件检测
    it("是管理员账号,窗口关闭,达到目标,getfund成功",async function () {
        await fundMe.fund({value: ethers.parseEther("0.08")})
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund())
            .to.be.emit(fundMe,"FundWithdrawByOwner")
            .withArgs(ethers.parseEther("0.08"));

    })
    it("达到目标,有fund,window关闭,refund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.08")})
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund()).to.be.revertedWith("TARGET IS REACHED");
    })
    it("未达到目标,无fund,window关闭,refund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.05")})
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMesecondAccount.refund()).to.be.revertedWith("there is not fund for you");
    })
    it("未达到目标,有fund,window开启中,refund失败",async function () {
        await fundMe.fund({value: ethers.parseEther("0.05")})
        await expect(fundMe.refund()).to.be.revertedWith("window is not closed");
    })
    it("未达到目标,有fund,window关闭,refund成功",async function () {
        await fundMe.fund({value: ethers.parseEther("0.05")})
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.refund()).emit(fundMe,"ReturnedToAccount")
        .withArgs(firstAccount,ethers.parseEther("0.05"));
    })

})