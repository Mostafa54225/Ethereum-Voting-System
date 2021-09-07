import React from 'react'
// import { NavLink } from 'react-router-dom'

import './Navbar.css'

  

const NavbarUser = (masterAdmin) => {

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLink = document.querySelectorAll(".nav-link");

  function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  }

  navLink.forEach(n => n.addEventListener("click", closeMenu));

  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }

  return (
    <header className="header">
        <nav className="navbar">
            <a href={process.env.PUBLIC_URL + "#/"} className="nav-logo">Admin.</a>
            <ul className="nav-menu">
              {masterAdmin ? 
                <li className="nav-item">
                  <a href={process.env.PUBLIC_URL + "#/AddAdmin"} className="nav-link">Add Admin</a>
                </li>: null
              }
              <li className="nav-item">
                  <a href={process.env.PUBLIC_URL + "#/Verification"} className="nav-link">Verfication</a>
              </li>
              <li className="nav-item">
                  <a href={process.env.PUBLIC_URL + "#/AddCandidate"} className="nav-link">Add Candidate</a>
              </li>
              <li className="nav-item">
                  <a href={process.env.PUBLIC_URL + "#/Voting"} className="nav-link">Voting</a>
              </li>
              <li className="nav-item">
                  <a href={process.env.PUBLIC_URL + "#/Result"} className="nav-link">Result</a>
              </li>
            </ul>
            <div className="hamburger" onClick={mobileMenu}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
        </nav>
  </header>
  )
}


export default NavbarUser