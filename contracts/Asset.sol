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
        uint generationTimestamp;
        string generationSourseType;
        mapping (string => Coordinate) coordinates;  // Using town name as key
        mapping (uint => IpfsHash) ipfsHashes;
    }
    Production[] public productions;


    struct Coordinate {
        string latitude;
        string longitude;
    }


    struct IpfsHash {
        string ipfsHash;
    }
    


    event ProductionRegister(uint indexed id, address indexed addr, string town, uint generationTimestamp, string generationSourseType);
    event ProductionCoordinateRegister(string town, string latitude, string longitude);
    event ProductionRegisterIpfsHash(string indexed returnedIpfsHash);


    constructor () public {
        // Put something
    }


    function productionRegister(
        address _addr, 
        string memory _town, 
        string memory _generationSourseType
    ) public returns (uint, address, string memory, uint, string memory) 
    {
        // This constant value below is for temporary test
        //string memory _latitude = '52.5537493';
        //string memory _longitude = '13.2920935';

        Production memory production;
        production.id = _productionId;
        production.addr = _addr;
        production.town = _town;
        production.generationTimestamp = block.timestamp;
        production.generationSourseType = _generationSourseType;

        productions.push(production);

        emit ProductionRegister(production.id, _addr, _town, block.timestamp, _generationSourseType);
        _productionId++;

        return (production.id, _addr, _town, block.timestamp, _generationSourseType);
    }


    function productionCoordinateRegister(string memory _town, string memory _latitude, string memory _longitude) public returns (string memory, string memory, string memory)  {
        Coordinate memory coordinate = productions[_productionId].coordinates[_town];
        coordinate.latitude = _latitude;
        coordinate.latitude = _longitude;

        emit ProductionCoordinateRegister(_town, _latitude, _longitude);

        return (_town, _latitude, _longitude);
    }
    

    function productionDetail(uint _id) 
        public view returns 
    (
        uint id, 
        address addr, 
        string memory town,
        string memory latitude,
        string memory longitude,
        string memory ipfsHash
    ) 
    {
        uint production_id;
        address production_addr;
        string memory production_town;
        string memory production_latitude;
        string memory production_longitude;
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



    ////////////////////////////////////////////////////////////////////////////
    /// Get real-time data from SmartMeter (it does test through ChainLink）
    ////////////////////////////////////////////////////////////////////////////
    function readSmartMeter(
        uint _assetId, 
        uint _newMeterRead, 
        uint _CO2OffsetMeterRead, 
        bytes32 _lastSmartMeterReadFileHash,
        uint _timestamp
    ) public returns (bool res) 
    {
        // In progress
    }
    



}
