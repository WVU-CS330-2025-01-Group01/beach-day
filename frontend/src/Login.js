import React, { useState } from 'react';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import './LogReg.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import Cookies from 'js-cookie';  // Import js-cookie
import { cacheFavorites } from './utils';
import { API } from './api';

function Login() {
  const {
    setAuthenticated,
    setLoadingFavorites,
    favorites,
    setFavorites,
    setJwtToken,
    username,
    setUsername
  } = useContext(UserContext);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // Initialize the useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.jwt) {
        setJwtToken(data.jwt);  // still async, so pass data.jwt directly to the next call
        Cookies.set('jwt', data.jwt, { expires: 1, secure: false, sameSite: 'Strict', path: '/' }); // Store JWT token in a cookie with a 1-day expiration

        setAuthenticated(true);
        setUsername(username);
        localStorage.setItem('username', username);
        navigate('/home');
        setFavorites([]); // Clear the old favorites before adding new ones incrementally
        await cacheFavorites(data.jwt, setLoadingFavorites, setFavorites, favorites);
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="logreg-container">
      <div className="logreg-box">
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

