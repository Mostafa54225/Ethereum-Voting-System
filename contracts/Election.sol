// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
    address public admin;
    uint256 candidateCount;
    uint256 voterCount;
    bool start;
    bool end;
    
    struct Candidate {
        uint256 candidateId;
        string name;
        uint256 voteCount;
    }
    
    struct ElectionDetails {
        string adminName;
        string electionTitle;
    }
    
    ElectionDetails electionDetails;
    
    mapping(uint256 => Candidate) public candidates;
    
    constructor() {
        admin = msg.sender;
        candidateCount = 0;
        voterCount = 0;
        start = false;
        end = false;
    }
    function getAdmin() public view returns(address) {
        return admin;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    
    function addCandidate(string memory _name) public onlyAdmin {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }
    
    function getTotalCandidate() public view returns (uint256) {
        return candidateCount;
    }
    function getTotalVoters() public view returns (uint256) {
        return voterCount;
    }
    function setElectionDetails(string memory _adminName, string memory _electionTitle) public onlyAdmin {
        electionDetails = ElectionDetails(_adminName, _electionTitle);
        start = true;
        end = false;
    }
    function getAdminName() public view returns (string memory) {
        return electionDetails.adminName;
    }
    function getElectionTitle() public view returns(string memory) {
        return electionDetails.electionTitle;
    }
    
    
    struct Voter {
        address voterAddress;
        string name;
        bool hasVoted;
    }
    address[] public voters;

    mapping(address => Voter) public voterDetails;
    mapping(address => bool) voted;
    
    function registerAsVoter(string memory _name) public {
        voterDetails[msg.sender] = Voter(msg.sender, _name, false);
        voters.push(msg.sender);
        voterCount++;
    }
    
    
    function vote (uint256 candidateId) public {
        require(!voted[msg.sender]);
        require(start);
        require(!end);
        candidates[candidateId].voteCount++;
        voted[msg.sender] = true;
    }
    
    function endElection() public onlyAdmin {
        end = true;
        start = false;
    }
    function startElection() public onlyAdmin {
        start = true;
        end = false;
    }
    function getStart() public view returns(bool) {
        return start;
    }
    function getEnd() public view returns(bool) {
        return end;
    }
    
}
