import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Style your navbar
import beachIcon from './beachIcon.png';  // Import your PNG image

function Navbar() {
    return (
      <div className="navbar">
        <div className="navbar-content">
          <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
          <h1 className="navbar-title">Beach Day</h1>
        </div>
        <div className="navbar-links">
          <Link to="/beach-info">Home</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/logout">Logout</Link>
        </div>
      </div>
    );
  }
  
  export default Navbar;