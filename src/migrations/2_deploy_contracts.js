var CHXTokenSale = artifacts.require("./CHXTokenSale.sol");

module.exports = function (deployer) {
    deployer.deploy(CHXTokenSale);
};
