var List = artifacts.require("./List.sol");

module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(List);
};
