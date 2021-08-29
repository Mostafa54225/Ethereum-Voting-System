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
        hasVoted: false,
      },
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
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
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
      this.state.currentVoter.hasVoted = true
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
      <div className="container-item">
        <div className="candidate-info">
          <h2>
            {candidate.name} <small>#{candidate.id}</small>
          </h2>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.id, candidate.name)}
            className="vote-bth"
            disabled={
              this.state.currentVoter.hasVoted
            }
          >
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
          {this.state.isAdmin ? <NavbarAdmin /> : <NavbarUser />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <NavbarUser />}
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              {this.state.currentVoter.hasVoted ? (
                  <div className="container-item success">
                    <div>
                      <strong>You've casted your vote.</strong>
                      <p />
                      <center>
                        <Link
                          to="/Results"
                          style={{
                            color: "black",
                            textDecoration: "underline",
                          }}
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
                <center>
                  <h3>The Election ended.</h3>
                  <br />
                  <Link
                    to="/Results"
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