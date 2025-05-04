import React, { useState } from 'react';
import './LogReg.css';
import { API } from './api';
import { Link } from 'react-router-dom';

/**
 * Register component allows users to create a new account.
 * Validates that password and confirmation match before sending a request
 * to the backend API. Displays any resulting success or error messages.
 *
 * @component
 * @returns {JSX.Element} Registration form UI
 */
function Register() {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  /**
   * Handles form submission by validating inputs and sending a POST request
   * to the register endpoint. Displays a message based on the response.
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    // Submit registration data
    const response = await fetch(API.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    setMessage(data.message); // Show server response
  };

  return (
    <div className="logreg-container">
      <div className="logreg-box">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          {/* Username input */}
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm password input */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">Register</button>
        </form>

        {/* Feedback message */}
        {message && <p className="error-message">{message}</p>}

        {/* Navigation to login */}
        <p className="redirect">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
