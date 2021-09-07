import React, { useState, useEffect } from 'react'

import NavbarUser from '../Navbar/NavbarUser'
import NavbarAdmin from '../Navbar/NavbarAdmin'

import RenderAdmin from './RenderAdmin'
import getWeb3 from '../../getWeb3'
import Electionabi from '../../contracts/Election.json'
import UserHome from './UserHome'
import { Link } from "react-router-dom";


import './Home.css'

const Home = () => {
  const[currentAccount, setCurrentAccount] = useState("")
  const[ElectionSC, setElectionSC] = useState()
  const[isAdmin, setIsAdmin] = useState(false)
  const[start, setStart] = useState(false)
  const[end, setEnd] = useState(false)
  const[adminName, setAdminName] = useState("")
  const[electionTitle, setElectionTitle] = useState("")
  const[web3, setWeb3] = useState()
  const[electionDetails, setElectionDetails] = useState({})
  const[admins, setAdmins] = useState([])
  const[isSubAdmin, setIsSubAdmin] = useState(false)

  useEffect(() => {
    
    loadContract()
  })

  const loadContract = async () => {
    const web3 = await getWeb3()
    setWeb3(web3)
    const account = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const deployedNetwork = Electionabi.networks[networkId]
    if(deployedNetwork) {
      const election = new web3.eth.Contract(Electionabi.abi, deployedNetwork.address)
      setElectionSC(election)
      setCurrentAccount(account[0])
      console.log(currentAccount)
      const admin = await election.methods.getAdmin().call()
      if(account[0] === admin) setIsAdmin(true)
        
      
      const start = await election.methods.getStart().call()
      setStart(start)
      const end = await election.methods.getEnd().call()
      setEnd(end)
      
      const adminName = await election.methods.getAdminName().call() 
      setAdminName(adminName)
      const electionTitle = await election.methods.getElectionTitle().call()
      setElectionTitle(electionTitle)

      setElectionDetails({elDetails: adminName, electionTitle})


      const adminCount = await election.methods.getTotalAdmin().call()
      setAdminName(adminCount)
      let admins = []
      for(let i = 1; i <= adminCount; i++) {
        const admin = await election.methods.admins(i).call()
        admins.push(admin)
      }
      setAdmins(admins)

      for(let i = 0; i < adminCount; i++) {
        if(account[0] === admins[i].adminAddress) setIsSubAdmin(true)
      }
      
      const getTransactionCount = await web3.eth.getTransactionCount(account[0])
      console.log(getTransactionCount)
      
    }
  }

  const registerElection = async (data) => {
    await ElectionSC
    .methods
    .setElectionDetails(data.adminName, data.electionTitle)
    .send({from: currentAccount})
    window.location.reload()
  } 

  const endElection = async () => {
    await ElectionSC
    .methods
    .endElection()
    .send({from: currentAccount})
    window.location.reload()
  }

  
  
  if(!web3) {
    return (
      <>
        <NavbarUser />
        <center>Loading Web3, accounts, and contracts...</center>
      </>
    )
  }

  return (
    <>
      {isAdmin || isSubAdmin ? <NavbarAdmin /> : <NavbarUser />}
      <div className="container-main">
        <div className="container-item center-items info">
          <center>Your Account {currentAccount}</center>
        </div>
        {!end & !start ? (
          <div className="container-item info">
            <center>
              <h3 className="text-center">The Election has not been initialized</h3>
              {isAdmin || isSubAdmin ? ( <p>Set Up the election</p> ):  ( <p>Please Wait</p> )}
            </center>
          </div>
        ):null}
      </div>
      {isAdmin || isSubAdmin ? <RenderAdmin registerElection={registerElection} start={start} end={end} endElection={endElection}/>
      :start ? (
        <>
          <UserHome electionDetails={electionDetails} />
        </>
      ): !start && end ? (
        <>
          <div className="container-item attention">
            <center>
              <h3 className="text-center">The Election ended.</h3>
              <br />
              <a
                href={process.env.PUBLIC_URL +"#/Result"}
                style={{ color: "black", textDecoration: "underline" }}
              >
                See results
              </a>
            </center>
          </div>
        </>
      ): null}
    </>
  )
}


export default Home