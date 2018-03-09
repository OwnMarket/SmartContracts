const helpers = require('./helpers.js')
const e18 = helpers.e18

const CHXToken = artifacts.require('./CHXToken.sol')
const CHXVestingVault = artifacts.require('./CHXVestingVault.sol')
const CHXVestingVaultFactory = artifacts.require('./CHXVestingVaultFactory.sol')

contract('CHXVestingVault', accounts => {
    const owner = accounts[0]
    const beneficiary1 = accounts[5]
    const beneficiary2 = accounts[6]

    const tokens = e18(1234)

    let chxToken
    let chxVestingVaultFactory

    beforeEach(async () => {
        chxToken = chxToken || await CHXToken.deployed()
        chxVestingVaultFactory = chxVestingVaultFactory || await CHXVestingVaultFactory.deployed()
    })

    it('initializes correctly', async () => {
        await chxVestingVaultFactory.setTokenContract(chxToken.address)
        assert.equal(await chxVestingVaultFactory.tokenContract(), chxToken.address,
            'CHXVestingVaultFactory.tokenContract mismatch')

        await chxToken.setRestrictedState(false) // Enable transfers
    })

    it('creates new CHXVestingVault', async () => {
        // ARRANGE
        const evmTime = web3.toBigNumber(helpers.lastEVMTime())
        const vestingTime = evmTime.add(helpers.duration.days(90))
        const vaultCountBefore = await chxVestingVaultFactory.numberOfVaultsCreated()
        assert(vaultCountBefore.equals(0))

        // ACT
        await chxVestingVaultFactory.createCHXVestingVault(beneficiary1, vestingTime)

        // ASSERT
        const vaultCountAfter = await chxVestingVaultFactory.numberOfVaultsCreated()
        assert(vaultCountAfter.equals(1))

        const vaultAddress = await chxVestingVaultFactory.vestingVaults(0)
        assert.notEqual(vaultAddress, 0, 'Vesting vault not created')

        const vault = await CHXVestingVault.at(vaultAddress)
        assert.equal(await vault.beneficiary(), beneficiary1, 'beneficiary address mismatch')
        assert((await vault.vestingTime()).equals(vestingTime), 'vestingTime mismatch')
    })

    it('locks the tokens sent to it', async () => {
        // ARRANGE
        const vaultAddress = await chxVestingVaultFactory.vestingVaults(0)
        const vault = await CHXVestingVault.at(vaultAddress)
        const vaultTokenBalanceBefore = await chxToken.balanceOf(vaultAddress)
        const beneficiary1TokenBalanceBefore = await chxToken.balanceOf(beneficiary1)

        // ACT
        await chxToken.transfer(vaultAddress, tokens)

        // ASSERT
        const vaultTokenBalanceAfter = await chxToken.balanceOf(vaultAddress)
        const beneficiary1TokenBalanceAfter = await chxToken.balanceOf(beneficiary1)

        assert(vaultTokenBalanceBefore.add(tokens).equals(vaultTokenBalanceAfter),
            'Vault token balance mismatch')
        assert(beneficiary1TokenBalanceBefore.equals(beneficiary1TokenBalanceAfter),
            'Beneficiary token balance mismatch')
    })

    it('rejects token withdrawal before vesting time', async () => {
        // ARRANGE
        const vaultAddress = await chxVestingVaultFactory.vestingVaults(0)
        const vault = await CHXVestingVault.at(vaultAddress)

        // ACT
        await helpers.shouldFail(vault.withdrawTokens({from: beneficiary1}))
    })

    it('accepts token withdrawal at vesting time', async () => {
        // ARRANGE
        const vaultAddress = await chxVestingVaultFactory.vestingVaults(0)
        const vault = await CHXVestingVault.at(vaultAddress)
        const vestingTime = await vault.vestingTime()
        await helpers.increaseEVMTimeTo(vestingTime) // Go to the future
        const vaultTokenBalanceBefore = await chxToken.balanceOf(vaultAddress)
        const beneficiary1TokenBalanceBefore = await chxToken.balanceOf(beneficiary1)

        // ACT
        await vault.withdrawTokens({from: beneficiary1})

        // ASSERT
        const beneficiary1TokenBalanceAfter = await chxToken.balanceOf(beneficiary1)
        const vaultTokenBalanceAfter = await chxToken.balanceOf(vaultAddress)

        assert(beneficiary1TokenBalanceBefore.add(tokens).equals(beneficiary1TokenBalanceAfter),
            'Beneficiary token balance mismatch')
        assert(vaultTokenBalanceBefore.sub(tokens).equals(vaultTokenBalanceAfter),
            'Vault token balance mismatch')
    })
})
