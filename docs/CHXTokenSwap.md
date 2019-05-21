# CHX Token Swap (DRAFT)

This document explains the process of swapping the CHX token from Ethereum network to Own blockchain MainNet.


## High Level Overview

The CHX token swap process consists of following steps:

- Create a new native CHX address using the [Own wallet](https://wallet.weown.com).
- Submit your native CHX address to the `CHXSwap` smart contract on Ethereum network.
- Wait for the tokens to be allocated to your CHX address on Own blockchain network.

Steps are explained in details below.


## Create Native CHX Address

**NOTE: These instructions correspond to the version of the wallet which will be deployed in last week of May 2019. Current version of the wallet doesn't support this workflow. Please do not start the swap process until new version of the Own wallet is available.**

To create a native CHX address, follow these steps:

- Go to [Own wallet](https://wallet.weown.com).
- Click on "Create wallet" menu item (on the left side).
- Write down / store your recovery phrase (list of 24 words) in a safe location. **Without recovery phrase you will not be able to restore your wallet** if you ever need to.
- Enter password to encrypt your keystore file. You can use this file as an alternative mechanism to restore the wallet in daily operations without exposing your recovery phrase. (Recovery phrase is still most important and primary way to restore the wallet, so make sure you have it.)
- Click on the "Create wallet" button.
- Save your keystore file in safe location.
- Copy (or make a note of) the wallet address shown on the left side, because you will need it in the next step.


## Submit Native CHX Address Into Token Swap Smart Contract

- Go to ["Interact with Contract" section on MyEtherWallet](https://www.myetherwallet.com/interface/interact-with-contract).
- Access your Ethereum wallet, which holds the ERC20 CHX tokens, using one of the methods MEW offers.
- Provide smart contract information in the form
    - Enter following value in "Contract Address" field:
        ```
        0x59a8D0bdF9e024f060B230F8F54f291F4D03e2D5
        ```
    - Enter following text in "ABI/JSON Interface" field:
        ```
        [
          {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "name": "mappedAddresses",
            "outputs": [
              {
                "name": "",
                "type": "string"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "ethAddress",
                "type": "address"
              },
              {
                "indexed": false,
                "name": "chxAddress",
                "type": "string"
              }
            ],
            "name": "AddressMapped",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "ethAddress",
                "type": "address"
              },
              {
                "indexed": false,
                "name": "chxAddress",
                "type": "string"
              }
            ],
            "name": "AddressMappingRemoved",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_chxAddress",
                "type": "string"
              }
            ],
            "name": "mapAddress",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_ethAddress",
                "type": "address"
              }
            ],
            "name": "removeMappedAddress",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_amount",
                "type": "uint256"
              }
            ],
            "name": "drainStrayEther",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_token",
                "type": "address"
              },
              {
                "name": "_amount",
                "type": "uint256"
              }
            ],
            "name": "drainStrayTokens",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ]
        ```
    - Click "Continue" button.
- Click "Select and item" drop down button (to select the action from the contract) and choose `mapAddress` from the list.
- Enter your native CHX Address into `_chxAddress` field.
- Click "Write" button.
- Click "Confirm and Send" button in the confirmation dialog.
- Click "Check Status on etherscan.io" button, to follow the execution of the transaction.

Once the transaction is processed and gets the status `Success`, your part of the swap process is completed.

**IMPORTANT:**

- Swap process will not require you to reveal you private key to someone. You will be required just to sign a transaction for submitting your CHX address into the smart contract.
- Swap process does not involve sending CHX ERC20 tokens or ETH to any address. You will just spend small amount of ETH for the transaction fee (gas).


### How to check if your address is correctly mapped

- Go to [contract page on etherscan.io](https://etherscan.io/address/0x59a8d0bdf9e024f060b230f8f54f291f4d03e2d5#readContract) ("Read Contract" section/tab).
- Enter your Ethereum address in the input box under "mappedAddresses" section.
- Click "Query" button.
- Your native CHX address should appear under the button.

If you made a mistake and mapped wrong CHX address, you will have to contact us to remove your mapping and allow you to do it again, **unless your tokens are already allocated on Own blockchain**.


## Wait for Token Allocation on Own Blockchain

Allocation of native CHX tokens on Own blockchain will be performed by Own staff once a week.

Tokens will be allocated to individual CHX addresses on Own public blockchain from genesis address `CHXGEzcvxLFDTnS4L5pETLXxLsp3heH6KK1`.
Balance on genesis address represents unallocated tokens for which swap process is not yet finished, or it wasn't even initiated by the token holders.

You can check the balance of your native CHX address by entering it in the [Address info page in Own wallet](https://wallet.weown.com) and clicking the "Get address info" button.

If your tokens are not allocated on Own blockchain in 7 days, after you have submitted your address mapping in swap smart contract, please contact Own at support@weown.com.
