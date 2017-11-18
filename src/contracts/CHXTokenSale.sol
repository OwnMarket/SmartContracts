pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Whitelistable.sol';
import './CHXToken.sol';

contract CHXTokenSale is Whitelistable {
    using SafeMath for uint;

    event TokenPurchasedOnline(address indexed investor, uint contribution, uint tokens);
    event TokenPurchasedOffline(address indexed investor, uint tokens);
    event EtherRefunded(address indexed investor, uint contribution);

    uint public constant TOTAL_SUPPLY =       100000000e18;
    uint public constant SALE_CAP =            50000000e18;
    uint public constant RESERVE_FUND_TOKENS = 20000000e18;
    uint public constant FOUNDERS_TOKENS =     25000000e18;
    uint public constant ICO_COSTS_TOKENS =     5000000e18;

    uint public constant TOKEN_SALE_RATE = 1000; // Assumes token has 18 decimals
    uint public constant MIN_CONTRIBUTION = 100 finney; // 0.1 ETH
    uint public constant KYC_THRESHOLD = 2500 finney; // 2.5 ETH

    uint public constant PUBLIC_SALE_START_TIME = 1514203200; // 2017-12-25 12:00 UTC
    uint public constant PUBLIC_SALE_END_TIME = PUBLIC_SALE_START_TIME + 18 days; // 2018-01-12 12:00 UTC

    address public constant SALE_OPERATOR_ADDRESS = 0x226E6426eAc1163a7c57C63c98Aa54AF7FABcd3F; // TODO: Set real address
    address public constant RESERVE_FUND_WALLET = 0x548615698D8d12e13c402a6D19C1d4F9a3171372; // TODO: Set real wallet
    address public constant FOUNDERS_WALLET = 0xC3133130Ef27Fc9AE86F9B79f99456B4C2566d74; // TODO: Set real wallet
    address public constant ICO_COSTS_WALLET = 0x3441A4154c43fF1ADDaffEde60BBD1f6ef20a1C9; // TODO: Set real wallet
    address public constant TOKEN_REFUND_WALLET = 0xaDDb2268d5Ba05a1165FD7dD0F01C3823a9bb935; // TODO: Set real wallet
    address public constant RAISED_ETHER_WALLET = 0x67A2aa7E9a8C8AAb54d4e30a1471Aa2940D5d259; // TODO: Set real wallet

    mapping (address => uint) public etherContributions;
    mapping (address => uint) public tokenPurchases;

    uint public etherRaised;
    uint public tokensSoldOnline;
    uint public tokensSoldOffline;

    uint public offlineSaleCap = 25000000e18;

    bool public refundsEnabled;

    CHXToken public token;

    function CHXTokenSale() public {
        assert(PUBLIC_SALE_START_TIME < PUBLIC_SALE_END_TIME);
        assert(TOTAL_SUPPLY == SALE_CAP.add(RESERVE_FUND_TOKENS).add(FOUNDERS_TOKENS).add(ICO_COSTS_TOKENS));

        whitelistOperator = SALE_OPERATOR_ADDRESS;

        token = new CHXToken(TOTAL_SUPPLY, owner, TOKEN_REFUND_WALLET);
        assert(token.decimals() == 18); // Calculations are simplified by assuming 18 decimals (1 ETH = 10^18 WEI)

        require(token.transfer(FOUNDERS_WALLET, FOUNDERS_TOKENS));
        require(token.transfer(RESERVE_FUND_WALLET, RESERVE_FUND_TOKENS));
        require(token.transfer(ICO_COSTS_WALLET, ICO_COSTS_TOKENS));
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Sale
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function() public payable {
        buyTokens();
    }

    function buyTokens() public payable onlyDuringSale {
        address investor = msg.sender;
        uint contribution = msg.value;
        require(contribution >= MIN_CONTRIBUTION);
        if (etherContributions[investor].add(contribution) > KYC_THRESHOLD) {
            require(whitelist[investor]);
        }

        etherContributions[investor] = etherContributions[investor].add(contribution);
        etherRaised = etherRaised.add(contribution);

        uint tokens = calculateTokens(contribution);
        require(tokensSoldOnline.add(tokens) <= SALE_CAP.sub(offlineSaleCap));
        tokensSoldOnline = tokensSoldOnline.add(tokens);

        processTokenPurchase(investor, tokens);
        TokenPurchasedOnline(investor, contribution, tokens);
    }

    function processTokenPurchase(address _investor, uint _tokens) private {
        require(tokensSoldOnline.add(tokensSoldOffline) <= SALE_CAP);
        tokenPurchases[_investor] = tokenPurchases[_investor].add(_tokens);

        require(token.transfer(_investor, _tokens));
    }

    function processOfflinePurchase(address _investor, uint _tokens) public onlyOwner {
        require(tokensSoldOffline.add(_tokens) <= offlineSaleCap);
        tokensSoldOffline = tokensSoldOffline.add(_tokens);

        processTokenPurchase(_investor, _tokens);
        TokenPurchasedOffline(_investor, _tokens);
    }

    function batchProcessOfflinePurchase(address[] _investors, uint[] _tokens) public onlyOwner {
        require(_investors.length == _tokens.length);

        for (uint i = 0; i < _investors.length; i++) {
            processOfflinePurchase(_investors[i], _tokens[i]);
        }
    }

    function calculateTokens(uint _contribution) public view returns (uint) {
        return _contribution.mul(TOKEN_SALE_RATE);
    }

    function setOfflineSaleCap(uint _newOfflineSaleCap) public onlyOwner {
        require(_newOfflineSaleCap >= tokensSoldOffline);
        require(_newOfflineSaleCap <= SALE_CAP.sub(tokensSoldOnline));
        offlineSaleCap = _newOfflineSaleCap;
    }

    modifier onlyDuringSale() {
        require(PUBLIC_SALE_START_TIME <= now && now < PUBLIC_SALE_END_TIME);
        _;
    }

    modifier onlyAfterSaleEnd() {
        require(now >= PUBLIC_SALE_END_TIME);
        _;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Refunds
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    modifier onlyIfRefundsEnabled() {
        require(refundsEnabled);
        _;
    }

    function enableRefunds() public onlyOwner onlyAfterSaleEnd {
        refundsEnabled = true;
    }

    function disableRefunds() public onlyOwner onlyAfterSaleEnd {
        refundsEnabled = false;
    }

    function claimRefund() public onlyIfRefundsEnabled onlyAfterSaleEnd {
        uint contribution = etherContributions[msg.sender];
        uint tokens = calculateTokens(contribution);

        require(contribution > 0);

        etherContributions[msg.sender] = 0;
        tokenPurchases[msg.sender] = tokenPurchases[msg.sender].sub(tokens);
        require(token.returnForRefund(tokens));

        msg.sender.transfer(contribution);
        EtherRefunded(msg.sender, contribution);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Closing
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function closeTokenSale() public onlyOwner onlyAfterSaleEnd {
        disableRefunds();

        uint unsoldTokens = token.balanceOf(this);
        if (unsoldTokens > 0) {
            require(token.transfer(RESERVE_FUND_WALLET, unsoldTokens));
        }

        if (this.balance > 0) {
            RAISED_ETHER_WALLET.transfer(this.balance);
        }

        require(token.closeTokenSale()); // Lift transfer restrictions
    }
}
