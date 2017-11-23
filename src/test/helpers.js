module.exports = module.exports || {};

module.exports.e18 = x => web3.toBigNumber(10).pow(18).mul(x)

module.exports.shouldFail = async promise => {
    try {
        await promise
    } catch (error) {
        const invalidOpcode = error.message.search('invalid opcode') >= 0
        const invalidJump = error.message.search('invalid JUMP') >= 0
        const outOfGas = error.message.search('out of gas') >= 0

        assert(invalidOpcode || invalidJump || outOfGas, "Expected throw, got '" + error + "' instead.")
        return
    }

    assert.fail('Expected throw not received')
}
