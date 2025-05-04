# 这是一个关于Web3相关知识学习的FundMe项目

这个项目基于hardhat所搭建，主要实现了Web3一个简单项目的实现，用于Web3学习。此项目实现了一个筹款系统，主要包括众筹资金，收款，退款，积分兑换功能等等。因为此项目是用来进行Web3学习，上传的文件中包括比较多的test文件，和一些我所写的对项目的一些调试代码以及一些无用文件，此md用来复盘以及记录如何使用。

## 安装

安装所需要的依赖，执行以下命令:
```shell
npm i
```
## 主要功能

1、FundMe的部署
2、对FundMe功能的测试

## 使用
### 创建配置文件
运行

```shell
npx env-enc set-pw
```
输入你的密码（请记住，后续使用项目时需要）
创建了一个名为".env.enc"的文件,它来自于chainlink。

```shell
npx env-enc set
```
设置四个变量
```info
SEPOLIA_URL
PRIVATE_KEY
ETHERSCAN_API_KEY
PRIVATE_KEY_1
```
SEPOLIA_URL为你的sepolia的RPC，用于调用sepolia。
PRIVATE_KEY为你的第一个账号，部署和测试需要。
PRIVATE_KEY_1为你的第二个账号，部署和测试需要。
ETHERSCAN_API_KEY为etherscan的API,用于验证合约。
### scripts分区
记录了按原始方法部署脚本
通过以下方式运行
```shell
npx hardhat run scripts/deployFundMe.js --network sepolia
```
由于datafeed和我本身技术的原因暂时不支持hardhat内置网络，此案后期已被代替。




下面是一些你可能用到的命令：
```shell
npx hardhat deploy --network sepolia --reset //重新部署合约
``` 
更新中·····