import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Style your navbar
import beachIcon from './beachIcon.png';  // Import your PNG image
import Cookies from 'js-cookie'; // Import Cookies

function Navbar({ authenticated, setAuthenticated }) {
  // Logout function to clear the authentication and token
  const handleLogout = () => {
    // Clear cookies and update authentication state
    Cookies.remove('token');
    setAuthenticated(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
        <h1 className="navbar-title">Beach Day</h1>
      </div>
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/settings">Settings</Link>
        
        {/* Conditionally render the Logout button */}
        {authenticated ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
