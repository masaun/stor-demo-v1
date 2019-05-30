const List = artifacts.require('List.sol')

contract('List', (accounts) => {
    it('Execute Register function', async () => {
        const accounts = await web3.eth.getAccounts();

        const _addr = "0x8c43b7f99eea463ff39d839731a87c02abc0b591";
        const _town = "City of Madrid";

        const contract = await new web3.eth.Contract(List.abi, List.address);
        const response = await contract.methods.register(_addr, _town).send({ from: accounts[0] });

        // Debug
        console.log('=== response of register function ===', response);  // Result: 
    })
})
