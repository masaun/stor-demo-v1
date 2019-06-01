pragma solidity ^0.5.0;

import "openzeppelin-solidity-2.1.1/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.1.1/contracts/ownership/Ownable.sol";




contract Asset is Ownable {

    uint public _productionId; 

    struct Production {
        uint id;
        address addr;
        string town;
    }
    Production[] public productions;

    event Register(uint id, address addr, string town);


    constructor () public {
        // Put something
    }


    function register(address _addr, string memory _town) public returns (uint, address, string memory) {
        
        Production memory production;
        production.id = _productionId;
        production.addr = _addr;
        production.town = _town;
        
        productions.push(production);

        emit Register(production.id, _addr, _town);
        _productionId++;

        return (production.id, _addr, _town);
    }


    
    

}
