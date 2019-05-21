pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './CHXToken.sol';
import './CHXVestingVault.sol';

contract CHXVestingVaultFactory is Ownable {
    CHXToken public tokenContract;
    address[] public vestingVaults;

    function CHXVestingVaultFactory()
        public
    {
    }

    function setTokenContract(address _tokenContractAddress)
        external
        onlyOwner
    {
        require(_tokenContractAddress != address(0));
        tokenContract = CHXToken(_tokenContractAddress);
    }

    function createCHXVestingVault(address _beneficiary, uint _vestingTime)
        external
    {
        require(tokenContract != address(0));
        vestingVaults.push(new CHXVestingVault(tokenContract, _beneficiary, _vestingTime));
    }

    function numberOfVaultsCreated()
        public
        view
        returns(uint)
    {
        return vestingVaults.length;
    }
}
