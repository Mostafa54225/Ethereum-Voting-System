// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";

// Components
import NavbarUser from '../Navbar/NavbarUser'
import NavbarAdmin from '../Navbar/NavbarAdmin'

import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import Electionabi from '../../contracts/Election.json'
// CSS
import "./Result.css";

export default class Result extends Component {
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
      adminCount: 0,
      admins: [],
      isSubAdmin: false,
      adminAddress: "",
    };
  }
  componentDidMount = async () => {
    // if (!window.location.hash) {
    //   window.location = window.location + "#loaded";
    //   window.location.reload();
    // }
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Electionabi.networks[networkId];
      const instance = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)

      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      const candidateCount = await this.state.ElectionInstance.methods.getTotalCandidate().call();
      this.setState({ candidateCount: candidateCount });

      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loadin Candidates detials
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods.candidates(i).call();
        this.state.candidates.push({
          id: candidate.candidateId,
          name: candidate.name,
          voteCount: candidate.voteCount,
        });
      }

      this.setState({ candidates: this.state.candidates });

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

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
      this.setState({admins: this.state.admins})
      
      for(let i = 0; i < adminCount; i++) 
        if(this.state.account === this.state.admins[i].adminAddress) this.setState({isSubAdmin: true})

    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
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
        <br />
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item attention">
              <center>
                <p>Result will be displayed once the election has ended.</p>
                <p>Go ahead and cast your vote {"(if not already)"}.</p>
                <br />
                <Link
                  to="/Voting"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  Voting Page
                </Link>
              </center>
            </div>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            displayResults(this.state.candidates)
          ) : null}
        </div>
      </>
    );
  }
}

function displayWinner(candidates) {
  const getWinner = (candidates) => {
    // Returns an object having maxium vote count
    let maxVoteRecived = 0;
    let winnerCandidate = [];
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].voteCount > maxVoteRecived) {
        maxVoteRecived = candidates[i].voteCount;
        winnerCandidate = [candidates[i]];
      } else if (candidates[i].voteCount === maxVoteRecived) {
        winnerCandidate.push(candidates[i]);
      }
    }
    return winnerCandidate;
  };
  const renderWinner = (winner) => {
    return (
      <div className="container-winner">
        <div className="winner-info">
          <p className="winner-tag">Winner!</p>
          <h2> {winner.name}</h2>
        </div>
        <div className="winner-votes">
          <div className="votes-tag">Total Votes: </div>
          <div className="vote-count">{winner.voteCount}</div>
        </div>
      </div>
    );
  };
  const winnerCandidate = getWinner(candidates);
  return <>{winnerCandidate.map(renderWinner)}</>;
}

export function displayResults(candidates) {
  const renderResults = (candidate) => {
    return (
      <tr>
        <td>{candidate.id}</td>
        <td>{candidate.name}</td>
        <td>{candidate.voteCount}</td>
      </tr>
    );
  };
  return (
    <>
      {candidates.length > 0 ? (
        <div className="container-main">{displayWinner(candidates)}</div>
      ) : null}
      <div className="container-main" style={{ borderTop: "1px solid" }}>
        <h2 className="text-center">Results</h2>
        <p className="text-center">Total candidates: {candidates.length}</p>
        {candidates.length < 1 ? (
          <div className="container-item attention">
            <center>No candidates.</center>
          </div>
        ) : (
          <>
            <div className="container-item">
              <table>
                <tr>
                  <th>Id</th>
                  <th>Candidate</th>
                  <th>Votes</th>
                </tr>
                {candidates.map(renderResults)}
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}