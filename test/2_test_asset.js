const Asset = artifacts.require('Asset.sol')

contract('Asset', (accounts) => {
    it('Execute Register function', async () => {
        const accounts = await web3.eth.getAccounts();

        // Value of argument for test
        const _addr = "0x8c43b7f99eea463ff39d839731a87c02abc0b591";
        const _town = "City of Madrid";
        const _generationSourseType = "Solor Power";

        // Execute function
        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);
        const response = await contract.methods.productionRegister(_addr, _town, _generationSourseType).send({ from: accounts[0], gas: 3000000 });

        // Debug
        console.log('=== response of productionRegister function ===', response);  // Result: 

        const event = response.events.ProductionRegister.returnValues.addr;
        console.log('=== Check event value of addr of ProductionRegister function ===', event);  // Result: OK

        const timestamp = response.events.ProductionRegister.returnValues.generationTimestamp;
        console.log('=== Check event value of generationTimestamp of ProductionRegister function ===', timestamp);
    })


    it('Execute productionDetail function', async () => {
        const _id = 0;

        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);
        const response = await contract.methods.productionDetail(_id).call();

        // Debug
        console.log('=== response of productionDetail function ===', response);  // Result: 

        // Both of OK
        console.log('=== Check return value of productionDetail function ===', response.id, response.addr, response.town);    // Result: OK
        console.log('=== Check return value of productionDetail function ===', response['0'], response['1'], response['2']);  // Result: OK
    })


    it('Execute productionList function', async () => {
        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);
        const response = await contract.methods.productionList().call();

        // Debug
        console.log('=== response of productionList function ===', response);  // Result: 

        // Debug of return value
        console.log('=== Check return value of productionList function ===', response['0']);
    })



    it('Execute smartMeterRegister function', async () => {
        const contract = await new web3.eth.Contract(Asset.abi, Asset.address);

        const _addr = '0x9002aa10300df7970d70f0b74a2d676754575b1c'
        const response_1 = await contract.methods.customerRegister(_addr).send({ from: accounts[0], gas: 3000000 });

        const _customerId = 2;
        const _smartMeterId = 5;

        const response = await contract.methods.smartMeterRegister(_customerId, _smartMeterId).send({ from: accounts[0], gas: 3000000 });

        // Debug
        console.log('=== response of smartMeterRegister function ===', response);  // Result: 

    })
})
