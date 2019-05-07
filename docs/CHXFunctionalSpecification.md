Functional Specification of CHX Contracts
=========================================


## CHXToken Contract

![CHX Token Contract Hierarchy](CHXTokenContractHierarchy.png)

`CHXToken` is an [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) token contract, with the main purpose of keeping the records of CHX token holders' balances, and enabling transfers of tokens.

`CHXToken` contract is implemented by inheriting from base contracts available in [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity) library, as well as extending them by adding new functionality:

- Batch transfers
- Transfer restriction
- Draining stray Ether and other ERC20 tokens


### Batch Transfers

To enable cost-effective transfers of tokens from/to multiple addresses, without having to process multiple transactions, this contract implements following batch transfer functions:

- `batchTransfer`
- `batchTransferFrom`
- `batchTransferFromMany`
- `batchTransferFromManyToMany`
- `batchApprove`
- `batchIncreaseApproval`
- `batchDecreaseApproval`

These functions are iterating over passed arrays of addresses/values and invoking equivalent standard ERC20 non-batch function in each iteration.


### Transfer Restriction

Initial CHX token distribution will be done through token sale process, which requires transfers to be disabled for general public until the tokens sale is complete. However, contract owner must still be able to transfer tokens to investors during the token sale. To achieve this, `CHXToken` implements following:

- `isRestricted` state variable.
- `setRestrictedState` function, used to set value of `isRestricted` to `true` or `false`.
- `tokenSaleContractAddress` variable.
- `setTokenSaleContractAddress` function, used to set value of `tokenSaleContractAddress` variable to the address of the deployed token sale contract.
- `restricted` function modifier, used to restrict function invocation to owner and tokenSaleContractAddress only, depending on the state of the `isRestricted` variable. This modifier is applied to all transfer related functions.


### Draining Stray Ether and Other ERC20 Tokens

`CHXToken` contract is not supposed to ever receive any Ether or other tokens. To prevent mistakenly sent Ether or tokens from being locked in `CHXToken` forever, two functions are provided to enable token contract owner to drain Ether or other ERC20 compatible tokens from `CHXToken` address.


### Token Burning

By inheriting from OpenZeppelin library's `BurnableToken` contract, `CHXToken` contract allows tokens to be burned. However, `CHXToken` contract allows this function to be executed only by contract owner.


## CHXTokenSale Contract

`CHXTokenSale` contract is the contract used for initial CHX token distribution, which will happen during public token sale period. Token sale is the process where Ether is sent to the token sale contract's address, and CHX tokens are received immediately upon processing the transaction.

`CHXTokenSale` contract inherits from `Whitelistable` contract, which implements the whitelist functionality, used to enforce *Know Your Customer* process (KYC).


### Configuring the Token Sale Settings

`CHXTokenSale` contract has following configurable properties:

- `saleStartTime` / `saleEndTime` which can be set by invoking `setSaleTime` function.
- `maxGasPrice`, which can be set by invoking `setMaxGasPrice` function.
- `minContribution`, which can be set by invoking `setMinContribution` function.
- `maxContributionPhase1`, which can be set by invoking `setMaxContributionPhase1` function.
- `maxContributionPhase2`, which can be set by invoking `setMaxContributionPhase2` function.
- `phase1DurationInHours`, which can be set by invoking `setPhase1DurationInHours` function.

Values passed into these functions should be as follows:

- Time should be expressed in UNIX timestamp.
- Gas price and contributions should be expressed in `wei`.
- Duration of the phase 1 should be expressed in hours (conversion to seconds is done internally).


### Whitelist

By inheriting from `Whitelistable`, `CHXTokenSale` contract has `addToWhitelist` and `removeFromWhitelist` functions, which can be used to add/remove investor addresses to/from the whitelist. Whitelist functionality is not available to anyone else, except contract owner and whitelist admin (as defined in `onlyOwnerOrWhitelistAdmin` modifier). Whitelist admin's address is stored in the `whitelistAdmin` variable, which can be set using the `setWhitelistAdmin` function.


### Sale

Before the public sale starts, an amount of tokens will be allocated for sale by transferring them to `CHXTokenSale` contract address. This will enable the token sale contract to allocate tokens to contributors, but only up to the amount allocated for sale.

During public sale, Ether is sent to token sale contract's address, resulting in invocation of the [fallback function](http://solidity.readthedocs.io/en/develop/contracts.html#fallback-function), which handles the purchase by doing following:

- Ensure that contribution is sent during the time window between `saleStartTime` and `saleEndTime` variables.
- Ensure that gas price is not higher than defined limit in `maxGasPrice` variable, to prevent unfair competition.
- Ensure contributor's address is white-listed.
- Ensure minimum and maximum contribution thresholds are met, where *maximum contribution* is defined as total amount of Ether sent from the same address.
- Transfer tokens to contributor's address.


### Withdrawals

Collected Ether in the token sale contract can be sent to an address of choice using `sendCollectedEther` function. This can be done multiple times during the sale.

Remaining unsold tokens can be sent to an address of choice (usually back to the `CHXToken` contract owner address) using `sendRemainingTokens` function. Obviously, after remaining tokens are sent, tokens sale contract can't accept any more contributions because its token balance is zero (nothing left to sell).


## CHXVestingVault Contract

The purpose of the `CHXVestingVault` contract is to provide the facility to lock the tokens until the specified moment in time, after which they can be withdrawn. Vesting vault has three properties:

- `tokenContract` (reference to the `CHXToken` contract, used to invoke the transfer of held tokens to the beneficiary)
- `beneficiary` (address of the account which will receive tokens once vesting time is reached and `withdrawTokens` function is invoked)
- `vestingTime` (a **point in time** (not duration), after which tokens become available for withdrawal)

`CHXVestingVault` contract might be created in many instances - whenever there is a need to have a certain amount of tokens locked until a certain point in time in the future.
To avoid having to deploy and wire it up with `CHXToken` contract every time it's needed, we have created the `CHXVestingVaultFactory` contract, which has the `createCHXVestingVault` function as a convenient way to create a new vesting vault by specifying only beneficiary address and vesting time.
Once a vesting vault is created, tokens can be transferred to its address.

Tokens held in the `CHXVestingVault` can be withdrawn by invoking `withdrawTokens`, but only after `vestingTime` is reached.

In the case that beneficiary's address is compromised, or he wants to give the right to withdraw tokens to someone else, he can change the beneficiary address by invoking the `changeBeneficiary` function.


## Deploying and Wiring Up

After `CHXToken`, `CHXTokenSale` and `CHXVestingVaultFactory` contracts are independently deployed (to avoid hitting max gas limit), they should be wired up in following way:

- `CHXToken` contract has a property named `tokenSaleContractAddress`, which should be set by calling the function `setTokenSaleContractAddress` and passing in the address of `CHXTokenSale` contract.
- `CHXTokenSale` contract has a property named `tokenContract`, which should be set by calling the function `setTokenContract` and passing in the address of `CHXToken` contract.
- `CHXVestingVaultFactory` contract has a property named `tokenContract`, which should be set by calling the function `setTokenContract` and passing in the address of `CHXToken` contract.


## CHXSwap Contract

The purpose of the `CHXSwap` contract is to map Ethereum addresses to native CHX addresses on Own blockchain. This will enable holders of ERC20 CHX tokens to register an address on Own blockchain, to which the balance of CHX will be allocated. The swap process is explained in the [announcement article](https://medium.com/ownmarket/own-native-blockchain-token-swap-explained-faq-f725a5e0f4e9).


### Address Submission/Mapping

`CHXSwap` contract exposes `mapAddress` function, which enables submission of a native CHX address (generated using [Own blockchain wallet](https://wallet.weown.com/wallet)), to be assigned to the sender's Ethereum address.


### Handling Mistakes

One Ethereum address can submit a corresponding native CHX address only once. If a mistake has been made, in order to repeat the submission, Ethereum address owner will have to contact Own to remove the mapped address. Unless native CHX tokens are already allocated to the mapped address on Own blockchain, Own staff will remove the mapped address using `removeMappedAddress` function, which can be executed only by contract owner.

To avoid abuse, address owner will have to prove the ownership of the Ethereum address by sending a small amount of ETH (just to cover reset TX fee) to Own's contract admin address.


### Draining Stray Ether and Other ERC20 Tokens

`CHXSwap` contract is not supposed to ever receive any Ether or other ERC20 tokens. To prevent mistakenly sent Ether or ERC20 tokens from being locked in `CHXSwap` forever, two functions are provided to enable token contract owner to drain Ether or other ERC20 compatible tokens from `CHXSwap` address.
