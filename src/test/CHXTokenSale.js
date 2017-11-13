const helpers = require('./helpers.js')
const e18 = helpers.e18
const duration = helpers.duration
const toBigNumber = web3.toBigNumber

const CHXTokenSale = artifacts.require('./CHXTokenSale.sol')
const CHXToken = artifacts.require('./CHXToken.sol')

contract('CHXTokenSale', accounts => {
    const tokenSaleStartTime = toBigNumber(Date.UTC(2017, 11, 25, 12) / 1000); // 2017-12-25 12:00 UTC
    const tokenSaleEndTime = tokenSaleStartTime.add(duration.days(18)); // 2018-01-12 12:00 UTC

    const totalSupply = e18(100000000)
    const maxGoal = e18(50000000)
    const foundersTokenAmount = e18(25000000)
    const reserveFundTokenAmount = e18(20000000)
    const icoCostsTokenAmount = e18(5000000)

    const admin = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    let foundersWallet
    let icoCostsWallet
    let reserveFundWallet
    let tokenRefundWallet
    let raisedEtherWallet

    let chxTokenSale
    let chxToken

    beforeEach(async () => {
        chxTokenSale = chxTokenSale || await CHXTokenSale.deployed()
        chxToken = chxToken || await CHXToken.at(await chxTokenSale.token.call())

        foundersWallet = foundersWallet || await chxTokenSale.FOUNDERS_WALLET()
        icoCostsWallet = icoCostsWallet || await chxTokenSale.ICO_COSTS_WALLET()
        reserveFundWallet = reserveFundWallet || await chxTokenSale.RESERVE_FUND_WALLET()
        tokenRefundWallet = tokenRefundWallet || await chxTokenSale.TOKEN_REFUND_WALLET()
        raisedEtherWallet = raisedEtherWallet || await chxTokenSale.RAISED_ETHER_WALLET()
    })

    it('initialized correctly', async () => {
        assert((await chxTokenSale.PUBLIC_SALE_START_TIME()).equals(tokenSaleStartTime),
            'Token sale start time mismatch')

        assert(maxGoal.add(foundersTokenAmount).add(icoCostsTokenAmount).add(reserveFundTokenAmount).equals(totalSupply),
            "Sums don't match")

        assert((await chxToken.totalSupply()).equals(totalSupply),
            'Total supply mismatch')

        assert((await chxToken.balanceOf(chxTokenSale.address)).equals(maxGoal),
            'Token sale contract balance mismatch')
        assert((await chxToken.balanceOf(foundersWallet)).equals(foundersTokenAmount),
            'Founders balance mismatch')
        assert((await chxToken.balanceOf(icoCostsWallet)).equals(icoCostsTokenAmount),
            'ICO costs balance mismatch')
        assert((await chxToken.balanceOf(reserveFundWallet)).equals(reserveFundTokenAmount),
            'Reserve fund balance mismatch')
        assert((await chxToken.balanceOf(tokenRefundWallet)).equals(0),
            'Token refund balance mismatch')
        assert((await chxToken.balanceOf(raisedEtherWallet)).equals(0),
            'Raised Ether balance mismatch')
    })

    it('rejects investments before start time', async () => {
        await helpers.shouldFail(chxTokenSale.sendTransaction({from: investor1, value: web3.toWei(1, 'ether')}))
    })

    it('accepts investments and updates balances during sale', async () => {
        // ARRANGE
        const publicSaleStartTime = await chxTokenSale.PUBLIC_SALE_START_TIME()
        await helpers.increaseEVMTimeTo(publicSaleStartTime)
        assert.isAtLeast(helpers.lastEVMTime(), publicSaleStartTime, 'Time not set correctly');

        const tokenSaleBalanceBefore = await chxToken.balanceOf(chxTokenSale.address)
        const investorBalanceBefore = await chxToken.balanceOf(investor1)

        const tokenSaleEtherBalanceBefore = web3.eth.getBalance(chxTokenSale.address)
        const etherRaisedBefore = await chxTokenSale.etherRaised()
        const etherContributionBefore = await chxTokenSale.etherContributions(investor1)
        const tokensSoldBefore = await chxTokenSale.tokensSoldOnline()
        const tokenPurchaseBefore = await chxTokenSale.tokenPurchases(investor1)

        const etherSent = web3.toWei(1, 'ether')

        // ACT
        await chxTokenSale.sendTransaction({from: investor1, value: etherSent})

        // ASSERT
        const tokenSaleRate = await chxTokenSale.TOKEN_SALE_RATE()
        const tokensPurchased = toBigNumber(etherSent).mul(tokenSaleRate)
        const tokenSaleBalanceAfter = await chxToken.balanceOf(chxTokenSale.address)
        const investorBalanceAfter = await chxToken.balanceOf(investor1)

        const tokenSaleEtherBalanceAfter = web3.eth.getBalance(chxTokenSale.address)
        const etherRaisedAfter = await chxTokenSale.etherRaised()
        const etherContributionAfter = await chxTokenSale.etherContributions(investor1)
        const tokensSoldAfter = await chxTokenSale.tokensSoldOnline()
        const tokenPurchaseAfter = await chxTokenSale.tokenPurchases(investor1)

        assert(tokenSaleBalanceBefore.sub(tokensPurchased).equals(tokenSaleBalanceAfter), 'Token sale balance mismatch')
        assert(investorBalanceBefore.add(tokensPurchased).equals(investorBalanceAfter), 'Investor balance mismatch')

        assert(tokenSaleEtherBalanceBefore.add(etherSent).equals(tokenSaleEtherBalanceAfter),
            'Token sale ether balance mismatch')

        assert(etherRaisedBefore.add(etherSent).equals(etherRaisedAfter), 'etherRaised balance mismatch')
        assert(etherContributionBefore.add(etherSent).equals(etherContributionAfter), 'etherContributions mismatch')

        assert(tokensSoldBefore.add(tokensPurchased).equals(tokensSoldAfter), 'tokensSold mismatch')
        assert(tokenPurchaseBefore.add(tokensPurchased).equals(tokenPurchaseAfter), 'tokenPurchases mismatch')
    })

    it('rejects investments over KYC threshold if not whitelisted', async () => {
        // ARRANGE
        const kycThreshold = await chxTokenSale.KYC_THRESHOLD()
        const etherSent = kycThreshold.add(1) // Amount over KYC threshold
        const investorContributionBefore = await chxTokenSale.etherContributions(investor1)

        // ACT
        await helpers.shouldFail(chxTokenSale.sendTransaction({from: investor1, value: etherSent}))

        // ASSERT
        const investorContributionAfter = await chxTokenSale.etherContributions(investor1)
        assert(investorContributionBefore.equals(investorContributionAfter), 'Investor deposit mismatch')
    })

    it('accepts investments over KYC threshold if whitelisted', async () => {
        // ARRANGE
        const kycThreshold = await chxTokenSale.KYC_THRESHOLD()
        const etherSent = kycThreshold.add(1) // Amount over KYC threshold
        const investorContributionBefore = await chxTokenSale.etherContributions(investor1)

        await chxTokenSale.batchSetWhitelistStatus([investor1, investor2, investor3], true)

        // ACT
        await chxTokenSale.sendTransaction({from: investor1, value: etherSent})

        // ASSERT
        const investorContributionAfter = await chxTokenSale.etherContributions(investor1)
        assert(investorContributionAfter.greaterThan(kycThreshold))
        assert(investorContributionBefore.add(etherSent).equals(investorContributionAfter), 'Investor deposit mismatch')
    })

    it('rejects investments over KYC threshold if removed from whitelist', async () => {
        // ARRANGE
        const kycThreshold = await chxTokenSale.KYC_THRESHOLD()
        const etherSent = kycThreshold.add(1) // Amount over KYC threshold
        const investorContributionBefore = await chxTokenSale.etherContributions(investor2)

        await chxTokenSale.setWhitelistStatus(investor2, false)

        // ACT
        await helpers.shouldFail(chxTokenSale.sendTransaction({from: investor2, value: etherSent}))

        // ASSERT
        const investorContributionAfter = await chxTokenSale.etherContributions(investor2)
        assert(investorContributionBefore.equals(investorContributionAfter), 'Investor deposit mismatch')
    })

    it('rejects investments over sale cap', async () => {
        // ARRANGE
        const saleCap = await chxTokenSale.SALE_CAP()
        const tokenSaleRate = await chxTokenSale.TOKEN_SALE_RATE()
        const etherSent = saleCap.div(tokenSaleRate).add(1) // Amount over sale cap
        const tokensSoldBefore = await chxTokenSale.tokensSoldOnline()

        // ACT
        await helpers.shouldFail(chxTokenSale.sendTransaction({from: investor1, value: etherSent}))

        // ASSERT
        const tokensSoldAfter = await chxTokenSale.tokensSoldOnline()
        assert(tokensSoldBefore.equals(tokensSoldAfter), 'Tokens sold amount mismatch')
    })

    it('rejects investments after sale end', async () => {
        // ARRANGE
        const endTime = await chxTokenSale.PUBLIC_SALE_END_TIME()
        await helpers.increaseEVMTimeTo(endTime)
        assert.isAtLeast(helpers.lastEVMTime(), endTime, 'Time not set correctly');

        const tokensSoldBefore = await chxTokenSale.tokensSoldOnline()

        // ACT
        await helpers.shouldFail(chxTokenSale.sendTransaction({from: investor1, value: web3.toWei(1, 'ether')}))

        // ASSERT
        const tokensSoldAfter = await chxTokenSale.tokensSoldOnline()
        assert(tokensSoldBefore.equals(tokensSoldAfter), 'Tokens sold amount mismatch')
    })

    it('moves unsold tokens and raised ether to corresponding wallets upon closing the token sale', async () => {
        // ARRANGE
        const reserveFundWallet = await chxTokenSale.RESERVE_FUND_WALLET()
        const raisedEtherWallet = await chxTokenSale.RAISED_ETHER_WALLET()

        const tokensSold = await chxTokenSale.tokensSoldOnline()
        const etherRaised = await chxTokenSale.etherRaised()

        const tokenSaleBalanceBefore = await chxToken.balanceOf(chxTokenSale.address)
        const reserveFundBalanceBefore = await chxToken.balanceOf(reserveFundWallet)
        const tokenSaleEtherBalanceBefore = web3.eth.getBalance(chxTokenSale.address)
        const raisedEtherBalanceBefore = web3.eth.getBalance(raisedEtherWallet)

        assert(tokenSaleBalanceBefore.equals(maxGoal.sub(tokensSold)), 'ARRANGE: Token sale balance mismatch')
        assert(reserveFundBalanceBefore.equals(reserveFundTokenAmount), 'ARRANGE: Reserve fund token balance mismatch')
        assert(tokenSaleEtherBalanceBefore.equals(etherRaised), 'ARRANGE: Token sale ether balance mismatch')
        assert(raisedEtherBalanceBefore.equals(0), 'ARRANGE: Raised ether balance mismatch')

        // ACT
        await chxTokenSale.closeTokenSale()

        // ASSERT
        const tokenSaleBalanceAfter = await chxToken.balanceOf(chxTokenSale.address)
        const reserveFundBalanceAfter = await chxToken.balanceOf(reserveFundWallet)
        const tokenSaleEtherBalanceAfter = web3.eth.getBalance(chxTokenSale.address)
        const raisedEtherBalanceAfter = web3.eth.getBalance(raisedEtherWallet)

        assert(tokenSaleBalanceAfter.equals(0), 'Token sale balance mismatch')
        assert(reserveFundBalanceAfter.equals(reserveFundBalanceBefore.add(tokenSaleBalanceBefore)), 'Reserve fund token balance mismatch')
        assert(tokenSaleEtherBalanceAfter.equals(0), 'Token sale ether balance mismatch')
        assert(raisedEtherBalanceAfter.equals(etherRaised), 'Raised ether balance mismatch')
    })
})
