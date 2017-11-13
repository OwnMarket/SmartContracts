pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract SaleAware is BasicToken, Ownable {
    using SafeMath for uint;

    event TokensReturned(address indexed investor, uint tokens);

    address public tokenSaleContract;
    address public tokenRefundWallet;
    bool public tokenSaleClosed = false;

    function SaleAware(address _tokenSaleContract, address _tokenRefundWallet) public {
        require(_tokenSaleContract != address(0));
        require(_tokenRefundWallet != address(0));

        tokenSaleContract = _tokenSaleContract;
        tokenRefundWallet = _tokenRefundWallet;
    }

    modifier onlyTokenSaleContract() {
        require(msg.sender == tokenSaleContract);
        _;
    }

    modifier restrictedDuringTokenSale() {
        if (!tokenSaleClosed) {
            require(msg.sender == tokenSaleContract || msg.sender == owner);
        }
        _;
    }

    modifier onlyDuringTokenSale() {
        require(!tokenSaleClosed);
        _;
    }

    modifier onlyAfterTokenSale() {
        require(tokenSaleClosed);
        _;
    }

    function closeTokenSale() public onlyTokenSaleContract onlyDuringTokenSale returns (bool) {
        tokenSaleClosed = true;
        return tokenSaleClosed;
    }

    function returnForRefund(uint _amount) public onlyTokenSaleContract returns (bool) {
        address refundInitiator = tx.origin;

        // SafeMath will throw if there is not enough balance.
        balances[refundInitiator] = balances[refundInitiator].sub(_amount);
        balances[tokenRefundWallet] = balances[tokenRefundWallet].add(_amount);

        Transfer(refundInitiator, tokenRefundWallet, _amount);
        TokensReturned(refundInitiator, _amount);

        return true;
    }
}
