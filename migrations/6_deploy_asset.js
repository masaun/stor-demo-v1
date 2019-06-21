var Asset = artifacts.require("./Asset.sol");
var OracleData = artifacts.require("./OracleData.sol");

console.log('====== OracleData.address =======', OracleData.address);


module.exports = function(deployer) {
  console.log(deployer);
  deployer.deploy(Asset, OracleData.address);
};
