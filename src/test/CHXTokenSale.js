const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXDeployment = artifacts.require('./CHXDeployment.sol')
const CHXToken = artifacts.require('./CHXToken.sol')
const CHXTokenSale = artifacts.require('./CHXTokenSale.sol')

contract('CHXTokenSale', accounts => {
    const owner = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const collectedEtherWallet = accounts[8]
    const whitelistAdmin = accounts[9]

    const calculateTokens = contribution => {
        const tokenPrice = web3.toWei(170, "szabo")
        const multiplier = e18(1)
        return web3.toBigNumber(contribution).mul(multiplier).div(tokenPrice).toFixed(0, 1) // ROUND_DOWN
    }

    const gasPrice = web3.toBigNumber(15e9) // 15 GWEI
    const tokensForSale = e18(100000000)

    let chxDeployment
    let chxToken
    let chxTokenSale

    beforeEach(async () => {
        chxDeployment = chxDeployment || await CHXDeployment.deployed()
        chxToken = chxToken || await CHXToken.at(await chxDeployment.tokenContract.call())
        chxTokenSale = chxTokenSale || await CHXTokenSale.at(await chxDeployment.tokenSaleContract.call())
    })

    it('initializes correctly', async () => {
        const maxGasPrice = web3.toBigNumber(20e9) // 20 GWEI - to prevent "gas race"
        const minContribution = web3.toWei(100, 'finney') // 0.1 ETH
        const maxContributionPhase1 = web3.toWei(500, 'finney') // 0.5 ETH
        const maxContributionPhase2 = web3.toWei(10, 'ether')
        const phase1DurationInHours = web3.toBigNumber(24)
        await chxToken.transfer(chxTokenSale.address, tokensForSale)
        await chxToken.setUnrestrictedAddress(chxTokenSale.address, true)

        assert((await chxToken.balanceOf(chxTokenSale.address)).equals(tokensForSale), 'Tokens for sale mismatch')
        assert((await chxTokenSale.maxGasPrice()).equals(maxGasPrice), 'maxGasPrice mismatch')
        assert((await chxTokenSale.minContribution()).equals(minContribution), 'minContribution mismatch')
        assert((await chxTokenSale.maxContributionPhase1()).equals(maxContributionPhase1), 'maxContributionPhase1 mismatch')
        assert((await chxTokenSale.maxContributionPhase2()).equals(maxContributionPhase2), 'maxContributionPhase2 mismatch')
        assert((await chxTokenSale.phase1DurationInHours()).equals(phase1DurationInHours), 'phase1DurationInHours mismatch')
    })

    it('rejects contributions before saleStartTime', async () => {
        // ARRANGE
        const contribution = web3.toWei(500, "finney")
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const evmTime = web3.toBigNumber(helpers.lastEVMTime())
        await chxTokenSale.setSaleTime(
            evmTime.add(helpers.duration.hours(1)),
            evmTime.add(helpers.duration.hours(2)),
            {from: owner})

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('rejects contributions after saleEndTime', async () => {
        // ARRANGE
        const contribution = web3.toWei(500, "finney")
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const evmTime = web3.toBigNumber(helpers.lastEVMTime())
        await chxTokenSale.setSaleTime(
            evmTime.sub(helpers.duration.hours(2)),
            evmTime.sub(helpers.duration.hours(1)),
            {from: owner})

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('accepts contributions between saleStartTime and saleEndTime', async () => {
        // ARRANGE
        const contribution = web3.toWei(500, "finney")
        const tokens = calculateTokens(contribution)
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const evmTime = web3.toBigNumber(helpers.lastEVMTime())
        await chxTokenSale.setSaleTime(
            evmTime.sub(helpers.duration.hours(2)),
            evmTime.add(helpers.duration.hours(2)),
            {from: owner})
        await chxTokenSale.setPhase1DurationInHours(3, {from: owner}) // In phase 1
        await chxTokenSale.addToWhitelist([investor1], {from: owner})

        // ACT
        await chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice})

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.add(tokens).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('rejects contributions with gas price over the limit', async () => {
        // ARRANGE
        const contribution = web3.toWei(500, "finney")
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const highGasPrice = web3.toBigNumber(50e9) // 50 GWEI

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: highGasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('rejects contributions if address not whitelisted', async () => {
        // ARRANGE
        const contribution = web3.toWei(500, "finney")
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor2, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        assert(investor2BalanceBefore.equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
    })

    it('rejects too low contributions', async () => {
        // ARRANGE
        const contribution = web3.toWei(90, "finney") // 0.09 ETH
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('rejects too high contributions in phase 1', async () => {
        // ARRANGE
        const contribution = web3.toWei(1, "wei") // Total contribution counts
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('accepts contributions up to the phase 2 limit', async () => {
        // ARRANGE
        const contribution = web3.toWei(9500, "finney") // 0.5 ETH invested in phase 1
        const tokens = calculateTokens(contribution)
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        await chxTokenSale.setPhase1DurationInHours(1, {from: owner}) // In phase 2

        // ACT
        await chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice})

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.add(tokens).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('rejects too high contributions in phase 2', async () => {
        // ARRANGE
        const contribution = web3.toWei(1, "wei") // Total contribution counts
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)

        // ACT
        await helpers.shouldFail(
            chxTokenSale.sendTransaction({from: investor1, value: contribution, gasPrice: gasPrice}))

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('maintains sum of ETH contributions per investor and total collected ETH', async () => {
        // ARRANGE
        const contribution1 = web3.toWei(10, "ether") // Investor 1
        const contribution2 = web3.toWei(1, "ether") // Investor 2
        await chxTokenSale.addToWhitelist([investor2], {from: owner})

        // ACT
        await chxTokenSale.sendTransaction({from: investor2, value: contribution2, gasPrice: gasPrice})

        // ASSERT
        const etherContributions1 = await chxTokenSale.etherContributions(investor1)
        const etherContributions2 = await chxTokenSale.etherContributions(investor2)
        const etherCollected = await chxTokenSale.etherCollected()

        assert(etherContributions1.equals(contribution1), 'etherContributions1 mismatch')
        assert(etherContributions2.equals(contribution2), 'etherContributions2 mismatch')
        assert(etherContributions1.add(etherContributions2).equals(etherCollected), 'etherCollected mismatch')
        assert((web3.eth.getBalance(chxTokenSale.address)).equals(etherCollected), 'contract ETH balance mismatch')
    })

    it('maintains sum of allocated tokens per investor and total tokens sold', async () => {
        // ARRANGE
        const investor1Balance = await chxToken.balanceOf(investor1)
        const investor2Balance = await chxToken.balanceOf(investor2)
        const tokenAllocations1 = await chxTokenSale.tokenAllocations(investor1)
        const tokenAllocations2 = await chxTokenSale.tokenAllocations(investor2)
        const tokensSold = await chxTokenSale.tokensSold()

        // ASSERT
        assert(tokenAllocations1.equals(investor1Balance), 'tokenAllocations1 mismatch')
        assert(tokenAllocations2.equals(investor2Balance), 'tokenAllocations2 mismatch')
        assert(tokenAllocations1.add(tokenAllocations2).equals(tokensSold), 'tokensSold mismatch')
    })

    it('sends collected ether to provided address', async () => {
        // ARRANGE
        const etherContributions1 = await chxTokenSale.etherContributions(investor1) // Investor 1
        const etherContributions2 = await chxTokenSale.etherContributions(investor2) // Investor 2
        const totalContributions = etherContributions1.add(etherContributions2)
        const collectedEtherWalletBalanceBefore = web3.eth.getBalance(collectedEtherWallet)
        const chxTokenSaleBalanceBefore = web3.eth.getBalance(chxTokenSale.address)

        // ACT
        await chxTokenSale.sendCollectedEther(collectedEtherWallet, {from: owner})

        // ASSERT
        const chxTokenSaleBalanceAfter = web3.eth.getBalance(chxTokenSale.address)
        const collectedEtherWalletBalanceAfter = web3.eth.getBalance(collectedEtherWallet)

        assert(chxTokenSaleBalanceAfter.equals(0), 'chxTokenSaleBalanceAfter should be zero')
        assert(chxTokenSaleBalanceBefore.gt(chxTokenSaleBalanceAfter),
            'chxTokenSaleBalanceAfter should have decreased')
        assert(collectedEtherWalletBalanceBefore.add(totalContributions).equals(collectedEtherWalletBalanceAfter),
            'collectedEtherWallet ETH balance mismatch')
    })

    it('sends remaining unsold tokens to provided address', async () => {
        // ARRANGE
        const ownerTokenBalanceBefore = await chxToken.balanceOf(owner)
        const chxTokenSaleTokenBalanceBefore = await chxToken.balanceOf(chxTokenSale.address)
        const tokensSold = await chxTokenSale.tokensSold()
        const remainingTokens = tokensForSale.sub(tokensSold);
        assert(chxTokenSaleTokenBalanceBefore.equals(remainingTokens), 'Remaining tokens calculation mismatch')

        // ACT
        await chxTokenSale.sendRemainingTokens(owner, {from: owner})

        // ASSERT
        const chxTokenSaleTokenBalanceAfter = await chxToken.balanceOf(chxTokenSale.address)
        const ownerTokenBalanceAfter = await chxToken.balanceOf(owner)

        assert(chxTokenSaleTokenBalanceAfter.equals(0), 'chxTokenSaleTokenBalanceAfter mismatch')
        assert(ownerTokenBalanceBefore.add(remainingTokens).equals(ownerTokenBalanceAfter),
            'ownerTokenBalanceAfter mismatch')
    })
})
