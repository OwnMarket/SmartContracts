var CHXToken = artifacts.require("./CHXToken.sol")
var CHXTokenSale = artifacts.require("./CHXTokenSale.sol")
var CHXVestingVaultFactory = artifacts.require("./CHXVestingVaultFactory.sol")

module.exports = function (deployer) {
    deployer.deploy(CHXToken)
    deployer.deploy(CHXTokenSale)
    deployer.deploy(CHXVestingVaultFactory)
}
