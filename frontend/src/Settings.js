import React, { useContext, useState, useEffect } from "react";
import "./Settings.css";
import { UserContext } from "./UserContext";
import Cookies from "js-cookie";

function Settings() {
  const {
    setAuthenticated,
    username,
    setUsername,
    jwtToken
  } = useContext(UserContext);

  const [newUsername, setNewUsername] = useState(username || "");
  const [email, setEmail] = useState("");  // Can be fetched from context or backend
  const [password, setPassword] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:3010/get_email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt: jwtToken })
        });
        const data = await response.json();
        if (data.email) setEmail(data.email);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, [jwtToken]);

  const handleLogout = () => {
    Cookies.remove("jwt");
    localStorage.clear();
    setAuthenticated(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const emailRes = await fetch("http://localhost:3010/set_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, email })
      });
      const emailData = await emailRes.json();

      const alertRes = await fetch("http://localhost:3010/set_alert_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, alertsEnabled: alertEnabled })
      });
      const alertData = await alertRes.json();

      if (emailData.message !== "Success." || alertData.message !== "Success.") {
        alert("Failed to save some settings.");
      } else {
        alert("Settings updated successfully.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3010/change_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: jwtToken,
          oldPassword,
          newPassword
        })
      });
      const data = await response.json();

      if (response.ok) {
        setPasswordMessage("Password updated successfully.");
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPasswordMessage("Server error.");
    }
  };

  const handleResetData = () => {
    // TODO: backend call to clear favorites, saved locations, etc.
    console.log("Resetting account data...");
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://localhost:3010/delete_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, password: deletePassword })
      });
      if (response.ok) {
        alert("Account deleted.");
        handleLogout();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error during delete.");
    }
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
                <label>Password</label>
                <button
                  type="button"
                  className="settings-button small"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </button>
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
          <button className="settings-button reset-account" onClick={handleResetData}>
            Reset Account Data
          </button>
          <button className="settings-button delete-account" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </button>
          <button className="settings-button logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordMessage && <p className="password-message">{passwordMessage}</p>}
            <div className="modal-buttons">
              <button className="settings-button" onClick={handleChangePassword}>Submit</button>
              <button className="settings-button cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal danger">
            <h3>Are you sure?</h3>
            <p>This will permanently delete your account and all data. This action cannot be undone.</p>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            </div>
            <div className="modal-buttons">
              <button className="settings-button delete-account" onClick={handleDeleteAccount}>Yes, Delete</button>
              <button className="settings-button cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Settings;