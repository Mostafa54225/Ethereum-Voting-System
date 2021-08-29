import React from 'react'
import { NavLink } from 'react-router-dom'

import './Navbar.css'

const NavbarUser = () => {

  return (
    <nav>
      <NavLink to="/" className="header"> Home </NavLink>
      <ul className="navbar-links">
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-registered" /> Registration
          </NavLink>
        </li>
        <li>
        <NavLink to="/Voting" activeClassName="nav-active">
            <i className="far fa-vote-yea" /> Voting
          </NavLink>
        </li>
        <li>
        <NavLink to="/Results" activeClassName="nav-active">
            <i className="far fa-poll-h" /> Results
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default NavbarUser