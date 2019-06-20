var Gamification = artifacts.require("./Gamification.sol");
var StakingToken = artifacts.require("./StakingToken.sol");

// Debug
console.log('=== StakingToken.address ====', StakingToken.address);
// Result（OK)： === StakingToken.address ==== 0x42043DC70D8738E1f6dB06627eBC53e3902C07fD


module.exports = function(deployer) {
    //deployer.deploy(Gamification);

    return deployer.then(() => {
        return deployer.deploy(
            Gamification,
            StakingToken.address  // Using as argument of constructor of Gamification.sol
        );
    });
};
