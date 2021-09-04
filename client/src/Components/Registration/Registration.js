import React, { Component } from 'react'

import NavbarUser from '../Navbar/NavbarUser'
import NavbarAdmin from '../Navbar/NavbarAdmin'
import NotInit from '../NotInit'

import getWeb3 from '../../getWeb3'
import Electionabi from '../../contracts/Election.json'


import './Registration.css'


export default class Registration extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      voterCount: undefined,
      voterName: '',
      voterPhone: '',
      voters: [],
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        voted: false,
        isVerified: 0,
        isRegistered: false
      }
    }
  }

  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = Electionabi.networks[networkId]
      const instance = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)

      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0]
      })

      const admin = await this.state.ElectionInstance.methods.getAdmin().call()
      if(this.state.account === admin) this.setState({isAdmin: true})

      const start = await this.state.ElectionInstance.methods.getStart().call()
      this.setState({isElStarted: start})
      const end = await this.state.ElectionInstance.methods.getEnd().call()
      this.setState({isElEnded: end})


      const voterCount = await this.state.ElectionInstance.methods.getTotalVoters().call()
      this.setState({voterCount: voterCount})

      for(let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods.voters(i).call()
        const voter = await this.state.ElectionInstance.methods.voterDetails(voterAddress).call()
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered
        })
      }

      this.setState({voters: this.state.voters})


      const currentVoter = await this.state.ElectionInstance.methods.voterDetails(this.state.account).call()
      const voted = await this.state.ElectionInstance.methods.voted(this.state.account).call()
      this.setState({
        currentVoter: {
          address: currentVoter.voterAddress,
          name: currentVoter.name,
          phone: currentVoter.phone,
          voted: voted,
          isVerified: currentVoter.isVerfied,
          isRegistered: currentVoter.isRegistered
        }
      })

    } catch (error) {
      console.error(error)
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  }


  updateVoterName = (e) => {
    this.setState({voterName: e.target.value})
  }
  updateVoterPhone = (e) => {
    this.setState({voterPhone: e.target.value})
  }

  registerAsVoter = async () => {
    
    if(!this.state.currentVoter.isRegistered) {
      await this.state.ElectionInstance.methods
      .registerAsVoter(this.state.voterName, this.state.voterPhone)
      .send({from: this.state.account})
    } else {
      await this.state.ElectionInstance.methods
      .updateVoter(this.state.voterName, this.state.voterPhone)
      .send({from: this.state.account})
    }
    
    window.location.reload()
  }
  render() {
    if(!this.state.web3) {
      return(
        <>
          {this.state.isAdmin ? <NavbarAdmin />: <NavbarUser />}
          <center>Loading Web3, accounts, and Contracts...</center>
        </>
      )
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin />: <NavbarUser />}
        {!this.state.isElStarted && !this.state.isElEnded ? 
        (
          <NotInit />
        ) : (
          <div className="">
            <div className="container-item info">
              <p className="text-center">Total registered voters: {this.state.voters.length}</p>
            </div>
            <div className="container-main ">
              <h3>Registration</h3>
              <small>Register to vote.</small>
              <div className="container-item">
                <form>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Account Address
                      <input
                        className={"input-r"}
                        type="text"
                        value={this.state.account}
                        style={{ width: "400px" }}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Name
                      <input
                        className={"input-r"}
                        type="text"
                        placeholder="eg. Mostafa"
                        value={this.state.voterName}
                        onChange={this.updateVoterName}
                      />{" "}
                    </label>
                  </div>
                  <div className="div-li">
                    <label className={"label-r"}>
                      Phone number <span style={{ color: "tomato" }}>*</span>
                      <input
                        className={"input-r"}
                        type="number"
                        placeholder="eg. 01091390188"
                        value={this.state.voterPhone}
                        onChange={this.updateVoterPhone}
                      />
                    </label>
                  </div>
                  <p>
                    <span style={{ color: "red" }}> Note: </span>
                    <br /> Make sure your account address and Phone number are
                    correct.
                  </p>
                  <button
                    className="btn-add"
                    disabled={
                      this.state.voterPhone.length !== 11 ||
                      this.state.currentVoter.isVerified === 1
                    }
                    onClick={this.registerAsVoter}
                  >
                    {this.state.currentVoter.isRegistered
                      ? "Update"
                      : "Register"}
                  </button>
                </form>
              </div>
            </div>
            <div
              className="container-main"
              style={{
                borderTop: this.state.currentVoter.isRegistered
                  ? null
                  : "1px solid",
              }}
            >
              {loadCurrentVoter(
                this.state.currentVoter,
                this.state.currentVoter.isRegistered
              )}
            </div>
            {this.state.isAdmin ? (
              <div
                className="container-main"
                style={{ borderTop: "1px solid" }}
              >
                <small>TotalVoters: {this.state.voters.length}</small>
                {loadAllVoters(this.state.voters)}
              </div>
            ) : null}            
          </div>
        )}
      </>
    )
  }
} 

export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr>
            <th>Account Address</th>
            <td>{voter.address}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{voter.name}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{voter.phone}</td>
          </tr>
          <tr>
            <th>Voted</th>
            <td>{voter.voted ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Verification</th>
            <td>{voter.isVerified == 1 ? "True" : "False"}</td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{voter.isRegistered ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllVoters(voters) {
  const renderAllVoters = (voter) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr>
              <th>Account address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerified == 1 ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of voters</center>
      </div>
      {voters.map(renderAllVoters)}
    </>
  );
}