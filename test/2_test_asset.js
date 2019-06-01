const Asset = artifacts.require('Asset.sol')

contract('Asset', (accounts) => {
    it('Execute Register function', async () => {
        const accounts = await web3.eth.getAccounts();

        const _addr = "0x8c43b7f99eea463ff39d839731a87c02abc0b591";
        const _town = "City of Madrid";

        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);
        const response = await contract.methods.register(_addr, _town).send({ from: accounts[0], gas: 3000000 });

        // Debug
        console.log('=== response of register function ===', response);  // Result: 


        const event = response.events.Register.returnValues.addr;

        console.log('=== Check event value of addr of Register function ===', event);  // Result: OK

    })


    it('Execute productionDetail function', async () => {
        const accounts = await web3.eth.getAccounts();

        const _id = 0;

        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);
        const response = await contract.methods.productionDetail(_id).call();

        // Debug
        console.log('=== response of productionDetail function ===', response);  // Result: 

        console.log('=== Check return value of productionDetail function ===', response['0'], response['1'], response['2']);  // Result: OK
    })
})
