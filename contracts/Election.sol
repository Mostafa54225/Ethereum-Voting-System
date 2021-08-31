// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
    address public admin;
    uint256 candidateCount;
    uint256 adminCount;
    uint256 voterCount;
    bool start;
    bool end;
    
    struct Candidate {
        uint256 candidateId;
        string name;
        uint256 voteCount;
    }

    struct Admins {
        address adminAddress;
        string name;
        bool status;
    }
    
    struct ElectionDetails {
        string adminName;
        string electionTitle;
    }
    
    ElectionDetails electionDetails;
    
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Admins) public admins;
    
    constructor() {
        admin = msg.sender;
        candidateCount = 0;
        adminCount = 0;
        voterCount = 0;
        start = false;
        end = false;
    }
    function getAdmin() external view returns(address) {
        return admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin || loopAdmins());
        _;
    }

    function loopAdmins() public view returns(bool) {
        for(uint i =1; i <= adminCount; i++) {
            if(admins[i].adminAddress == msg.sender) return true;
        }
        return false;
    }

    function addAdmin(address _adminAddress, string memory _name) external onlyAdmin {
        adminCount++;
        admins[adminCount] = Admins(_adminAddress, _name, true);
    }
    
    
    function addCandidate(string memory _name) external onlyAdmin {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    function getTotalAdmin() external view returns (uint256) {
        return adminCount;
    }
    
    function getTotalCandidate() external view returns (uint256) {
        return candidateCount;
    }
    function getTotalVoters() external view returns (uint256) {
        return voterCount;
    }
    function setElectionDetails(string memory _adminName, string memory _electionTitle) external onlyAdmin {
        electionDetails = ElectionDetails(_adminName, _electionTitle);
        start = true;
        end = false;
    }
    function getAdminName() external view returns (string memory) {
        return electionDetails.adminName;
    }
    function getElectionTitle() external view returns(string memory) {
        return electionDetails.electionTitle;
    }
    
    
    struct Voter {
        address voterAddress;
        string name;
    }
    address[] public voters;

    mapping(address => Voter) public voterDetails;
    mapping(address => bool) public voted;
    
    function registerAsVoter(string memory _name) external {
        voterDetails[msg.sender] = Voter(msg.sender, _name);
        voters.push(msg.sender);
        voterCount++;
    }
    
    
    function vote (uint256 candidateId) external {
        require(!voted[msg.sender]);
        require(start);
        require(!end);
        candidates[candidateId].voteCount++;
        voted[msg.sender] = true;
    }
    
    function endElection() external onlyAdmin {
        end = true;
        start = false;
    }
    function startElection() external onlyAdmin {
        start = true;
        end = false;
    }
    function getStart() public view returns(bool) {
        return start;
    }
    function getEnd() external view returns(bool) {
        return end;
    }
    
}
