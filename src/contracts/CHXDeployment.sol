pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './CHXToken.sol';
import './CHXTokenSale.sol';
import './CHXVestingVault.sol';

contract CHXDeployment is Ownable {
    CHXToken public tokenContract;
    CHXTokenSale public tokenSaleContract;

    function CHXDeployment()
        public
    {
        tokenContract = new CHXToken(msg.sender);
        tokenSaleContract = new CHXTokenSale(msg.sender, tokenContract);
    }

    function createCHXVestingVault(address _beneficiary, uint _vestingTime)
        public
    {
        new CHXVestingVault(tokenContract, _beneficiary, _vestingTime);
    }
}
