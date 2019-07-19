var Asset = artifacts.require("./Asset.sol");

module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(Asset);
};
