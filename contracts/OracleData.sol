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


    // Creates a Chainlink request with the uint256 multiplier job
    function requestEthereumPrice() 
        public
        onlyOwner
    {
        // newRequest takes a JobID, a callback address, and callback function as input
        Chainlink.Request memory req = buildChainlinkRequest(UINT256_MUL_JOB, this, this.fulfill.selector);

        // Adds a URL with the key "get" to the request parameters
        req.add("get", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
        
        // Uses input param (dot-delimited string) as the "path" in the request parameters
        req.add("path", "USD");
        
        // Adds an integer with the key "times" to the request parameters
        req.addInt("times", 100);
        
        // Sends the request with 1 LINK to the oracle contract
        sendChainlinkRequest(req, ORACLE_PAYMENT);
    }


    // fulfill receives a uint256 data type
    function fulfill(bytes32 _requestId, uint256 _price)
        public
        // Use recordChainlinkFulfillment to ensure only the requesting oracle can fulfill
        recordChainlinkFulfillment(_requestId)
    {
        currentPrice = _price;
    }
      
    
    // withdrawLink allows the owner to withdraw any extra LINK on the contract
    function withdrawLink()
        public
        onlyOwner
    {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }
      

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
