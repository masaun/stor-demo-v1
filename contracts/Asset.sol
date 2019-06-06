pragma solidity ^0.5.0;

import "openzeppelin-solidity-2.1.1/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.1.1/contracts/ownership/Ownable.sol";
import "./ProductionOwnable.sol";




contract Asset is Ownable, ProductionOwnable {

    uint public _productionId; 

    struct Production {
        uint id;
        address addr;
        string town;
        mapping (string => Coordinate) coordinates;  // Using town name as key 
    }
    Production[] public productions;


    struct Coordinate {
        uint latitude;
        uint longitude;
    }


    event ProductionRegister(uint indexed id, address indexed addr, string town);


    constructor () public {
        // Put something
    }


    function productionRegister(address _addr, string memory _town) public returns (uint, address, string memory) {
        
        Production memory production;
        production.id = _productionId;
        production.addr = _addr;
        production.town = _town;
        
        productions.push(production);

        emit ProductionRegister(production.id, _addr, _town);
        _productionId++;

        return (production.id, _addr, _town);
    }


    function productionDetail(uint _id) public view returns(uint id, address addr, string memory town) {
        uint production_id;
        address production_addr;
        string memory production_town;

        Production memory production = productions[_id];
        production_id = productions[_id].id;
        production_addr = productions[_id].addr;
        production_town = productions[_id].town;

        return (production_id, production_addr, production_town);
    }
    

    function productionList() public view returns(uint) {
        return productions.length - 1;
    }

}
