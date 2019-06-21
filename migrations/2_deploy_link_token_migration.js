var LinkToken = artifacts.require("chainlink/contracts/interfaces/LinkTokenInterface.sol");

module.exports = deployer => {
  deployer.deploy(LinkToken);
};
