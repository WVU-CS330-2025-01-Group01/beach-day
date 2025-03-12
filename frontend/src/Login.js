import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function Login({ setAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // Initialize the useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    
    if (data.message === 'Authentication successful') {
      // Set the authenticated state to true when login is successful
      setAuthenticated(true);

      // Navigate to the Beach Info page directly after successful login
      navigate('/beach-info');
    } else {
      setMessage(data.message); // Show the error message if login fails
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn">Login</button>
        </form>
        {message && <p className="error-message">{message}</p>}
        <p className="redirect">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

