pragma solidity ^0.5.0;

import "./StakingToken.sol";
//import "./VotingMachineCallback.sol";

/**
 * The Gamification contract that provide prediction market of topic of energy
 */
contract Gamification {

    StakingToken public stakingToken;

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


    event TransferStakingToken(address stakingToken, uint predictionContentId, address participant, uint amount);


    constructor (address _stakingTokenAddress) public {
        //require(_stakingToken != 0x0);
        stakingToken = StakingToken(_stakingTokenAddress);
    }



    /* @dev Transfer staking token when participants join some prediction of topic */
    function transferStakingToken(address _stakingTokenAddress, uint _predictionContentId, address _participant, uint _amount) public returns (bool) {
        emit TransferStakingToken(_stakingTokenAddress, _predictionContentId, _participant, _amount);
    }
    
    function buyStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }

    function sellStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }
    


}

