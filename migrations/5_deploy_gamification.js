var Gamification = artifacts.require("./Gamification.sol");

module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(Gamification);
};
