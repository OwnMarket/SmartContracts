const helpers = require('./helpers.js')
const e18 = helpers.e18
const bigNumber = web3.toBigNumber

const CHXTokenSale = artifacts.require('./CHXTokenSale.sol')
const CHXToken = artifacts.require('./CHXToken.sol')

contract('CHXToken', accounts => {
    const admin = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    let chxTokenSale
    let chxToken

    beforeEach(async () => {
        chxTokenSale = chxTokenSale || await CHXTokenSale.deployed()
        chxToken = chxToken || await CHXToken.at(await chxTokenSale.token.call())
    })

    it('initialized', async () => {
        const startTime = await chxTokenSale.PUBLIC_SALE_START_TIME()
        await helpers.increaseEVMTimeTo(startTime)
        assert.isAtLeast(helpers.lastEVMTime(), startTime, 'Start time not set correctly');

        await chxTokenSale.sendTransaction({from: investor1, value: web3.toWei(2, 'ether')})
        assert((await chxToken.balanceOf(investor1)).equals(e18(2000)), 'Investor 1 token balance mismatch')
    })

    it('restricts transfers during token sale', async () => {
        await helpers.shouldFail(chxToken.transfer(investor2, e18(1), {from: investor1}))
    })

    it('closed token sale and enabled transfers', async () => {
        const endTime = await chxTokenSale.PUBLIC_SALE_END_TIME()
        await helpers.increaseEVMTimeTo(endTime)
        assert.isAtLeast(helpers.lastEVMTime(), endTime, 'End time not set correctly');

        await chxTokenSale.closeTokenSale()
        assert.equal(await chxToken.tokenSaleClosed(), true, 'Token sale not closed')
    })

    it('supports batchTransfer', async () => {
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.batchTransfer(
            [investor2, investor3, investor4],
            [e18(200), e18(150), e18(100)],
            {from: investor1}
        )

        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.sub(e18(450)).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.add(e18(200)).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.add(e18(150)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.add(e18(100)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })

    it('supports batchApprove', async () => {
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.batchApprove(
            [investor2, investor3, investor4],
            [e18(70), e18(50), e18(40)],
            {from: investor1}
        )

        await chxToken.transferFrom(investor1, investor2, e18(70), {from: investor2})
        await chxToken.transferFrom(investor1, investor3, e18(50), {from: investor3})
        await chxToken.transferFrom(investor1, investor4, e18(40), {from: investor4})

        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.sub(e18(160)).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.add(e18(70)).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.add(e18(50)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.add(e18(40)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })

    it('supports batchTransferFrom', async () => {
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(investor2, e18(30), {from: investor1})

        await chxToken.batchTransferFrom(
            investor1,
            [investor3, investor4],
            [e18(10), e18(20)],
            {from: investor2}
        )

        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.sub(e18(30)).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.add(e18(10)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.add(e18(20)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })

    it('supports batchTransferFromMany', async () => {
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(investor1, e18(15), {from: investor2})
        await chxToken.approve(investor1, e18(25), {from: investor3})

        await chxToken.batchTransferFromMany(
            [investor2, investor3],
            investor4,
            [e18(15), e18(25)],
            {from: investor1}
        )

        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.sub(e18(15)).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.sub(e18(25)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.add(e18(40)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })

    it('supports batchTransferFromManyToMany', async () => {
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(admin, e18(50), {from: investor2})
        await chxToken.approve(admin, e18(40), {from: investor4})

        await chxToken.batchTransferFromManyToMany(
            [investor2, investor4],
            [investor1, investor3],
            [e18(50), e18(40)],
            {from: admin}
        )

        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.add(e18(50)).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.sub(e18(50)).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.add(e18(40)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.sub(e18(40)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })
})
