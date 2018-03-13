Functional Specification of CHX Token Contract
==============================================

![CHX Token Contract Hierarchy](CHXTokenContractHierarchy.png)

`CHXToken` is an [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) token contract, with the main purpose of keeping the records of CHX token holders' balances, and enabling transfers of tokens.

`CHXToken` contract is implemented by inheriting from base contracts available in [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity) library, as well as extending them by adding new functionality:

- Batch transfers
- Transfer restriction
- Draining stray Ether and other ERC20 tokens


### Batch transfers

To enable cost-effective transfers of tokens from/to multiple addresses, without having to process multiple transactions, this contract implements following batch transfer functions:

- `batchTransfer`
- `batchTransferFrom`
- `batchTransferFromMany`
- `batchTransferFromManyToMany`
- `batchApprove`
- `batchIncreaseApproval`
- `batchDecreaseApproval`

These functions are iterating over passed arrays of addresses/values and invoking equivalent standard ERC20 non-batch function in each iteration.


### Transfer restriction

Initial CHX token distribution will be done through token sale process, which requires transfers to be disabled for general public until the tokens sale is complete. However, contract owner must still be able to transfer tokens to investors during the token sale. To achieve this, `CHXToken` implements following:

- `isRestricted` state variable.
- `setRestrictedState` function, used to set value of `isRestricted` to `true` or `false`.
- `tokenSaleContractAddress` variable.
- `setTokenSaleContractAddress` function, used to set value of `tokenSaleContractAddress` variable to the address of the deployed token sale contract.
- `restricted` function modifier, used to restrict function invocation to owner and tokenSaleContractAddress only, depending on the state of the `isRestricted` variable. This modifier is applied to all transfer related functions.


### Draining stray Ether and other ERC20 tokens

`CHXToken` contract is not supposed to ever receive any Ether or other tokens. To prevent mistakenly sent Ether or tokens from being locked in `CHXToken` forever, two functions are provided to enable token contract owner to drain Ether or other ERC20 compatible tokens from `CHXToken` address.


### Token burning

By inheriting from OpenZeppelin library's `BurnableToken` contract, `CHXToken` contract allows tokens to be burned. However, `CHXToken` contract allows this function to be executed only by contract owner.
