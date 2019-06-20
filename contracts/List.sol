pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";




contract List is Ownable {

    struct Production {
        address addr;
        string town;
    }
    Production[] public productions;

    event Register(address addr, string town);



    constructor () public {
        // Put something
    }


    function register(address _addr, string memory _town) public returns (address, string memory) {
        
        Production memory production;
        production.addr = _addr;
        production.town = _town;
        
        productions.push(production);

        emit Register(_addr, _town);


        return (_addr, _town);
    }
    

}
