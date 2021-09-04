import React, { Component } from 'react'

import NavbarUser from '../../Navbar/NavbarUser'
import NavbarAdmin from '../../Navbar/NavbarAdmin'
import AdminOnly from '../AdminOnly'

import getWeb3 from '../../../getWeb3'
import Electionabi from '../../../contracts/Election.json'

import './Verification.css'

export default class Verification extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ElectionInstance: undefined,
      account: "",
      isAdmin: false,
      voterCount: undefined,
      voters: [],
      web3: null
    }
  }

  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Electionabi.networks[networkId];
      const instance = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)

      this.setState({ web3, ElectionInstance: instance, account: accounts[0] });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call()
      if(this.state.account == admin) this.setState({isAdmin: true})

      const voterCount = await this.state.ElectionInstance.methods.getTotalVoters().call()
      this.setState({voterCount: voterCount})

      for(let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.ElectionInstance.methods.voters(i).call()
        const voter = await this.state.ElectionInstance.methods.voterDetails(voterAddress).call()
        const voted = await this.state.ElectionInstance.methods.voted(voterAddress).call()

        this.state.voters.push({
          address: voterAddress,
          name: voter.name,
          phone: voter.phone,
          isVerified: voter.isVerfied,
          isRegistered: voter.isRegistered,
          voted: voted
        })
        this.setState({voters: this.state.voters})

      }
      
    } catch (error) {
      console.error(error)
      alert('Failed To Load The Contract...')
    }
  }

  renderUnverifiedVoters = (voter) => {
    const verifyVoter = async (address, verifiedStatus) => {
      await this.state.ElectionInstance.methods
      .verifyVoter(address, verifiedStatus)
      .send({from: this.state.account})

      window.location.reload()
    }
    console.log(voter.voted)
    return (
      <>
        <div>
          {voter.isVerified == 1 ? (
            <div className="d-flex bd-highlight">
              <p className="p-2 flex-fill bd-highlight">Account: {voter.address}</p>
              <p className="p-2 flex-fill bd-highlight text-success">Approved</p>
              <p className="p-2 flex-fill bd-highlight">Vote Status: {voter.voted ? "True": "False"}</p>
            </div>
          ): voter.isVerified == 2 ? (
            <div className="d-flex bd-highlight">
              <p className="p-2 flex-fill bd-highlight">Account: {voter.address}</p>
              <p className="p-2 flex-fill bd-highlight text-danger">Rejected</p>
              <p className="p-2 flex-fill bd-highlight">Vote Status: {voter.voted ? "True": "False"}</p>
            </div>
          ): (
            <div>
              <table>
                <tr>
                  <th>Account Address</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Approve</th>
                  <th>Reject</th>
                </tr>
                <tr>
                  <td>{voter.address}</td>
                  <td>{voter.name}</td>
                  <td>{voter.phone}</td>
                  <td><button 
                    className="btn btn-success"
                    onClick={() => verifyVoter(voter.address, 1)}>Approve</button></td>
                  <td><button 
                    className="btn btn-danger"
                    onClick={() => verifyVoter(voter.address, 2)}>Reject</button></td>
                </tr>
              </table>
            </div>
          )}
        </div>
      </>
    )
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
    if(!this.state.isAdmin) {
      return(
        <>
          <NavbarUser />
          <AdminOnly page="Verification Page." />
        </>
      )
    }
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h3 className="text-center">Verification</h3>
          <p className="text-center">Total Voters: {this.state.voterCount}</p>
          {this.state.voterCount == 0 ? (
            <p className="text-center">No One has Registered Yet.</p>
          ): (
            <>
              <div>
                <p className="text-center">List Of Registered Voters:</p>
              </div>
              {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
          )}
        </div>
      </>
    )
  }


}