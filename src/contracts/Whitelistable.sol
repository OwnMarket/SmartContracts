pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Whitelistable is Ownable {
    mapping (address => bool) whitelist;
    address saleOperator;

    event WhitelistStatusChanged(address indexed listedAddress, bool isWhitelisted);

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender]);
        _;
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelist[_address];
    }

    function setWhitelistStatus(address _address, bool _isWhitelisted) public {
        require(msg.sender == owner || msg.sender == saleOperator);

        whitelist[_address] = _isWhitelisted;
        WhitelistStatusChanged(_address, _isWhitelisted);
    }

    function batchSetWhitelistStatus(address[] _addresses, bool _isWhitelisted) public {
        for (uint i = 0; i < _addresses.length; i++) {
            setWhitelistStatus(_addresses[i], _isWhitelisted);
        }
    }
}
