pragma solidity ^0.5.0;

import "openzeppelin-solidity-2.1.1/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.1.1/contracts/ownership/Ownable.sol";
import "./ProductionOwnable.sol";

import "chainlink/contracts/ChainlinkClient.sol";




contract Asset is Ownable, ProductionOwnable, ChainlinkClient {

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


    // [ChainLink]：Creates constants for the JobIDs within the documentation. 
    bytes32 constant GET_BYTES32_JOB = bytes32("5b280bfed77646d297fdb6e718c7127a");
    bytes32 constant POST_BYTES32_JOB = bytes32("469e74c5bca740c0addba9ea67eecc51");
    bytes32 constant INT256_JOB = bytes32("93032b68d4704fa6be2c3ccf7a23c107");
    bytes32 constant INT256_MUL_JOB = bytes32("e055293deb37425ba83a2d5870c57649");
    bytes32 constant UINT256_JOB = bytes32("fb5fb7b18921487fb26503cb075abf41");
    bytes32 constant UINT256_MUL_JOB = bytes32("493610cff14346f786f88ed791ab7704");
    bytes32 constant BOOL_JOB = bytes32("7ac0b3beac2c448cb2f6b2840d61d31f");


    constructor () public {
        // [ChainLink]：Set the address for the LINK token for the network.
        setChainlinkToken(0x20fE562d797A42Dcb3399062AE9546cd06f63280);   // This is contract address of ChainLink which is deployed on Ropsten

        // [ChainLink]：Set the address of the oracle to create requests to.
        setChainlinkOracle(0xc99B3D447826532722E41bc36e644ba3479E4365);   // This is contract address of ChainLink which is deployed on Ropsten
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
