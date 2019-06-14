pragma solidity ^0.5.0;

import "./StakingToken.sol";
//import "./VotingMachineCallback.sol";

/**
 * The Gamification contract that provide prediction market of topic of energy
 */
contract Gamification {

    uint predictionContentId;

    struct PredictionContent {
        string topic;       // Prediction Topic title
        string detail;      // Prediction Topic detail
        string category;    // Prediction Topic category
        mapping (address => VotingCount) counts;
    }
    PredictionContent[] public contents;
    
    struct VotingCount {
        uint yes;
        uint no; 
    }


    constructor () public {
        // in progress
    }




    /* @dev Transfer staking token when participants join some prediction of topic */
    function transferStakingToken(StakingToken _stakingToken, uint _predictionContentId, address _participant, uint _amount) public returns (bool) {
    }
    
    function buyStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }

    function sellStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }
    


}

