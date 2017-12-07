const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXToken = artifacts.require('./CHXToken.sol')

contract('CHXToken', accounts => {
    const admin = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const investor4 = accounts[4]

    let chxToken

    beforeEach(async () => {
        chxToken = chxToken || await CHXToken.deployed()
    })

    it('initialized correctly', async () => {
        const totalSupply = e18(20000000)
        assert((await chxToken.totalSupply()).equals(totalSupply), 'Total supply mismatch')
        assert((await chxToken.balanceOf(admin)).equals(totalSupply), 'Admin balance mismatch')
        assert(await chxToken.restricted(), 'Should be restricted initially')
    })

    it('rejects transfers if restricted', async () => {
        await helpers.shouldFail(chxToken.transfer(investor2, e18(1), {from: investor1}))
    })

    it('allows transfers for owner even if restricted', async () => {
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const tokenQty = e18(2000);

        // ACT
        await chxToken.transfer(investor1, tokenQty)

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        assert(investor1BalanceBefore.add(tokenQty).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
    })

    it('allows transfers for anyone when not restricted', async () => {
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const tokenQty = e18(500);

        await chxToken.setRestrictedState(false)
        assert.equal(await chxToken.restricted(), false, 'Should not be restricted');

        // ACT
        await chxToken.transfer(investor2, tokenQty, {from: investor1})

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        assert(investor1BalanceBefore.sub(tokenQty).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.add(tokenQty).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
    })

    it('supports batchTransfer', async () => {
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        // ACT
        await chxToken.batchTransfer(
            [investor2, investor3, investor4],
            [e18(200), e18(150), e18(100)],
            {from: investor1}
        )

        // ASSERT
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
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        // ACT
        await chxToken.batchApprove(
            [investor2, investor3, investor4],
            [e18(70), e18(50), e18(40)],
            {from: investor1}
        )

        await chxToken.transferFrom(investor1, investor2, e18(70), {from: investor2})
        await chxToken.transferFrom(investor1, investor3, e18(50), {from: investor3})
        await chxToken.transferFrom(investor1, investor4, e18(40), {from: investor4})

        // ASSERT
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
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(investor2, e18(30), {from: investor1})

        // ACT
        await chxToken.batchTransferFrom(
            investor1,
            [investor3, investor4],
            [e18(10), e18(20)],
            {from: investor2}
        )

        // ASSERT
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
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(investor1, e18(15), {from: investor2})
        await chxToken.approve(investor1, e18(25), {from: investor3})

        // ACT
        await chxToken.batchTransferFromMany(
            [investor2, investor3],
            investor4,
            [e18(15), e18(25)],
            {from: investor1}
        )

        // ASSERT
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
        // ARRANGE
        const investor1BalanceBefore = await chxToken.balanceOf(investor1)
        const investor2BalanceBefore = await chxToken.balanceOf(investor2)
        const investor3BalanceBefore = await chxToken.balanceOf(investor3)
        const investor4BalanceBefore = await chxToken.balanceOf(investor4)

        await chxToken.approve(admin, e18(50), {from: investor2})
        await chxToken.approve(admin, e18(40), {from: investor4})

        // ACT
        await chxToken.batchTransferFromManyToMany(
            [investor2, investor4],
            [investor1, investor3],
            [e18(50), e18(40)],
            {from: admin}
        )

        // ASSERT
        const investor1BalanceAfter = await chxToken.balanceOf(investor1)
        const investor2BalanceAfter = await chxToken.balanceOf(investor2)
        const investor3BalanceAfter = await chxToken.balanceOf(investor3)
        const investor4BalanceAfter = await chxToken.balanceOf(investor4)

        assert(investor1BalanceBefore.add(e18(50)).equals(investor1BalanceAfter), 'Investor 1 balance mismatch')
        assert(investor2BalanceBefore.sub(e18(50)).equals(investor2BalanceAfter), 'Investor 2 balance mismatch')
        assert(investor3BalanceBefore.add(e18(40)).equals(investor3BalanceAfter), 'Investor 3 balance mismatch')
        assert(investor4BalanceBefore.sub(e18(40)).equals(investor4BalanceAfter), 'Investor 4 balance mismatch')
    })

    it('reduces total supply by burning tokens', async () => {
        // ARRANGE
        const totalSupplyBefore = await chxToken.totalSupply()
        const adminBalanceBefore = await chxToken.balanceOf(admin)
        const burnQty = e18(1000);

        // ACT
        await chxToken.burn(burnQty)

        // ASSERT
        const totalSupplyAfter = await chxToken.totalSupply()
        const adminBalanceAfter = await chxToken.balanceOf(admin)
        assert(totalSupplyBefore.sub(burnQty).equals(totalSupplyAfter), 'Total supply mismatch')
        assert(adminBalanceBefore.sub(burnQty).equals(adminBalanceAfter), 'Admin balance mismatch')
    })
})
