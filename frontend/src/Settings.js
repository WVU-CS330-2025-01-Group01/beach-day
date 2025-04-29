import React, { useContext } from "react";
import "./Settings.css";
import { UserContext } from "./UserContext";
import Cookies from 'js-cookie';

function Settings() {
  const { setAuthenticated } = useContext(UserContext);

  const handleLogout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('cachedFavorites');
    localStorage.removeItem('lastUpdated');
    setAuthenticated(false);
  };




  return (
    <div className="settings-page">
      <h1 className="settings-title">Manage Account</h1>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="settings-card profile-card">
          <h2>Profile</h2>
          <form>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="Username" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Change Password" />
            </div>
            <button className="settings-button logout-button" onClick={handleLogout}>
            Logout
          </button>
          </form>
        </div>

        {/* Sidebar Section */}
        <div className="settings-card side-card">
          <h2>Emails</h2>
          <p>The Morning Brief <span className="not-subscribed">Not Subscribed</span></p>
          <p>Marketing Emails <span className="not-subscribed">Not Subscribed</span></p>
        </div>

        {/* Subscriptions */}
        <div className="settings-card">
          <h2>Subscriptions</h2>
          <p>Subscription Status: <strong>Not a subscriber</strong></p>
          <button className="settings-button">See Subscription Offers</button>
        </div>

        {/* FAQ / Help */}
        <div className="settings-card">
          <h2>FAQ</h2>
          <p>• What can I use my account for?</p>
          <p>• How many locations can I save?</p>
          <button className="settings-button secondary">Email Us</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
