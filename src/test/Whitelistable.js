const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXDeployment = artifacts.require('./CHXDeployment.sol')
const CHXToken = artifacts.require('./CHXToken.sol')
const CHXTokenSale = artifacts.require('./CHXTokenSale.sol')

contract('Whitelistable', accounts => {
    const owner = accounts[0]
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const whitelistAdmin = accounts[9]

    let chxDeployment
    let chxTokenSale

    beforeEach(async () => {
        chxDeployment = chxDeployment || await CHXDeployment.deployed()
        chxTokenSale = chxTokenSale || await CHXTokenSale.at(await chxDeployment.tokenSaleContract.call())
    })

    it('initializes correctly', async () => {
        const initialWhitelistAdmin = await chxTokenSale.whitelistAdmin()
        assert.equal(initialWhitelistAdmin, owner, 'owner should be admin initially')
        assert.notEqual(initialWhitelistAdmin, whitelistAdmin, 'whitelistAdmin should not be admin initially')

        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should not be initially whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should not be initially whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should not be initially whitelisted')
    })

    it('rejects attempts to change whitelist from non-admin address', async () => {
        // ACT
        await helpers.shouldFail(
            chxTokenSale.addToWhitelist([investor1, investor2, investor3], {from: whitelistAdmin}))

        // ASSERT
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should not be whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should not be whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should not be whitelisted')
    })

    it('can change whitelist admin', async () => {
        // ARRANGE
        assert.equal(await chxTokenSale.whitelistAdmin(), owner, 'owner should be admin initially')

        // ACT
        await chxTokenSale.setWhitelistAdmin(whitelistAdmin, {from: owner})

        // ASSERT
        assert.equal(await chxTokenSale.whitelistAdmin(), whitelistAdmin, 'whitelistAdmin mismatch')
    })

    it('can add addresses to the whitelist', async () => {
        // ARRANGE
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should not be initially whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should not be initially whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should not be initially whitelisted')

        // ACT
        await chxTokenSale.addToWhitelist([investor1, investor2, investor3], {from: whitelistAdmin})

        // ASSERT
        assert.isTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should be whitelisted')
        assert.isTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should be whitelisted')
        assert.isTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should be whitelisted')
    })

    it('can remove addresses from the whitelist', async () => {
        // ARRANGE
        assert.isTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should be initially whitelisted')
        assert.isTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should be initially whitelisted')
        assert.isTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should be initially whitelisted')

        // ACT
        await chxTokenSale.removeFromWhitelist([investor1, investor3], {from: whitelistAdmin})

        // ASSERT
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor1), 'Investor 1 should not be whitelisted')
        assert.isTrue(await chxTokenSale.isWhitelisted(investor2), 'Investor 2 should not be whitelisted')
        assert.isNotTrue(await chxTokenSale.isWhitelisted(investor3), 'Investor 3 should not be whitelisted')
    })
})
