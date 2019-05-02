const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXSwap = artifacts.require('./CHXSwap.sol')

contract('CHXSwap', accounts => {
    const admin = accounts[0]
    const ethAddress1 = accounts[1]
    const ethAddress2 = accounts[2]

    const chxAddress1 = "CH111111111111111111111111111111111"
    const chxAddress2 = "CH222222222222222222222222222222222"
    const chxAddress3 = "CH333333333333333333333333333333333"

    let chxSwap

    beforeEach(async () => {
        chxSwap = await CHXSwap.new()
    })

    it('initializes correctly', async () => {
        assert.equal(await chxSwap.owner(), admin, 'Owner address mismatch')
    })

    it('changes mapped address', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2Before = await chxSwap.getMappedAddress(ethAddress2)

        // ACT
        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ASSERT
        const chxAddress1After = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2After = await chxSwap.getMappedAddress(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('changes mapped address for all senders', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2Before = await chxSwap.getMappedAddress(ethAddress2)

        // ACT
        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})
        await chxSwap.mapAddress(chxAddress2, {from: ethAddress2})

        // ASSERT
        const chxAddress1After = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2After = await chxSwap.getMappedAddress(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.notEqual(chxAddress2After, chxAddress2Before, 'Mapped address 2 expected to change')
        assert.equal(chxAddress2After, chxAddress2, 'Mapped address 2 mismatch')
    })

    it('updates mapped address on subsequent submission', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2Before = await chxSwap.getMappedAddress(ethAddress2)

        // ACT
        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})
        await chxSwap.mapAddress(chxAddress3, {from: ethAddress1})

        // ASSERT
        const chxAddress1After = await chxSwap.getMappedAddress(ethAddress1)
        const chxAddress2After = await chxSwap.getMappedAddress(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress3, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })
})
