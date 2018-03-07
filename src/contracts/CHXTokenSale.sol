pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Whitelistable.sol';
import './CHXToken.sol';

contract CHXTokenSale is Whitelistable {
    using SafeMath for uint;

    event TokenPurchased(address indexed investor, uint contribution, uint tokens);

    uint public constant TOKEN_PRICE = 170 szabo; // Assumes token has 18 decimals

    uint public saleStartTime;
    uint public saleEndTime;
    uint public maxGasPrice = 20e9 wei; // 20 GWEI - to prevent "gas race"
    uint public minContribution = 100 finney; // 0.1 ETH
    uint public maxContributionPhase1 = 500 finney; // 0.5 ETH
    uint public maxContributionPhase2 = 10 ether;
    uint public phase1DurationInHours = 24;

    CHXToken public tokenContract;

    mapping (address => uint) public etherContributions;
    mapping (address => uint) public tokenAllocations;
    uint public etherCollected;
    uint public tokensSold;

    function CHXTokenSale(address _owner, address _tokenContractAddress)
        public
    {
        transferOwnership(_owner);

        tokenContract = CHXToken(_tokenContractAddress);
        assert(tokenContract.decimals() == 18); // Calculations assume 18 decimals (1 ETH = 10^18 WEI)
    }

    function transferOwnership(address newOwner)
        public
        onlyOwner
    {
        require(newOwner != owner);

        if (whitelistAdmin == owner) {
            setWhitelistAdmin(newOwner);
        }

        super.transferOwnership(newOwner);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Sale
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function()
        public
        payable
    {
        address investor = msg.sender;
        uint contribution = msg.value;

        require(saleStartTime <= now && now <= saleEndTime);
        require(tx.gasprice <= maxGasPrice);
        require(whitelist[investor]);
        require(contribution >= minContribution);
        if (phase1DurationInHours.mul(1 hours).add(saleStartTime) >= now) {
            require(etherContributions[investor].add(contribution) <= maxContributionPhase1);
        } else {
            require(etherContributions[investor].add(contribution) <= maxContributionPhase2);
        }

        etherContributions[investor] = etherContributions[investor].add(contribution);
        etherCollected = etherCollected.add(contribution);

        uint multiplier = 1e18; // 18 decimal places
        uint tokens = contribution.mul(multiplier).div(TOKEN_PRICE);
        tokenAllocations[investor] = tokenAllocations[investor].add(tokens);
        tokensSold = tokensSold.add(tokens);

        require(tokenContract.transfer(investor, tokens));
        TokenPurchased(investor, contribution, tokens);
    }

    function sendCollectedEther(address _recipient)
        public
        onlyOwner
    {
        if (this.balance > 0) {
            _recipient.transfer(this.balance);
        }
    }

    function sendRemainingTokens(address _recipient)
        public
        onlyOwner
    {
        uint unsoldTokens = tokenContract.balanceOf(this);
        if (unsoldTokens > 0) {
            require(tokenContract.transfer(_recipient, unsoldTokens));
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function setSaleTime(uint _newStartTime, uint _newEndTime)
        public
        onlyOwner
    {
        require(_newStartTime <= _newEndTime);
        saleStartTime = _newStartTime;
        saleEndTime = _newEndTime;
    }

    function setMaxGasPrice(uint _newMaxGasPrice)
        public
        onlyOwner
    {
        require(_newMaxGasPrice > 0);
        maxGasPrice = _newMaxGasPrice;
    }

    function setMinContribution(uint _newMinContribution)
        public
        onlyOwner
    {
        require(_newMinContribution > 0);
        minContribution = _newMinContribution;
    }

    function setMaxContributionPhase1(uint _newMaxContributionPhase1)
        public
        onlyOwner
    {
        require(_newMaxContributionPhase1 > minContribution);
        maxContributionPhase1 = _newMaxContributionPhase1;
    }

    function setMaxContributionPhase2(uint _newMaxContributionPhase2)
        public
        onlyOwner
    {
        require(_newMaxContributionPhase2 > minContribution);
        maxContributionPhase2 = _newMaxContributionPhase2;
    }

    function setPhase1DurationInHours(uint _newPhase1DurationInHours)
        public
        onlyOwner
    {
        require(_newPhase1DurationInHours > 0);
        phase1DurationInHours = _newPhase1DurationInHours;
    }
}
