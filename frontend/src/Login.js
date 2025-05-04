import React, { useState } from 'react';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import './LogReg.css';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { cacheFavorites } from './utils';
import { API } from './api';

/**
 * Login component provides a form for user authentication.
 * On successful login, it sets the JWT, updates user state, fetches favorites,
 * and navigates to the home page.
 *
 * @component
 * @returns {JSX.Element} Login form interface
 */
function Login() {
  // Access global user state/context
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
  const navigate = useNavigate(); // Hook for programmatic routing

  /**
   * Handles the login form submission.
   * Sends credentials to API and processes JWT/favorites on success.
   *
   * @param {Event} e - Form submit event
   */
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
        setJwtToken(data.jwt); // Store token in context
        Cookies.set('jwt', data.jwt, {
          expires: 1,
          secure: false,
          sameSite: 'Strict',
          path: '/'
        }); // Save token in cookie

        setAuthenticated(true);
        setUsername(username);
        localStorage.setItem('username', username); // Persist username locally
        navigate('/home');

        setFavorites([]); // Reset old favorites
        await cacheFavorites(data.jwt, setLoadingFavorites, setFavorites, favorites); // Populate new
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

          <button type="submit" className="btn">Login</button>
        </form>

        {/* Display error or status message */}
        {message && <p className="error-message">{message}</p>}

        {/* Link to registration page */}
        <p className="redirect">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
