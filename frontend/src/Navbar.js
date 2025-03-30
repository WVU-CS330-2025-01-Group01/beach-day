import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie for managing JWT cookies
import "./Navbar.css"; // Style your navbar
import beachIcon from './beachIcon.png';  // Import your PNG image

function Navbar({ setAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the JWT cookie
    Cookies.remove('jwt');
    // Clear the authenticated state in localStorage
    localStorage.removeItem('authenticated');
    // Set authenticated state to false
    setAuthenticated(false);
    // Redirect to login page
    navigate('/login');
  };

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
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
