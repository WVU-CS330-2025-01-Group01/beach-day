import React, { useContext, useState } from "react";
import "./Settings.css";
import { UserContext } from "./UserContext";
import Cookies from "js-cookie";

function Settings() {
  const {
    setAuthenticated,
    username,
    setUsername
    // Add other context values like email or alerts if you're tracking them
  } = useContext(UserContext);

  const [newUsername, setNewUsername] = useState(username || "");
  const [email, setEmail] = useState("");  // Can be fetched from context or backend
  const [password, setPassword] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);

  const handleLogout = () => {
    Cookies.remove("jwt");
    localStorage.clear();
    setAuthenticated(false);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // TODO: call backend to update username, password, email
    console.log("Saving:", { newUsername, email, password, alertEnabled });
    setUsername(newUsername);
  };

  const handleResetData = () => {
    // TODO: backend call to clear favorites, saved locations, etc.
    console.log("Resetting account data...");
  };

  const handleDeleteAccount = () => {
    // TODO: backend call to delete account after confirmation
    console.log("Deleting account...");
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Account Settings</h1>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="settings-card profile-card">
          <h2>Profile</h2>
          <form onSubmit={handleSaveChanges}>
            <div className="form-row two-column">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email for Notifications</label>
                <input
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group checkbox-row">
                <div className="checkbox-title">Enable Weather Alerts</div>
                <label className="checkbox-info">
                    <span>Receive website and email notifications for weather alerts</span>
                  <input
                    type="checkbox"
                    checked={alertEnabled}
                    onChange={(e) => setAlertEnabled(e.target.checked)}
                  />
                </label>
              </div>
            </div>

            <button type="submit" className="settings-button">
              Save Changes
            </button>
          </form>
        </div>


        {/* Account Actions Section */}
        <div className="settings-card account-card">
          <h2>Account Actions</h2>
          <button className="settings-button" onClick={handleResetData}>
            Reset Account Data
          </button>
          <button className="settings-button logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button className="settings-button secondary" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;