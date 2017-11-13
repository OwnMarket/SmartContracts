const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXTokenSale = artifacts.require('./CHXTokenSale.sol')
const CHXToken = artifacts.require('./CHXToken.sol')

contract('CHXTokenSale', accounts => {
    const admin = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    let tokenRefundWallet
    let raisedEtherWallet

    let chxTokenSale
    let chxToken

    beforeEach(async () => {
        chxTokenSale = chxTokenSale || await CHXTokenSale.deployed()
        chxToken = chxToken || await CHXToken.at(await chxTokenSale.token.call())

        tokenRefundWallet = tokenRefundWallet || await chxTokenSale.TOKEN_REFUND_WALLET()
        raisedEtherWallet = raisedEtherWallet || await chxTokenSale.RAISED_ETHER_WALLET()
    })

    it('initialized correctly', async () => {
        assert(web3.eth.getBalance(raisedEtherWallet).equals(0), 'raisedEtherWallet balance mismatch')
        assert(web3.eth.getBalance(chxTokenSale.address).equals(0), 'Token sale contract ether balance mismatch')
        assert((await chxTokenSale.etherRaised()).equals(0), 'etherRaised mismatch')

        assert((await chxToken.balanceOf(tokenRefundWallet)).equals(0), 'tokenRefundWallet balance mismatch')
        assert((await chxToken.balanceOf(investor1)).equals(0), 'Investor 1 balance mismatch')
        assert((await chxToken.balanceOf(investor2)).equals(0), 'Investor 2 balance mismatch')
    })

    it('setup investments', async () => {
        // ARRANGE
        const startTime = await chxTokenSale.PUBLIC_SALE_START_TIME()
        await helpers.increaseEVMTimeTo(startTime)
        assert.isAtLeast(helpers.lastEVMTime(), startTime);

        // ACT
        await chxTokenSale.sendTransaction({from: investor1, value: web3.toWei(1, 'ether')})
        await chxTokenSale.sendTransaction({from: investor2, value: web3.toWei(2, 'ether')})

        // ASSERT
        assert(web3.eth.getBalance(raisedEtherWallet).equals(0), 'raisedEtherWallet balance mismatch')
        assert(web3.eth.getBalance(chxTokenSale.address).equals(web3.toWei(3, 'ether')), 'Token sale contract ether balance mismatch')
        assert((await chxTokenSale.etherRaised()).equals(web3.toWei(3, 'ether')), 'etherRaised mismatch')

        assert((await chxToken.balanceOf(tokenRefundWallet)).equals(0), 'tokenRefundWallet balance mismatch')
        assert((await chxToken.balanceOf(investor1)).equals(e18(1000)), 'Investor 1 balance mismatch')
        assert((await chxToken.balanceOf(investor2)).equals(e18(2000)), 'Investor 2 balance mismatch')
    })

    it('accepts refunds if enabled', async () => {
        // ARRANGE
        const ebdTime = await chxTokenSale.PUBLIC_SALE_END_TIME()
        await helpers.increaseEVMTimeTo(ebdTime)
        assert.isAtLeast(helpers.lastEVMTime(), ebdTime);

        await chxTokenSale.enableRefunds()
        assert.isTrue(await chxTokenSale.refundsEnabled.call(), 'Refunds should be enabled')

        // ACT
        await chxTokenSale.claimRefund({from: investor1})
        await chxTokenSale.claimRefund({from: investor2})

        // ASSERT
        assert(web3.eth.getBalance(raisedEtherWallet).equals(0), 'raisedEtherWallet balance mismatch')
        assert(web3.eth.getBalance(chxTokenSale.address).equals(web3.toWei(0, 'ether')), 'Token sale contract ether balance mismatch')
        assert((await chxTokenSale.etherRaised()).equals(web3.toWei(3, 'ether')), 'etherRaised mismatch')

        assert((await chxToken.balanceOf(tokenRefundWallet)).equals(e18(3000)), 'tokenRefundWallet balance mismatch')
        assert((await chxToken.balanceOf(investor1)).equals(e18(0)), 'Investor 1 balance mismatch')
        assert((await chxToken.balanceOf(investor2)).equals(e18(0)), 'Investor 2 balance mismatch')
    })

    it('rejects refunds if not enabled', async () => {
        // ARRANGE
        await chxTokenSale.disableRefunds()
        assert.isFalse(await chxTokenSale.refundsEnabled.call(), 'Refunds should not be enabled')

        // ACT
        await helpers.shouldFail(chxTokenSale.claimRefund({from: investor3}))
    })
})
