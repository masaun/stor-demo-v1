// This code has not been professionally audited, therefore I cannot make any promises about
// safety or correctness. Use at own risk.

pragma solidity ^0.5.0;
//pragma solidity ^0.4.20;




contract OraclizeI {
    address public cbAddress;
    function query(uint _timestamp, string memory _datasource, string memory _arg) public payable returns (bytes32 _id);
    function query_withGasLimit(uint _timestamp, string memory _datasource, string memory _arg, uint _gaslimit) public payable returns (bytes32 _id);
    function query2(uint _timestamp, string memory _datasource, string memory _arg1, string memory _arg2) public payable returns (bytes32 _id);
    function query2_withGasLimit(uint _timestamp, string memory _datasource, string memory _arg1, string memory _arg2, uint _gaslimit) public payable returns (bytes32 _id);
    function queryN(uint _timestamp, string memory _datasource, bytes memory _argN) public payable returns (bytes32 _id);
    function queryN_withGasLimit(uint _timestamp, string memory _datasource, bytes memory _argN, uint _gaslimit) public payable returns (bytes32 _id);
    function getPrice(string memory _datasource) public returns (uint _dsprice);
    function getPrice(string memory _datasource, uint gaslimit) public returns (uint _dsprice);
    function useCoupon(string memory _coupon) public;
    function setProofType(byte _proofType) public;
    function setConfig(bytes32 _config) public;
    function setCustomGasPrice(uint _gasPrice) public;
    function randomDS_getSessionPubKeyHash() public returns(bytes32);
}


contract OraclizeAddrResolverI {
    function getAddress() public returns (address _addr);
}


contract usingOraclize {
    uint constant day = 60*60*24;
    uint constant week = 60*60*24*7;
    uint constant month = 60*60*24*30;
    byte constant proofType_NONE = 0x00;
    byte constant proofType_TLSNotary = 0x10;
    byte constant proofType_Android = 0x20;
    byte constant proofType_Ledger = 0x30;
    byte constant proofType_Native = 0xF0;
    byte constant proofStorage_IPFS = 0x01;
    uint8 constant networkID_auto = 0;
    uint8 constant networkID_mainnet = 1;
    uint8 constant networkID_testnet = 2;
    uint8 constant networkID_morden = 2;
    uint8 constant networkID_consensys = 161;

    OraclizeAddrResolverI OAR;

    OraclizeI oraclize;

    modifier oraclizeAPI {
        //if((address(OAR)==0)||(getCodeSize(address(OAR))==0)) oraclize_setNetwork(networkID_auto);
        oraclize = OraclizeI(OAR.getAddress());
        _;
    }

    function oraclize_setNetwork(uint8 networkID) internal returns(bool){
        if (getCodeSize(0x1d3B2638a7cC9f2CB3D298A3DA7a90B67E5506ed)>0){ //mainnet
            OAR = OraclizeAddrResolverI(0x1d3B2638a7cC9f2CB3D298A3DA7a90B67E5506ed);
            oraclize_setNetworkName("eth_mainnet");
            return true;
        }
        if (getCodeSize(0xc03A2615D5efaf5F49F60B7BB6583eaec212fdf1)>0){ //ropsten testnet
            OAR = OraclizeAddrResolverI(0xc03A2615D5efaf5F49F60B7BB6583eaec212fdf1);
            oraclize_setNetworkName("eth_ropsten3");
            return true;
        }
        if (getCodeSize(0xB7A07BcF2Ba2f2703b24C0691b5278999C59AC7e)>0){ //kovan testnet
            OAR = OraclizeAddrResolverI(0xB7A07BcF2Ba2f2703b24C0691b5278999C59AC7e);
            oraclize_setNetworkName("eth_kovan");
            return true;
        }
        if (getCodeSize(0x146500cfd35B22E4A392Fe0aDc06De1a1368Ed48)>0){ //rinkeby testnet
            OAR = OraclizeAddrResolverI(0x146500cfd35B22E4A392Fe0aDc06De1a1368Ed48);
            oraclize_setNetworkName("eth_rinkeby");
            return true;
        }
        if (getCodeSize(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475)>0){ //ethereum-bridge
            OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
            return true;
        }
        if (getCodeSize(0x20e12A1F859B3FeaE5Fb2A0A32C18F5a65555bBF)>0){ //ether.camp ide
            OAR = OraclizeAddrResolverI(0x20e12A1F859B3FeaE5Fb2A0A32C18F5a65555bBF);
            return true;
        }
        if (getCodeSize(0x51efaF4c8B3C9AfBD5aB9F4bbC82784Ab6ef8fAA)>0){ //browser-solidity
            OAR = OraclizeAddrResolverI(0x51efaF4c8B3C9AfBD5aB9F4bbC82784Ab6ef8fAA);
            return true;
        }
        return false;
    }

    function getCodeSize(address _addr) view internal returns(uint _size) {
        assembly {
            _size := extcodesize(_addr)
        }
    }

    string oraclize_network_name;
    function oraclize_setNetworkName(string memory _network_name) internal {
        oraclize_network_name = _network_name;
    }

    function oraclize_query(string memory datasource, string memory arg) oraclizeAPI internal returns (bytes32 id){
        uint price = oraclize.getPrice(datasource);
        if (price > 1 ether + tx.gasprice*200000) return 0; // unexpectedly high price
        return oraclize.query.value(price)(0, datasource, arg);
    }

    function oraclize_getPrice(string memory datasource) oraclizeAPI internal returns (uint){
        return oraclize.getPrice(datasource);
    }
}



// import "github.com/oraclize/ethereum-api/oraclizeAPI_0.4.sol";

contract Oracle is usingOraclize {

    string public EURUSD;

    function updatePrice() public payable {
        if (oraclize_getPrice("URL") > address(this).balance) {
            //Handle out of funds error
        } else {
            oraclize_query("URL", "json(https://api.exchangeratesapi.io/latest?symbols=USD).rates.USD");
        }
    }

    function __callback(bytes32 myid, string memory result) public {
        require(msg.sender == oraclize_cbAddress());
        EURUSD = result;
    }

    function oraclize_cbAddress() oraclizeAPI internal returns (address){
        return oraclize.cbAddress();
    }


    // For test
    function test() public returns(string memory) {
        return "Test Return from test function";
    }


    function ApiRequest() public returns(string memory) {
        string memory END_POINT = "https://api.exchangeratesapi.io/latest?symbols=USD";

        // [in progress] Todo： Write codes for API request below
        string memory response = "JSON data of response codes which by API request";

        return response;
    }
    
    

}
