import React, { useState } from "react";
import "./Settings.css"; // Importing styles

function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Settings saved");
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="settings-input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="settings-input-group">
          <label htmlFor="notifications">Enable Notifications:</label>
          <input
            type="checkbox"
            id="notifications"
            checked={notification}
            onChange={() => setNotification(!notification)}
          />
        </div>

        <button type="submit" className="settings-button">
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default Settings;
