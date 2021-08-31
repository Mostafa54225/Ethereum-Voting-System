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
      },
      voted: false,
      adminCount: 0,
      admins: [],
      isSubAdmin: false,
      adminAddress: "",
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

      console.log(this.state.account)
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
          name: candidate.name
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
          hasVoted: voter.hasVoted,
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
    return (
      <div className="container-item d-flex p-2" style={{justifyContent: 'space-around'}}>
        <div className="candidate-info">
          <h2>
            {candidate.name} <small>#{candidate.id}</small>
          </h2>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.name)}
            className="btn btn-primary"
            disabled={this.state.voted ? true: false}>
            Vote
          </button>
        </div>
      </div>
    );
  };

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
              {this.state.voted ? (
                  <div className="container-item success">
                    <div>
                      <p className="text-center h4">You've casted your vote.</p>
                      <p />
                      <center>
                        <Link
                          to="/Result"
                          style={{
                            color: "black",
                            textDecoration: "underline",
                          }}
                          className="h4 mb-4"
                        >
                          See Results
                        </Link>
                      </center>
                    </div>
                  </div>
                  ) : (
                    <div className="container-item info">
                      <center>Go ahead and cast your vote.</center>
                    </div>
                )}
              <div className="container-main">
                <h2 className="text-center">Candidates</h2>
                <p className="text-center">Total candidates: {this.state.candidates.length}</p> 
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
                  <Link
                    to="/Result"
                    style={{ color: "black", textDecoration: "underline" }}
                  >
                    See results
                  </Link>
                </center>
              </div>
            </>
          ) : null}
        </div>
      </>
    );
  }
}