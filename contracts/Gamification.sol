pragma solidity ^0.5.0;

import "./StakingToken.sol";
//import "./VotingMachineCallback.sol";

/**
 * The Gamification contract that provide prediction market of topic of energy
 */
contract Gamification {

    StakingToken public stakingToken;

    uint predictionTopicId;
    uint participantId;

    struct PredictionTopic {
        uint id;
        string title;
        string description;
        uint stakingPrice;  // Define price of staking token which need to stake for topic
        address creator;
        mapping (address => VotingCount) counts;
    }
    PredictionTopic[] public predictionTopics;
    
    struct VotingCount {
        uint yes;
        uint no; 
    }


    event TransferStakingToken(StakingToken stakingToken, uint predictionTopicId, address participant, uint amount);
    event CreatePredictionTopic(uint predictionTopicId, string _title, string _description, uint _stakingPrice, address _creator);
    

    constructor (address _stakingTokenAddress) public {
        //require(_stakingToken != 0x0);
        stakingToken = StakingToken(_stakingTokenAddress);
    }



    /* @dev Transfer staking token when participants join some prediction of topic */
    function transferStakingToken(StakingToken _stakingTokenAddress, uint _predictionTopicId, address _participant, uint _amount) public returns (bool) {
        emit TransferStakingToken(_stakingTokenAddress, _predictionTopicId, _participant, _amount);
    }
    
    function buyStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }

    function sellStakingToken(address _participant, uint _amount) public returns (bool) {
        // in progress
    }
    


    function createPredictionTopic(
        uint _predictionTopicId, 
        string memory _title,
        string memory _description,
        uint _stakingPrice,
        address _creator
    ) 
        public returns (bool res) 
    {
        PredictionTopic memory predictionTopic = predictionTopics[_predictionTopicId];
        predictionTopic.id = _predictionTopicId;
        predictionTopic.title = _title;
        predictionTopic.description = _description;
        predictionTopic.stakingPrice = _stakingPrice;
        predictionTopic.creator = _creator;

        predictionTopics.push(predictionTopic);

        emit CreatePredictionTopic(_predictionTopicId, _title, _description, _stakingPrice, _creator);

        predictionTopicId++;
    }


    function registerParticipant(
        address _participantAddr,
        uint _stakingTokenBalance
    ) 
        public returns (bool res) 
    {
        // in progress
        participantId++;
    }


    function votingToPredictionTopic(
        uint _predictionTopicId, 
        address _participantAddr, 
        uint _stakingTokenBalance
    )
        public returns (bool res) 
    {        
        require (_stakingTokenBalance > 0, "You have to buy staking token");  // Check that whether participant who bought staking token already or not
        // in progress      
    }

}

