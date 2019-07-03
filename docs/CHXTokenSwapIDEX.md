# CHX Token Swap for Balances Locked in IDEX Smart Contract

If your ERC-20 CHX tokens are locked in IDEX, you can still perform the swap and get the native CHX allocated on Own blockchain MainNet.
Process is the same as for regular swap. You need to map the native CHX address to the Ethereum address which has the ERC-20 CHX tokens locked in IDEX.

- Please take a look at the [token swap instructions announcement article](https://medium.com/ownmarket/our-token-swap-and-public-mainnet-launch-is-approaching-heres-what-to-do-c49de8288ceb) for more information about the swap.

- Follow the [detailed instructions](https://github.com/OwnMarket/SmartContracts/blob/master/docs/CHXTokenSwap.md).

- You can also watch the entire process in [the video](https://www.youtube.com/watch?v=odV1KpsR-Vw).

If you are not sure if your Ethereum address has tokens locked on IDEX, you can check that by following these steps:
- Go to this URL: https://etherscan.io/address/0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208#readContract
- Go to section "11. balanceOf"
- Enter CHX token contract address `0x1460a58096d80a50a2f1f956dda497611fa4f165` into "token (address)" field
- Enter your Ethereum address in the "user (address)" field
- Click "Query" button
- If your address has any CHX balance locked in IDEX contract, that balance will appear under the button.

**NOTE:** The balance in IDEX contract is not displayed as a decimal number. 18 rightmost digits represent the decimal fraction of the number.
E.g. 1300000000000000000 is 1.3 CHX

If the Ethereum address (which is holding your ERC-20 CHX balance in IDEX) already has a native CHX address mapped to it in the swap contract,
then you don't need to repeat the process. Your IDEX balance will be allocated to the same CHX address.
To check if you have already mapped the address:
- Go to this URL: https://etherscan.io/address/0x59a8d0bdf9e024f060b230f8f54f291f4d03e2d5#readContract
- Enter your ETH address in the "mappedAddresses" section and click "Query" button.
- If there is a CHX address returned and shown below the button, then you don't need to repeat the process.
