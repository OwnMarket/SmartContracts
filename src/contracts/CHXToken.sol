pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract CHXToken is BurnableToken, Ownable {
    string public constant name = "Chainium";
    string public constant symbol = "CHX";
    uint8 public constant decimals = 18;

    bool public isRestricted = true;
    address public tokenSaleContractAddress;

    function CHXToken()
        public
    {
        totalSupply = 200000000e18;
        balances[owner] = totalSupply;
        Transfer(address(0), owner, totalSupply);
    }

    function setTokenSaleContractAddress(address _tokenSaleContractAddress)
        external
        onlyOwner
    {
        require(_tokenSaleContractAddress != address(0));
        tokenSaleContractAddress = _tokenSaleContractAddress;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Transfer Restriction
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function setRestrictedState(bool _isRestricted)
        external
        onlyOwner
    {
        isRestricted = _isRestricted;
    }

    modifier restricted() {
        if (isRestricted) {
            require(
                msg.sender == owner ||
                (msg.sender == tokenSaleContractAddress && tokenSaleContractAddress != address(0))
            );
        }
        _;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Transfers
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function transfer(address _to, uint _value)
        public
        restricted
        returns (bool)
    {
        require(_to != address(this));
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint _value)
        public
        restricted
        returns (bool)
    {
        require(_to != address(this));
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint _value)
        public
        restricted
        returns (bool)
    {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue)
        public
        restricted
        returns (bool success)
    {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue)
        public
        restricted
        returns (bool success)
    {
        return super.decreaseApproval(_spender, _subtractedValue);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Batch transfers
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function batchTransfer(address[] _recipients, uint[] _values)
        external
        returns (bool)
    {
        require(_recipients.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transfer(_recipients[i], _values[i]));
        }

        return true;
    }

    function batchTransferFrom(address _from, address[] _recipients, uint[] _values)
        external
        returns (bool)
    {
        require(_recipients.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transferFrom(_from, _recipients[i], _values[i]));
        }

        return true;
    }

    function batchTransferFromMany(address[] _senders, address _to, uint[] _values)
        external
        returns (bool)
    {
        require(_senders.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transferFrom(_senders[i], _to, _values[i]));
        }

        return true;
    }

    function batchTransferFromManyToMany(address[] _senders, address[] _recipients, uint[] _values)
        external
        returns (bool)
    {
        require(_senders.length == _recipients.length);
        require(_senders.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transferFrom(_senders[i], _recipients[i], _values[i]));
        }

        return true;
    }

    function batchApprove(address[] _spenders, uint[] _values)
        external
        returns (bool)
    {
        require(_spenders.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(approve(_spenders[i], _values[i]));
        }

        return true;
    }

    function batchIncreaseApproval(address[] _spenders, uint[] _addedValues)
        external
        returns (bool)
    {
        require(_spenders.length == _addedValues.length);

        for (uint i = 0; i < _addedValues.length; i++) {
            require(increaseApproval(_spenders[i], _addedValues[i]));
        }

        return true;
    }

    function batchDecreaseApproval(address[] _spenders, uint[] _subtractedValues)
        external
        returns (bool)
    {
        require(_spenders.length == _subtractedValues.length);

        for (uint i = 0; i < _subtractedValues.length; i++) {
            require(decreaseApproval(_spenders[i], _subtractedValues[i]));
        }

        return true;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Miscellaneous
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function burn(uint _value)
        public
        onlyOwner
    {
        super.burn(_value);
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
