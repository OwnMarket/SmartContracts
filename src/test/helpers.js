module.exports = module.exports || {}

module.exports.e18 = x => web3.toBigNumber(10).pow(18).mul(x)

module.exports.shouldFail = async promise => {
    try {
        await promise
    } catch (error) {
        const invalidOpcode = error.message.search('invalid opcode') >= 0
        const invalidJump = error.message.search('invalid JUMP') >= 0
        const outOfGas = error.message.search('out of gas') >= 0
        const revert = error.message.search('revert') >= 0

        assert(invalidOpcode || invalidJump || outOfGas || revert, "Expected throw, got '" + error + "' instead.")
        return
    }

    assert.fail('Expected throw not received')
}

module.exports.duration = {
    seconds: x => x,
    minutes: x => x * 60,
    hours: x => x * 60 * 60,
    days: x => x * 60 * 60 * 24,
    weeks: x => x * 60 * 60 * 24 * 7,
    years: x => x * 60 * 60 * 24 * 365
}

module.exports.lastEVMTime = () => web3.eth.getBlock('latest').timestamp

module.exports.increaseEVMTime = async duration => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: new Date().getSeconds()
    })

    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: new Date().getSeconds()
    })
}

module.exports.increaseEVMTimeTo = newTime => {
    const currentTime = module.exports.lastEVMTime()
    if (newTime < currentTime)
        throw Error(`Cannot increase current time(${currentTime}) to a moment in the past(${newTime})`)
    return module.exports.increaseEVMTime(newTime - currentTime)
}
