import React, { useState, useEffect } from 'react'
import getWeb3 from '../../../getWeb3'
import NavbarUser from '../../Navbar/NavbarUser'
import NavbarAdmin from '../../Navbar/NavbarAdmin'
import AdminOnly from '../AdminOnly'
import Electionabi from '../../../contracts/Election.json'
import LoadAdmins from './LoadAdmins'

import '../AddCandidate/AddCandidate.css'

const AddCandidate = () => {

  const[currentAccount, setCurrentAccount] = useState("")
  const[ElectionSC, setElectionSC] = useState()
  const[isAdmin, setIsAdmin] = useState(false)
  const[web3, setWeb3] = useState(null)
  const[adminName, setAdminName] = useState("")
  const[adminCount, setAdminCount] = useState()
  const[admins, setAdmins] = useState([])
  const[adminAddress, setAdminAddress] = useState("")
  useEffect(() => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    loadContracts()

  }, )
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
      const adminCount = await election.methods.getTotalAdmin().call()
      setAdminCount(adminCount)

      let admins = []
      for(let i = 1; i <= adminCount; i++) {
        const admin = await election.methods.admins(i).call()
        if(account[0] === admin.adminAddress) setIsAdmin(true)
        admins.push(admin)
      }
      setAdmins(admins)
      
      // for(let i = 1; i <= adminCount; i++)
      //   if(account[0] === admins[i].adminAddress) setIsSubAdmin(true) 
    }
  }

  const updateAdminName = (e) => {
    setAdminName(e.target.value)
  }
  const updateAdminAddress = (e) => {
    setAdminAddress(e.target.value)
  }

  const addAdmin = async () => {
    await ElectionSC
    .methods
    .addAdmin(adminAddress, adminName)
    .send({from: currentAccount})
    .on('transactionhash', () => {console.log("Added Successfully")})
    window.location.reload()
  }
  if(!web3) {
    return (
      <>
      {isAdmin ? <NavbarAdmin /> : <NavbarUser />}
        {/* { isAdmin || admins[currentAccount] ? <NavbarAdmin masterAdmin={true}/> :
          !admins[currentAccount]? <NavbarAdmin masterAdmin={false} />
          : <NavbarUser />
        } */}
        <center>Loading Web3, accounts, and contracts...</center>
      </>
    )
  }
  if(!isAdmin) {
    
    return(
      <>
        <NavbarUser />
        <AdminOnly page="Add Admins Page"/>
      </>
    )
  }
  return (
    <div>
      <NavbarAdmin />
      <div className="container-main">
        <h2 className="text-center">Add a new Admin</h2>
        <center>Total Admins: {adminCount}</center>
        <div className="container-item">
          <form className="form">
            <label className={"label-ac"}>
              Name
              <input
                className={"input-ac"}
                type="text"
                placeholder="Admin Name"
                value={adminName}
                onChange={updateAdminName}
              />
            </label>
            <label className={"label-ac"}>
              Public Address
              <input
                className={"input-ac"}
                type="text"
                placeholder="Public Address"
                value={adminAddress}
                onChange={updateAdminAddress}
              />
            </label>
            <button
              onClick={addAdmin} className="btn-add"
              disabled={adminName.length < 3 || adminName.length > 21}>
              Add
            </button>
          </form>
        </div>
      </div>
      <LoadAdmins admins={admins}/>
    </div>
  )
}

export default AddCandidate