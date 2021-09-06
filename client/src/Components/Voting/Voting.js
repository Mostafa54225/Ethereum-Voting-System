// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import NavbarUser from '../Navbar/NavbarUser'
import NavbarAdmin from '../Navbar/NavbarAdmin'

import NotInit from '../NotInit.js'
// Contract
import getWeb3 from "../../getWeb3";
import Electionabi from '../../contracts/Election.json'

// CSS
import "./Voting.css";

export default class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        voted: false,
        isVerified: 0,
        isRegistered: false
      },
      voted: false,
      adminCount: 0,
      admins: [],
      isSubAdmin: false,
      adminAddress: "",
      eventVoters: []
    };
  }
  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Electionabi.networks[networkId];
      const instance = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      });

      const voted = await this.state.ElectionInstance.methods.voted(this.state.account).call()
      this.setState({voted: voted})
      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loading Candidates details
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidates(i)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          name: candidate.name,
          voteCount: candidate.voteCount
        });
      }
      this.setState({ candidates: this.state.candidates });

      // Loading current voter
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call();
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          voted: voted,
          isVerified: voter.isVerfied,
          isRegistered: voter.isRegistered
        },
      });

      // Admin account and verification
      const masterAmdin = await this.state.ElectionInstance.methods.getAdmin().call();
      

      const adminCount = await instance.methods.getTotalAdmin().call()
      this.setState({adminCount: adminCount})
      for(let i = 1; i <= this.state.adminCount; i++) {
        const admin = await instance.methods.admins(i).call()
        this.state.admins.push({
          adminAddress: admin.adminAddress,
          name: admin.name,
          status: admin.staus 
        })
      }
      if (this.state.account === masterAmdin || this.state.account === this.state.admins.adminAddress) {
        this.setState({ isAdmin: true });
      }
      this.setState({admins: this.state.admins})
      
      for(let i = 0; i < adminCount; i++) 
        if(this.state.account === this.state.admins[i].adminAddress) this.setState({isSubAdmin: true})
      


      let options = {
          filter: {
              voterAddress: this.state.account
          },
          fromBlock: 375,                  //Number || "earliest" || "pending" || "latest"
          toBlock: 'latest'
      };
      
      this.state.ElectionInstance.getPastEvents('voterIsVoted', options).then((result) => {
        console.log(result)
        for(let i = 0; i < result.length; i++) {
          this.state.eventVoters.push({
            candidateId: result[i].returnValues._candidateId,
            voterAddress: result[i].returnValues._voterAddress
          })
        }
        this.setState({eventVoters: this.state.eventVoters})
      })
      
      
      // this.state.ElectionInstance.events.voterIsVoted({
      //   filter: {myIndexedParam: [20, 23], myOtherIndexedParam: this.state.account},
      //   fromBlock: 0
      // }).on('data', (e) => {
      //   this.state.eventVoters.concat({
      //     candidateId: e.returnValues._candidateId,
      //     voterAddress: e.returnValues._voterAddress
      //   })
        
      // })
      // this.setState({eventVoters: this.state.eventVoters})     
      
      
      // console.log(this.state.eventVoters)
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  renderCandidates = (candidate) => {
    
    const castVote = async (id) => {
      await this.state.ElectionInstance.methods
        .vote(id)
        .send({ from: this.state.account });
      window.location.reload();
    };
    const confirmVote = (id, name) => {
      var r = window.confirm(
        "Vote for " + name + " with Id " + id + ".\nAre you sure?"
      );
      if (r === true) {
        castVote(id);
      }
    };
    
    // console.log(this.state.eventVoters)
    return (
      <div className="container-item d-flex p-2" style={{justifyContent: 'space-around'}}>
        <div className="candidate-info">
          <h2>
            <small>#{candidate.id}</small> {candidate.name} <strong className="text-success">{candidate.voteCount}</strong>
          </h2>
          <div>
            
          </div>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.name)}
            className="btn btn-primary"
            disabled=
              {!this.state.currentVoter.isRegistered ||
               (this.state.currentVoter.isVerified == 2 || this.state.currentVoter.isVerified == 0 )||
               this.state.currentVoter.voted ? true: false}>
            Vote
          </button>
        </div>
      </div>
    );
  };

  LoopEvent = (event, key) => {
    return (
      // <div className="d-flex bd-highlight">
      //   <p className="p-2 flex-fill bd-highlight">{event.candidateId}</p>
      //   <p className="p-2 flex-fill bd-highlight">{event.voterAddress}</p>
      // </div>
      <tr>
        <th>{event.candidateId}</th>
        <th>{event.voterAddress}</th>
      </tr>
    )
  }

  render() {
    
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin || this.state.isSubAdmin ? <NavbarAdmin /> : <NavbarUser />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin || this.state.isSubAdmin ? <NavbarAdmin /> : <NavbarUser />}
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              {this.state.currentVoter.isRegistered ? (
                this.state.currentVoter.isVerified == 1 ? (
                  this.state.currentVoter.voted ? (
                    <div className="container-item success">
                      <div>
                        <h3 className="text-center">You've casted your vote.</h3>
                        <center>
                          <a
                            href="#/Result"
                            style={{
                              color: "black",
                              textDecoration: "underline",
                            }}
                          >
                            See Results
                          </a>
                        </center>
                      </div>
                    </div>
                  ) : (
                    <div className="container-item info">
                      <h3 className="text-center">Go ahead and cast your vote.</h3>
                    </div>
                  )
                ) : (
                  <div className="container-item attention">
                    <h3 className="text-center">Please wait for admin to verify.</h3>
                  </div>
                )
              ) : (
                <>
                  <div className="container-item attention">
                    <center>
                      <h3>You're not registered. Please register first.</h3>
                      <br />
                      <a
                        href="#/Registration"
                        style={{ color: "black", textDecoration: "underline", fontSize: '20px' }}
                      >
                        Registration Page
                      </a>
                    </center>
                  </div>
                </>
              )}
              <div className="container-main">
                <h2>Candidates</h2>
                <small>Total candidates: {this.state.candidates.length}</small>
                {this.state.candidates.length < 1 ? (
                  <div className="container-item attention">
                    <center>Not one to vote for.</center>
                  </div>
                ) : (
                  <>
                    {this.state.candidates.map(this.renderCandidates)}
                    <div
                      className="container-item"
                      style={{ border: "1px solid black" }}
                    >
                      <center>That is all.</center>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            <>
              <div className="container-item attention">
                <center>The Election ended.</center>
                <center>
                  <br />
                  <a
                    href="#/Result"
                    style={{ color: "black", textDecoration: "underline" }}
                  >
                    See results
                  </a>
                </center>
              </div>
            </>
          ) : null}
          <table>
            <tr>
              <th>Candidate ID</th>
              <th>Voter Address</th>
            </tr>
            {this.state.eventVoters.map(this.LoopEvent)}
          </table>
          
          
        </div>
      </>
    );
  }
}