# CHX Token Swap

Contributors in Own will know that we launched our native blockchain earlier this year. As of today, CHX tokens exist on the Ethereum blockchain. As part of this development, we are swapping the CHX ERC-20 tokens we were previously using to a CHX mainnet token on our Own blockchain. This document explains the process of swapping the CHX token.


## High Level Overview

The CHX token swap process consists of three simple steps:

1. Create a new native CHX address using the [Own wallet](https://wallet.weown.com) on the Own blockchain network.
2. Submit your newly created native CHX address to the `CHXSwap` smart contract on the Ethereum network.
3. Wait for the tokens to be allocated to your CHX address on the Own blockchain network.

These steps are explained in more detail below. If, at any point you are unsure what to do, please get in touch via our support email: support@weown.com.

The entire process can be seen in the [video](https://www.youtube.com/watch?v=odV1KpsR-Vw) as well.


## Create the native CHX Address on the Own blockchain network

To create a native CHX address, follow these simple steps:

1. Go to the [Own wallet](https://wallet.weown.com), which uses the Own blockchain network.
2. Click on the "Create wallet" menu item (on the left side navigation menu).
3. Write down and safely store your recovery phrase (a list of 24 words). Remember: **without the recovery phrase you will not be able to restore your wallet** if you ever need to.
4. Enter a secure password to encrypt your keystore file. You can use this file and the password as an alternative mechanism to restore and access the wallet without exposing your recovery phrase. (**The recovery phrase is still most important and a primary way to restore the wallet, so make sure you don't ever lose it.**)
5. Click on the "Create wallet" button.
6. Save your keystore file in safe location.
7. Take a note of the wallet address shown in the upper left corner, as you will need it in the following steps.


## Submit the native CHX Address into the Ethereum Token Swap Smart Contract

1. Go to ["Interact with Contract" section on MyEtherWallet](https://www.myetherwallet.com/interface/interact-with-contract).
2. Access your Ethereum wallet, which holds the ERC-20 CHX tokens, using one of the methods MyEtherWallet offers.
3. Enter the following value in "Contract Address" field:
    ```
    0x59a8D0bdF9e024f060B230F8F54f291F4D03e2D5
    ```
4. Enter following text in "ABI/JSON Interface" field:
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
5. Click the "Continue" button.
6. Click the "Select an item" drop down button (to select the action from the contract) and choose `mapAddress` from the list.
7. Enter your native CHX address into the `_chxAddress` field.
8. Click the "Write" button.
9. Click the "Confirm and Send" button in the confirmation dialog.
10. Click the "Check Status on etherscan.io" button, to follow the status of the transaction.

Once the transaction is processed and you see the status `Success`, your part of the swap process is completed.

### A few important notes:

- The swap process will not require you to ever reveal your private key to anyone. You will only be required to sign a transaction for submitting your native CHX address into the smart contract. This is done via the above steps and your MyEtherWallet transaction. **We will never ask you for your private key – do not share or reveal this to anyone.**
- The swap process does not involve you sending ERC-20 CHX tokens or ETH to any address. **We will never ask you to send any of your tokens to an ETH address.**
- The above process requires just a small amount of ETH for the transaction fee (gas), so make sure your MyEtherWallet has enough ETH in balance.
- Do not change or modify the above ABI/JSON Interface text.


### How to check if your address is correctly mapped and submitted

1. Go to the [CHX swap contract page on etherscan.io](https://etherscan.io/address/0x59a8d0bdf9e024f060b230f8f54f291f4d03e2d5#readContract) ("Read Contract" section/tab).
2. Enter your Ethereum address in the input box under "mappedAddresses" section.
3. Click the "Query" button.
4. Your native CHX address should appear under the button, with the contract submission confirmed and stated.

If you made a mistake and mapped the wrong native CHX address, you will have to contact us to remove your mapping and allow you to do it again, **unless your tokens are already allocated on the Own blockchain**.


## Allocation of native CHX

The allocation of the native CHX tokens on the Own blockchain will be performed by Own staff during the first week of June, and then periodically once every week.

The tokens will be allocated to individual CHX addresses on the Own public blockchain from our genesis address [`CHXGEzcvxLFDTnS4L5pETLXxLsp3heH6KK1`](https://wallet.weown.com/address/CHXGEzcvxLFDTnS4L5pETLXxLsp3heH6KK1).
The balance on the genesis address represents all unallocated tokens, which are not yet swapped.

You can always check the balance of your native CHX address by entering it in the ["Address info" page in Own wallet](https://wallet.weown.com/address) and clicking the "Get address" button.

If your tokens are not allocated on the Own blockchain after 7 days, please contact our support team at support@weown.com.
