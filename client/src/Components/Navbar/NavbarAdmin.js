import React from 'react'
import { NavLink } from 'react-router-dom'

import './Navbar.css'

const NavbarAdmin = () => {

  return (
    <nav>
      <NavLink to="/" className="header"> Admin </NavLink>
      <ul className="navbar-links">
        <li>
          <NavLink to="/AddCandidate" activeClassName="nav-active"> Add Candidate </NavLink>
        </li>
        <li>
        <NavLink to="/Voting" activeClassName="nav-active">
            <i className="far fa-vote-yea" /> Voting
          </NavLink>
        </li>
        <li>
        <NavLink to="/Result" activeClassName="nav-active">
            <i className="far fa-poll-h" /> Results
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default NavbarAdmin