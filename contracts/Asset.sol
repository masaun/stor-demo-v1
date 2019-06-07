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
        mapping (uint => IpfsHash) ipfsHashes;
    }
    Production[] public productions;


    struct Coordinate {
        uint latitude;
        uint longitude;
    }


    struct IpfsHash {
        string ipfsHash;
    }
    


    event ProductionRegister(uint indexed id, address indexed addr, string town);
    event ProductionRegisterIpfsHash(string indexed returnedIpfsHash);


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


    function productionDetail(uint _id) 
        public view returns 
    (
        uint, 
        address, 
        string memory,
        uint,
        uint,
        string memory
    ) 
    {
        uint production_id;
        address production_addr;
        string memory production_town;
        uint production_latitude;
        uint production_longitude;
        string memory production_ipfsHash;

        Production memory production = productions[_id];
        production_id = productions[_id].id;
        production_addr = productions[_id].addr;
        production_town = productions[_id].town;
        production_latitude = productions[_id].coordinates[productions[_id].town].latitude;
        production_longitude = productions[_id].coordinates[productions[_id].town].longitude;
        production_ipfsHash = productions[_id].ipfsHashes[_id].ipfsHash;

        return (production_id, production_addr, production_town, production_latitude, production_longitude, production_ipfsHash);
    }
    

    function productionList() public view returns(uint) {
        return productions.length - 1;
    }




    ///////////
    /// IPFS
    ///////////
    string ipfsHash;
 
    function sendHash(string memory x) public {
        ipfsHash = x;
    }

    function getHash() public view returns (string memory x) {
        return ipfsHash;
    }


    function productionRegisterIpfsHash(uint _id, string memory _returnedIpfsHash) public returns (string memory) {
    //function productionRegisterIpfsHash(uint _id, string memory _returnedIpfsHash) public returns (string memory) {
        IpfsHash memory ipfs = productions[_id].ipfsHashes[_id];
        ipfs.ipfsHash = _returnedIpfsHash;

        emit ProductionRegisterIpfsHash(_returnedIpfsHash);

        return _returnedIpfsHash;
    }

   

}
