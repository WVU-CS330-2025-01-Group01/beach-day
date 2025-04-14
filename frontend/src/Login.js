import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import Cookies from 'js-cookie';  // Import js-cookie
import { API } from './api';

const fetchBeachInfoWithWeather = async (beachId) => {
  try {
    const response = await fetch(API.BEACHINFO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
    });

    const result = await response.json();  // Capture the response JSON

    // Check if the response has the expected structure
    if (result.code === "dummy_get_beach_info_weather_by_id") {
      // Destructure the necessary properties
      const { beach_name, beach_county, beach_state, weather } = result;

      // If weather data exists, return the necessary values; otherwise, fallback to 'N/A'
      return {
        name: beach_name || 'Unknown Beach',
        county: beach_county || 'Unknown County',
        state: beach_state || 'Unknown State',
        temperature: weather?.temperature || 'N/A',
        forecast: weather?.forecastSummary || 'No forecast available',
      };
    } else {
      throw new Error('Failed to fetch beach info with weather');
    }
  } catch (error) {
    console.error('Error fetching beach info and weather:', error);
    // Fallback values for missing data
    return {
      name: 'Unknown',
      county: 'Unknown',
      state: 'Unknown',
      temperature: 'N/A',
      forecast: 'N/A',
    };
  }
};

function Login({ setAuthenticated }) {
  const [username, setUsername] = useState('');
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
        // Store JWT token in a cookie with a 1-day expiration
        Cookies.set('jwt', data.jwt, { expires: 1, secure: false, sameSite: 'Strict', path: '/' });

        // Set the authenticated state to true
        setAuthenticated(true);

        // Navigate to the home page
        navigate('/home');

        // Fetch and cache favorites
				const favoritesResponse = await fetch(API.FAVORITES, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ jwt: data.jwt }),
				});
        
        const favoritesData = await favoritesResponse.json();

				const beachData = await Promise.all(
					(Array.isArray(favoritesData.favorites) ? favoritesData.favorites : []).map(
						async (id) => {
							const info = await fetchBeachInfoWithWeather(id);
							return { id, ...info };
						}
					)
				);

        localStorage.setItem('cachedFavorites', JSON.stringify(beachData));
				localStorage.setItem('lastUpdated', Date.now());

      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred. Please try again later.');
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

