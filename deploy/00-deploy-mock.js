const {developmentChains,DECIMAL,INITIAL_ANSWER} = require("../helper-hadhat-config");

module.exports = async({getNamedAccounts,deployments}) =>{
    if(developmentChains.includes(network.name)){
    const firstAccount = (await getNamedAccounts()).firstAccount;//原始写法
    const {deploy} = deployments;//简单写法
    await deploy("MockV3Aggregator",{
        from: firstAccount,
        args: [DECIMAL,INITIAL_ANSWER],//小数位数&设定的eth转usd
        log: true
    })
    // console.log("这是一个部署函数")
    // console.log(`第一个账户的地址为${firstAccount}`)
}else{
    console.log("网络不是本地,跳过mock部署")
}
}
module.exports.tags = ["all","mock"];