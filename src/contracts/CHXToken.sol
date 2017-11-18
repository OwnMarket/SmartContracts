pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import './SaleAware.sol';

contract CHXToken is BurnableToken, PausableToken, SaleAware {
    string public constant name = "Chainium";
    string public constant symbol = "CHX";
    uint8 public constant decimals = 18;

    function CHXToken(uint _totalSupply, address _contractOwner, address _tokenRefundWallet)
        public
        // msg.sender is token sale contract; CHXToken will be instantiated by CHXTokenSale.
        SaleAware(msg.sender, _tokenRefundWallet)
    {
        totalSupply = _totalSupply;

        balances[tokenSaleContract] = totalSupply;
        Transfer(0x0, tokenSaleContract, totalSupply);

        transferOwnership(_contractOwner);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Balance changes guarded with token sale aware logic
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function burn(uint _value)
        public
        onlyOwner
        whenNotPaused
        restrictedDuringTokenSale
    {
        super.burn(_value);
    }

    function transfer(address _to, uint _value)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_to != address(this));
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint _value)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_to != address(this));
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint _value)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue)
        public
        restrictedDuringTokenSale
        returns (bool success)
    {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue)
        public
        restrictedDuringTokenSale
        returns (bool success)
    {
        return super.decreaseApproval(_spender, _subtractedValue);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Batch transfers
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function batchTransfer(address[] _recipients, uint[] _values)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_recipients.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transfer(_recipients[i], _values[i]));
        }

        return true;
    }

    function batchTransferFrom(address _from, address[] _recipients, uint[] _values)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_recipients.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transferFrom(_from, _recipients[i], _values[i]));
        }

        return true;
    }

    function batchTransferFromMany(address[] _senders, address _to, uint[] _values)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_senders.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(transferFrom(_senders[i], _to, _values[i]));
        }

        return true;
    }

    function batchTransferFromManyToMany(address[] _senders, address[] _recipients, uint[] _values)
        public
        restrictedDuringTokenSale
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
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_spenders.length == _values.length);

        for (uint i = 0; i < _values.length; i++) {
            require(approve(_spenders[i], _values[i]));
        }

        return true;
    }

    function batchIncreaseApproval(address[] _spenders, uint[] _addedValues)
        public
        restrictedDuringTokenSale
        returns (bool)
    {
        require(_spenders.length == _addedValues.length);

        for (uint i = 0; i < _addedValues.length; i++) {
            require(increaseApproval(_spenders[i], _addedValues[i]));
        }

        return true;
    }

    function batchDecreaseApproval(address[] _spenders, uint[] _subtractedValues)
        public
        restrictedDuringTokenSale
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

    // Enable recovery of ether sent by mistake to this contract's address.
    function drainStrayEther(uint _amount)
        public
        onlyOwner
        returns (bool)
    {
        owner.transfer(_amount);
        return true;
    }

    // Enable recovery of any ERC20 compatible token, sent by mistake to this contract's address.
    function drainStrayTokens(ERC20Basic _token, uint _amount)
        public
        onlyOwner
        returns (bool)
    {
        return _token.transfer(owner, _amount);
    }
}
