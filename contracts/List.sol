pragma solidity ^0.5.0;

import "openzeppelin-solidity-2.1.1/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.1.1/contracts/ownership/Ownable.sol";


contract List is SafeMath, Ownable {

    struct Production {
        address addr;
        string town;
    }
    Production[] public productions; 


    constructor () {
        // Put something
    }


    function Register(address _addr, string _town) public returns (address, string memory) {
        
        Production memory production;
        production._addr;
        production._town;
        
        productions.push(production);

        return (_addr, _town);
    }
    

}
