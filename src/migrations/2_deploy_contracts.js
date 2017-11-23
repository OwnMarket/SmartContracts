var CHXToken = artifacts.require("./CHXToken.sol");

module.exports = function (deployer) {
    deployer.deploy(CHXToken);
};
