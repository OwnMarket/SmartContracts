pragma solidity ^0.4.18;

import './CHXToken.sol';

contract CHXVestingVault {
    CHXToken private tokenContract;
    address public beneficiary;
    uint public vestingTime; // Point in time (as UNIX timestamp) at which tokens are available for withdrawal.

    function CHXVestingVault(address _tokenContractAddress, address _beneficiary, uint _vestingTime)
        public
    {
        tokenContract = CHXToken(_tokenContractAddress);
        beneficiary = _beneficiary;
        vestingTime = _vestingTime;
    }

    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary);
        _;
    }

    function changeBeneficiary(address _newBeneficiary)
        external
        onlyBeneficiary
    {
        beneficiary = _newBeneficiary;
    }

    function withdrawTokens()
        external
        onlyBeneficiary
    {
        require(vestingTime <= now);

        uint availableTokens = tokenContract.balanceOf(this);
        if (availableTokens > 0) {
            require(tokenContract.transfer(beneficiary, availableTokens));
        }
    }

    // Enable recovery of ether sent by mistake to this contract's address.
    function drainStrayEther(uint _amount)
        external
        onlyBeneficiary
        returns (bool)
    {
        beneficiary.transfer(_amount);
        return true;
    }
}
