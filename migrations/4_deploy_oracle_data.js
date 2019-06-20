var OracleData = artifacts.require("OracleData");
var LinkToken = artifacts.require("LinkToken");
var Oracle = artifacts.require("Oracle");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(OracleData, LinkToken.address, Oracle.address, {from: accounts[0]});
};
