/**
 * The contractName contract does this and that...
 */
contract Voting {

    enum VoterState { Absent, Yea, Nay }

    struct Vote {
        bool executed;
        uint64 startDate;
        uint64 endDate;
        uint256 yea;
        uint256 nay;
        uint256 votingPower;
        bytes executionScript;
        mapping (address => VoterState) voters;
    }




    constructor () public {
        
    }    
}
