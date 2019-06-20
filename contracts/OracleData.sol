import "chainlink/contracts/ChainlinkClient.sol";


contract OracleData is ChainlinkClient {
 
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


    // Creates a Chainlink request with the bytes32 job and returns the requestId
    function requestEthereumLastMarket() public returns (bytes32 requestId) {
        // newRequest takes a JobID, a callback address, and callback function as input
        Chainlink.Request memory req = buildChainlinkRequest(GET_BYTES32_JOB, this, this.fulfillEthereumLastMarket.selector);
        
        // Adds a URL with the key "get" to the request parameters
        req.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
        
        // Adds a dot-delimited JSON path with the key "path" to the request parameters
        req.add("path", "RAW.ETH.USD.LASTMARKET");
        
        // Sends the request with 1 LINK to the oracle contract
        requestId = sendChainlinkRequest(req, 1 * LINK);
    }
}
