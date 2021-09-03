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
      Electioninstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      voterCount: undefined,
      voters: []
    }
  }

  componentDidMount = async () => {
    if(!window.location.hash) {
      window.location = window.location + '#loaded'
      window.location.reload()
    }
    try {

      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = Electionabi.networks[networkId]
      const instance = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)

      this.setState({
        Electioninstance: instance,
        web3: web3,
        account: accounts[0]
      })

      const admin = await this.state.Electioninstance.methods.getAdmin().call()
      if(this.state.account == admin) this.setState({isAdmin: true})

      const voterCount = await this.state.Electioninstance.methods.getTotalVoters().call()
      this.setState({voterCount: voterCount})

      for(let i = 0; i < this.state.voterCount; i++) {
        const voterAddress = await this.state.Electioninstance.methods.voters(i).call()
        const voter = await this.state.Electioninstance.methods.voterDetails(voterAddress).call()

        const voted = await this.state.Electioninstance.methods.voted(voterAddress).call()
        
        this.state.voters.push({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          isVerfied: voter.isVerfied,
          isRegistered: voter.isRegistered,
          voted: voted
        })
        this.setState({voters: this.state.voters})
      }
    } catch(error) {
      console.error(error)
      alert('Failed to load web3, accounts, or Contracts')
    }
  }

  renderUnverifiedVoters = (voter) => {
    const verifyVoter = async (address, verifiedStatus) => {
      await this.state.Electioninstance.methods
        .verifyVoter(address, verifiedStatus)
        .send({from: this.state.account})
      
      window.location.reload()
    }
    return(
      <>
      <hr style={{width:'100%', height: '4px' }}></hr>
        {voter.isVerfied == 1 ? (
          <div className="d-flex bd-highlight">
            <p className="p-2 flex-fill bd-highlight" style={{ margin: "7px 0px" }}>AC: {voter.address}</p>
            <p className="p-2 flex-fill bd-highlight">Approved</p>
            <p className="p-2 flex-fill bd-highlight">Vote Status: {voter.voted ? "true" : "false"}</p>
          </div>
        ) : voter.isVerfied == 2 ?(
          <div className="d-flex bd-highlight">
            <p className="p-2 flex-fill bd-highlight" style={{ margin: "7px 0px" }}>AC: {voter.address}</p>
            <p className="p-2 flex-fill bd-highlight">Rejected</p>
            <p className="p-2 flex-fill bd-highlight">Vote Status: {voter.voted ? "true" : "false"}</p>
          </div>
        ):(
        
        <div
          className="container-list attention"
          style={{display: voter.isVerfied == 1 ? "none": null}}
        >
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
              <td>{voter.voted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verified</th>
              <td>{voter.isVerfied == 1 ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
          <div style={{textAlign: 'center'}}>
            <button
              className="btn-verification approve"
              disabled={voter.isVerfied == 1}
              onClick={() => verifyVoter(voter.address, 1)}
            >
              Approve
            </button>
            <button
              className="btn-verification reject"
              disabled={voter.isVerfied == 1}
              onClick={() => verifyVoter(voter.address, 2)}
            >
              Reject
            </button>
          </div>
        </div>
        )}
      </>
    )
  }

  render() {
    if(!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin />: <NavbarUser />}
          <center>Loading Web3, accounts, and contracts...</center>
        </>
      )
    }
    if(!this.state.isAdmin) {
      return (
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
          <p className="text-center">Total Voters: {this.state.voters.length}</p>
          {this.state.voters.length < 1 ? (
            <div className="container-item info">No one has registered yet.</div>
          ): (
            <>
              <dv className="container-item info">
                <p className="text-center">List of Registered Voters</p>
              </dv>
              {this.state.voters.map(this.renderUnverifiedVoters)}
            </>
          )}
        </div>
      </>
    )
  }
}