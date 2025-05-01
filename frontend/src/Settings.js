import React, { useContext, useState, useEffect } from "react";
import "./Settings.css";
import { UserContext } from "./UserContext";
import Cookies from "js-cookie";

function Settings() {
  const {
    setAuthenticated,
    username,
    jwtToken
  } = useContext(UserContext);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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

  const handleUpdateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3010/set_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, email: newEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setEmail(newEmail);
        setNewEmail("");
        setEmailError("");
        setShowEmailModal(false);
      } else {
        setEmailError(data.error || "Failed to update email.");
      }
    } catch (err) {
      console.error("Email update error:", err);
      setEmailError("Server error.");
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
          <div>
            <div className="form-row two-column">
              <div className="form-group readonly-field">
                <label>Username</label>
                <div className="readonly-value">{username}</div>
              </div>

              <div className="form-group readonly-field email-field">
                <label>Email for Notifications</label>
                <div className="readonly-row">
                  <div className="readonly-value">{email || "No Email Set"}</div>
                  <button
                    className="edit-inline"
                    onClick={() => setShowEmailModal(true)}
                  >
                    {email ? "Change" : "Add"}
                  </button>
                </div>
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
          </div>
        </div>


        {/* Account Actions Section */}
        <div className="settings-card account-card">
          <h2>Account Actions</h2>
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
            <h2>Change Password</h2>
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

      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal email">
            <h2>{email ? "Change Email" : "Add Email"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEmail();
              }}
            >
              <div className="form-group">
                <label>New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="example@domain.com"
                />
              </div>
              {emailError && <p className="email-error">{emailError}</p>}
              <div className="modal-buttons">
                <button type="submit" className="settings-button">Submit</button>
                <button
                  type="button"
                  className="settings-button cancel"
                  onClick={() => {
                    setNewEmail("");
                    setEmailError("");
                    setShowEmailModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Settings;