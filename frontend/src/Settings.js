import React, { useContext, useState, useEffect } from "react";
import "./Settings.css";
import { UserContext } from "./UserContext";
import Cookies from "js-cookie";
import { API } from "./api";

/**
 * Renders the user Settings page.
 * Allows a user to view their profile, change their email or password, enable alerts, and delete their account.
 *
 * @component
 * @returns {JSX.Element} The rendered Settings page UI.
 */
function Settings() {
  const {
    setAuthenticated,
    username,
    jwtToken
  } = useContext(UserContext);

  // Email management
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Alert preference
  const [alertEnabled, setAlertEnabled] = useState(false);

  // Fetch user's current email on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(API.GET_EMAIL, {
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

  /**
   * Logs out the user and clears local/session data.
   */
  const handleLogout = () => {
    Cookies.remove("jwt");
    localStorage.clear();
    setAuthenticated(false);
  };

  /**
   * Validates and updates the user's email.
   * @returns {Promise<void>}
   */
  const handleUpdateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch(API.SET_EMAIL, {
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

  /**
   * Updates the user's password after validation.
   * @returns {Promise<void>}
   */
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(API.CHANGE_PASSWORD, {
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

  /**
   * Deletes the user account after confirmation.
   * @returns {Promise<void>}
   */
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(API.DELETE_ACCOUNT, {
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

  // ======== RENDER =========
  return (
    <div className="settings-page">
      <h1 className="settings-title">Account Settings</h1>

      <div className="settings-grid fade-in">
        {/* Profile Section */}
        <div className="settings-card profile-card">
          <h2>Profile</h2>
          <div className="form-row two-column">
            <div className="form-group readonly-field">
              <label>Username</label>
              <div className="readonly-value">{username}</div>
            </div>

            <div className="form-group readonly-field email-field">
              <label>Email for Notifications</label>
              <div className="readonly-row">
                <div className="readonly-value">{email || "No Email Set"}</div>
                <button className="edit-inline" onClick={() => setShowEmailModal(true)}>
                  {email ? "Change" : "Add"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <button className="settings-button small" onClick={() => setShowPasswordModal(true)}>
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

        {/* Account Actions Section */}
        <div className="settings-card account-card">
          <h2>Account Actions</h2>
          <button className="settings-button logout" onClick={handleLogout}>
            Logout
          </button>
          <button className="settings-button logout" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Change Password</h2>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
