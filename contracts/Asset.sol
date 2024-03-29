pragma solidity ^0.5.0;

//import "openzeppelin-solidity-2.1.1/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.1.1/contracts/ownership/Ownable.sol";
import "./ProductionOwnable.sol";
import "./Oracle/Oracle.sol";



contract Asset is Ownable, ProductionOwnable, Oracle {
//contract Asset is Ownable, ProductionOwnable, OracleData {

    ///////////////////////////////////////////////////////////////
    ////// Production（e.g. Provider and Seller of solor battery）
    ///////////////////////////////////////////////////////////////
    uint public _productionId; 

    struct Production {
        uint id;
        address addr;
        string town;
        mapping (string => Coordinate) coordinates;  // Using town name as key
        mapping (uint => IpfsHash) ipfsHashes;
        uint generationTimestamp;
        string generationSourseType;
    }
    Production[] public productions;

    struct Coordinate {
        string latitude;
        string longitude;
    }


    struct IpfsHash {
        string ipfsHash;
    }
    


    //////////////////////////////////
    ////// Customer（e.g. Households）
    //////////////////////////////////
    uint public customerId;
    uint public smartMeterId;

    struct Customer {
         address addr;
         //mapping (uint => SmartMeter) smartMeters;
    }
    mapping (uint => Customer) customers;
    //Customer[] public customers;


    struct SmartMeter {
        uint id;                // This Id is the id of owner of smart meter（customer id） 
        uint solorPower;        // Quantity of being generated solor power
        uint waterPower;        // Quantity of being generated water power
        uint windPower;         // Quantity of being generated wind power
        uint geothermalPower;   // Quantity of being generated geothermal power
        uint timestamp;         // Timestamp of being generated geothermal power
    }
    mapping (uint => SmartMeter) smartMeters;
    //SmartMeter[] public smartMeters;



    event ProductionRegister(uint indexed id, address indexed addr, string town, uint generationTimestamp, string generationSourseType);
    event ProductionCoordinateRegister(string town, string latitude, string longitude);
    event ProductionRegisterIpfsHash(string indexed returnedIpfsHash);


    constructor () public {
    //constructor (OracleData _oracleData) public {
        //oracleData = _oracleData;  // Assing contract address of Oracle which is provided by ChainLink
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
    function customerRegister (address _addr, uint _customerId) public returns (address) {
        //Customer memory customer = customers[_id];
        Customer memory customer = customers[_customerId];  // This code which is declare by using storage need for using memory in the smartMeterRegister function below
        customer.addr = _addr;

        return _addr;
    }


    function smartMeterRegister(
        uint _customerId,        // Identify customer which use smart meter
        uint _smartMeterId
        // uint _solorPower,        // Quantity of being generated solor power
        // uint _waterPower,        // Quantity of being generated water power
        // uint _windPower,         // Quantity of being generated wind power
        // uint _geothermalPower,   // Quantity of being generated geothermal power
        // uint _timestamp
    ) public returns (uint, uint, uint, uint, uint, uint) 
    {   
        //SmartMeter storage meter = customers[_customerId].smartMeters[_smartMeterId];
        //SmartMeter memory meter = customers[_customerId].smartMeters[_smartMeterId];
        SmartMeter memory meter = smartMeters[_smartMeterId];
        meter.id = _smartMeterId;
        meter.solorPower = 0;
        meter.waterPower = 0;
        meter.windPower = 0;
        meter.geothermalPower = 0;
        meter.timestamp = block.timestamp;

        return (_smartMeterId, 0, 0, 0, 0, block.timestamp);
    }


    function getDataFromOracle() public returns (bool) {
        test();                 // [Success to call]
        //updatePrice();        // [Fail to call] updatePrice function is referenced from Oracle.sol
        //super.updatePrice();  // [Fail to call] updatePrice function is referenced from Oracle.sol

        return true;
    }
    
}
