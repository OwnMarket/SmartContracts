const helpers = require('./helpers.js')

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

    it('sets mapped address', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        // ACT
        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('sets mapped address for all senders', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        // ACT
        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})
        await chxSwap.mapAddress(chxAddress2, {from: ethAddress2})

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.notEqual(chxAddress2After, chxAddress2Before, 'Mapped address 2 expected to change')
        assert.equal(chxAddress2After, chxAddress2, 'Mapped address 2 mismatch')
    })

    it('rejects address mapping if already exists', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ACT
        await helpers.shouldFail(chxSwap.mapAddress(chxAddress3, {from: ethAddress1}))

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('removes address mapping if called by contract owner', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ACT
        await chxSwap.removeMappedAddress(ethAddress1, {from: admin})

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.equal(chxAddress1After, chxAddress1Before, 'Mapped address 1 not expected to change')
        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('rejects address mapping removal if not called by contract owner', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ACT
        await helpers.shouldFail(chxSwap.removeMappedAddress(ethAddress1, {from: ethAddress1}))
        await helpers.shouldFail(chxSwap.removeMappedAddress(ethAddress1, {from: ethAddress2}))

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress1, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('rejects address mapping removal if address mapping does not exist', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        // ACT
        await helpers.shouldFail(chxSwap.removeMappedAddress(ethAddress1, {from: admin}))

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.equal(chxAddress1After, chxAddress1Before, 'Mapped address 1 not expected to change')
        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })

    it('accepts repeated address mapping if previously removed by contract owner', async () => {
        // ARRANGE
        const chxAddress1Before = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2Before = await chxSwap.mappedAddresses(ethAddress2)

        await chxSwap.mapAddress(chxAddress1, {from: ethAddress1})

        // ACT
        await chxSwap.removeMappedAddress(ethAddress1, {from: admin})
        await chxSwap.mapAddress(chxAddress3, {from: ethAddress1})

        // ASSERT
        const chxAddress1After = await chxSwap.mappedAddresses(ethAddress1)
        const chxAddress2After = await chxSwap.mappedAddresses(ethAddress2)

        assert.notEqual(chxAddress1After, chxAddress1Before, 'Mapped address 1 expected to change')
        assert.equal(chxAddress1After, chxAddress3, 'Mapped address 1 mismatch')

        assert.equal(chxAddress2After, chxAddress2Before, 'Mapped address 2 not expected to change')
    })
})
