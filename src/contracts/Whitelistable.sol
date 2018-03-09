pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Whitelistable is Ownable {

    mapping (address => bool) whitelist;
    address public whitelistAdmin;

    function Whitelistable()
        public
    {
        whitelistAdmin = owner; // Owner fulfils the role of the admin initially, until new admin is set.
    }

    modifier onlyOwnerOrWhitelistAdmin() {
        require(msg.sender == owner || msg.sender == whitelistAdmin);
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender]);
        _;
    }

    function isWhitelisted(address _address)
        external
        view
        returns (bool)
    {
        return whitelist[_address];
    }

    function addToWhitelist(address[] _addresses)
        external
        onlyOwnerOrWhitelistAdmin
    {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
        }
    }

    function removeFromWhitelist(address[] _addresses)
        external
        onlyOwnerOrWhitelistAdmin
    {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = false;
        }
    }

    function setWhitelistAdmin(address _newAdmin)
        public
        onlyOwnerOrWhitelistAdmin
    {
        require(_newAdmin != address(0));
        whitelistAdmin = _newAdmin;
    }
}
