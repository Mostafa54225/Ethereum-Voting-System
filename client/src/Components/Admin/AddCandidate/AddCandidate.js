import React, { useState, useEffect } from 'react'
import getWeb3 from '../../../getWeb3'
import NavbarUser from '../../Navbar/NavbarUser'
import NavbarAdmin from '../../Navbar/NavbarAdmin'
import AdminOnly from '../AdminOnly'
import Electionabi from '../../../contracts/Election.json'
import LoadCandidates from './LoadCandidates'

import './AddCandidate.css'

const AddCandidate = () => {

  const[currentAccount, setCurrentAccount] = useState("")
  const[ElectionSC, setElectionSC] = useState()
  const[isAdmin, setIsAdmin] = useState(false)
  const[web3, setWeb3] = useState(null)
  const[candidateName, setCandidateName] = useState("")
  const[candidateCount, setCandidateCount] = useState()
  const[candidates, setCandidates] = useState([])
  const[isSubAdmin, setIsSubAdmin] = useState(false)
  const[adminCount, setAdminCount] = useState()
  const[admins, setAdmins] = useState([])

  useEffect(() => {
    // if (!window.location.hash) {
    //   window.location = window.location + "#loaded";
    //   window.location.reload();
    // }
    loadContracts()
  })
  const loadContracts = async () => {
    const web3 = await getWeb3()
    setWeb3(web3)
    const account = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const deployedNetwork = Electionabi.networks[networkId]
    if(deployedNetwork) {
      const election = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)
      setElectionSC(election)
      setCurrentAccount(account[0])
      const masterAdmin = await election.methods.getAdmin().call()
      if(account[0] === masterAdmin) setIsAdmin(true)
      const candidateCount = await election.methods.getTotalCandidate().call()
      setCandidateCount(candidateCount)

      const adminCount = await election.methods.getTotalAdmin().call()
      setAdminCount(adminCount)

      let admins = []
      for(let i = 1; i <= adminCount; i++) {
        const admin = await election.methods.admins(i).call()
        admins.push(admin)
        if(account[0] === masterAdmin || account[0] === admin.adminAddress) setIsAdmin(true)
      }
      setAdmins(admins)

      let candidates = []
      for(let i = 1; i <= candidateCount; i++) {
        const candidate = await election.methods.candidates(i).call()
        candidates.push(candidate)
      }
      setCandidates(candidates)      
    }
  }

  const updateCandidateName = (e) => {
    setCandidateName(e.target.value)
  }

  const addCandidate = async () => {
    await ElectionSC
    .methods
    .addCandidate(candidateName)
    .send({from: currentAccount})
    .on('transactionhash', () => {console.log("Added Successfully")})
    window.location.reload()
  }
  if(!web3) {
    return (
      <>
        { isAdmin? <NavbarAdmin />: <NavbarUser /> }
        <center>Loading Web3, accounts, and contracts...</center>
      </>
    )
  }
  if(!isAdmin) {
    return(
      <>
        <NavbarUser />
        <AdminOnly page="Add Candidates Page"/>
      </>
    )
  }
  return (
    <div>
      <NavbarAdmin />
      <div className="container-main">
        <h2 className="text-center">Add a new Candidate</h2>
        <center>Total Candidates: {candidateCount}</center>
        <div className="container-item">
          <form className="form">
            <label className={"label-ac"}>
              Name
              <input
                className={"input-ac"}
                type="text"
                placeholder="Candidate Name"
                value={candidateName}
                onChange={updateCandidateName}
              />
            </label>
            <button
              onClick={addCandidate} className="btn-add"
              disabled={candidateName.length < 3 || candidateName.length > 21}>
              Add
            </button>
          </form>
        </div>
      </div>
      <LoadCandidates candidates={candidates}/>
    </div>
  )
}

export default AddCandidate