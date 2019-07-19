var Oracle = artifacts.require("./Oracle.sol");

module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(Oracle);
};
