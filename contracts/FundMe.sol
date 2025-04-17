// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
//收款函数
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//这是一个模拟产品上线前的预售系统

//创建一个收款函数
//记录投资人并查看
//在锁定期，达到目标值，生产商提款
//在锁定期，没达到目标值，投资人可以退款


contract FundMe{
    mapping (address =>uint256) public funderToAmount;//键值对
    uint256 constant  MINI_VALUE = 100 * 10 ** 18;//USD
    uint256 constant TARGET = 200 * 10 ** 18;//目标
    address public owner;
    uint256 deploymentTimestamp;
    uint256 lockTime;
    address erc20Addr;
    bool public getFundSuccess;
    
    AggregatorV3Interface internal dataFeed;
    
    constructor(uint256 _locktime) payable {//构造函数
        deploymentTimestamp = block.timestamp;

        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
        lockTime = _locktime;
    }
    
    function fund() external payable {//支出资产
        require(convertEthtoUsd(msg.value) >= MINI_VALUE, "You need to send more eth");
        require(block.timestamp < deploymentTimestamp + lockTime ,"window is closed");//时间限制
        funderToAmount[msg.sender] = msg.value;//查看
    }


    function getChainlinkDataFeedLatestAnswer() public view returns (int) {//喂价
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,//价格
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }
    function convertEthtoUsd(uint256 ethAmount) internal view  returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10**8);
    }


    function getFund() external windowClosed isOwner{
    //获取资产
    // Msg.sender 是约定调用方的地址。 address(this) 是智能合约本身的地址
   
    require(convertEthtoUsd(address(this).balance) >= TARGET,"TARGET IS NOT REACHED"); 
    
    

    //下方为常见的转钱方式

    //transfer  纯转账 失败返回eth
    // payable (msg.sender).transfer(address(this).balance);

    //send  纯转账 
    // bool success = payable(msg.sender).send(address(this).balance);
    // require(success,"tx failed");

    //call  中间穿插函数/数据（都可以处理 建议）
    bool success;
    (success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "tranafer tx failed");
    funderToAmount[msg.sender] = 0;
    getFundSuccess = true;//f


    }
    function transferOwnership(address newOwner) public isOwner{
        
        owner = newOwner;
        
    }
    function refund() external windowClosed{
        require(convertEthtoUsd(address(this).balance) < TARGET,"TARGET IS REACHED");
        uint256 amount =funderToAmount[msg.sender];
        require(amount != 0,"there is not fund for you");
        
        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "tranafer tx failed");
        amount = 0;
        

    }
    //修改函数，方便其他合约从外部更改数量
    function setFunderToAmount(address funder,uint amountToUpdate) external {
        require(msg.sender == erc20Addr,"you do not have permission to call this function");
        funderToAmount[funder] = amountToUpdate;

    }
    function setErc20Addr(address _erc20Addr) public isOwner{
        erc20Addr = _erc20Addr;
    }

    //require出现太多次，希望减少冗余，使用修改器
    //修改器
    modifier windowClosed (){
        // _;先执行原来的程序
        require(block.timestamp >= deploymentTimestamp + lockTime ,"window is not closed");//时间限制
        _;//先执行上面
    }
    modifier isOwner() {
        require(msg.sender == owner, "You are not owner");
        _;
    }
}