import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Style your navbar

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Beach Day</h2>
      <ul className="nav-links">
        <li><Link to="/beach-info">Home</Link></li>
        <li><Link to="/favorites">Favorites</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;