var IPFSInbox = artifacts.require("./IPFSInbox.sol");

module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(IPFSInbox);
};
