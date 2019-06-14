const Gamification = artifacts.require('Gamification.sol')
const StakingToken = artifacts.require("StakingToken.sol");  // For getting contract address of StakingToken.sol


contract('Asset', (accounts) => {
    it('Execute transferStakingToken function', async () => {
        const accounts = await web3.eth.getAccounts();

        // Get contract address of StakingToken.sol
        const _stakingToken = StakingToken.address;
        console.log('=== contract address of StakingToken.sol ===', _stakingToken);

        // Value of argument for test
        //const _stakingToken = "0x3d95c3daa594bf5e21a701402e82d7f7b846da18";  // Contract address of StakingToken.sol (which mean is address(this))
        const _predictionContentId = 1;
        const _participant = "0x81d67c9a6b6b76c684f18a45e65af61efc52c16b";
        const _amount = 10000;

        // Execute function
        const contract = await new web3.eth.Contract(Gamification.abi, Gamification.address);
        const response = await contract.methods.transferStakingToken(_stakingToken, _predictionContentId, _participant, _amount).send({ from: accounts[0], gas: 3000000 });
 
        const event = response.events.TransferStakingToken.returnValues;
        const eventValue = response.events.TransferStakingToken.returnValues.stakingToken;

        // Debug
        console.log('=== response of transferStakingToken function ===', response);
        console.log('=== Check event of TransferStakingToken===', event);
        console.log('=== Check event value of stakingToken of TransferStakingToken function ===', eventValue);
    })
})
