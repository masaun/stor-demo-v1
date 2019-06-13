pragma solidity ^0.5.0;

import "openzeppelin-solidity-2.1.1/contracts/token/ERC20/IERC20.sol";
import '@daostack/infra/contracts/votingMachines/AbsoluteVote.sol';


/**
 * The Gamification contract that provide prediction market of topic of energy
 */
contract Gamification {

    struct PredictionContent {
        bytes32 topic;           // Prediction Topic title
        bytes32 detail;          // Prediction Topic detail
        string memory category;  // Prediction Topic category
    }
    

    constructor () public {
        // in progress
    }




    /* @dev Transfer staking token when Predicter join some prediction of topic */
    function transferStakingToken(StakingToken _stakingToken, uint256 _amount, address _Predicter) public returns (bool) {
        // in progress  
    }
    
    function buyStakingToken(uint256 _amount, address _Predicter) public returns (bool) {
        // in progress
    }

    function sellStakingToken(uint256 _amount, address _Predicter) public returns (bool) {
        // in progress
    }
    


}

