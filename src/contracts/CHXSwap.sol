pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';

contract CHXSwap is Ownable {
    event AddressMapped(address indexed ethAddress, string chxAddress);

    mapping (address => string) public mappedAddresses;

    function CHXSwap()
        public
    {
    }

    function mapAddress(string _chxAddress)
        external
    {
        address ethAddress = msg.sender;
        mappedAddresses[ethAddress] = _chxAddress;
        AddressMapped(ethAddress, _chxAddress);
    }

    function getMappedAddress(address _ethAddress)
        external
        view
        returns (string)
    {
        return mappedAddresses[_ethAddress];
    }

    // Enable recovery of ether sent by mistake to this contract's address.
    function drainStrayEther(uint _amount)
        external
        onlyOwner
        returns (bool)
    {
        owner.transfer(_amount);
        return true;
    }

    // Enable recovery of any ERC20 compatible token, sent by mistake to this contract's address.
    function drainStrayTokens(ERC20Basic _token, uint _amount)
        external
        onlyOwner
        returns (bool)
    {
        return _token.transfer(owner, _amount);
    }
}