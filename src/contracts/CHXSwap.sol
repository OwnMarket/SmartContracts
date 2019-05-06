pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';

contract CHXSwap is Ownable {
    event AddressMapped(address indexed ethAddress, string chxAddress);
    event AddressMappingRemoved(address indexed ethAddress, string chxAddress);

    mapping (address => string) public mappedAddresses;

    function CHXSwap()
        public
    {
    }

    function mapAddress(string _chxAddress)
        external
    {
        address ethAddress = msg.sender;
        require(bytes(mappedAddresses[ethAddress]).length == 0);
        mappedAddresses[ethAddress] = _chxAddress;
        AddressMapped(ethAddress, _chxAddress);
    }

    function removeMappedAddress(address _ethAddress)
        external
        onlyOwner
    {
        require(bytes(mappedAddresses[_ethAddress]).length != 0);
        string memory chxAddress = mappedAddresses[_ethAddress];
        delete mappedAddresses[_ethAddress];
        AddressMappingRemoved(_ethAddress, chxAddress);
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

    // Enable recovery of any ERC20 compatible token sent by mistake to this contract's address.
    function drainStrayTokens(ERC20Basic _token, uint _amount)
        external
        onlyOwner
        returns (bool)
    {
        return _token.transfer(owner, _amount);
    }
}
