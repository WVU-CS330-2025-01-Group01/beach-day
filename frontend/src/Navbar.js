// Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import beachIcon from './beachIcon.png';
import Cookies from 'js-cookie';
import searchIcon from './search.png';

function Navbar({ authenticated, setAuthenticated, onWeatherData }) {
  const [searchType, setSearchType] = useState("zipcode");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('cachedFavorites');
    setAuthenticated(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    let requestBody;
    if (searchType === "zipcode") {
      if (!zipCode.trim()) {
        setError("Please enter a ZIP code.");
        return;
      }
      requestBody = {
        request_type: "current_basic_weather",
        zip_code: zipCode,
        country_code: "US",
      };
    } else {
      if (!latitude.trim() || !longitude.trim()) {
        setError("Please enter both latitude and longitude.");
        return;
      }
      requestBody = {
        request_type: "current_basic_weather",
        latitude: latitude,
        longitude: longitude,
      };
    }

    setError("");

    try {
      const response = await fetch("http://localhost:3010/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      if (data.temperature) {
        const weatherData = {
          temperature: `${data.temperature}°F`,
          probPrecip: data.probPrecip ? `${data.probPrecip}%` : "N/A",
          relHumidity: data.relHumidity ? `${data.relHumidity}%` : "N/A",
          windSpeed: data.windSpeed || "N/A",
          windDirection: data.windDirection || "N/A",
          forecastSummary: data.forecastSummary || "No summary available",
          searchType,
          zipCode,
          latitude,
          longitude
        };
        onWeatherData(weatherData);
      } else {
        setError("No weather data available for this location.");
      }
    } catch (error) {
      setError("Error fetching weather data");
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
        <h1 className="navbar-title">Beach Day</h1>
      </div>
        <form onSubmit={handleSearch} className="custom-search-form">
          <div className="search-box">
            <select
              className="search-dropdown"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="zipcode">ZIP Code</option>
              <option value="latlon">Coordinates</option>
            </select>

          {searchType === "zipcode" ? (
            <input
              className="search-input"
              type="text"
              placeholder="Enter ZIP code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          ) : (
            <>
              <input
                className="search-input"
                type="text"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <input
                className="search-input"
                type="text"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </>
          )}
          <img src={searchIcon} alt="Search" className="search-icon" />
          </div>
        </form>

      {error && <p className="error-message">{error}</p>}

      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/settings">Settings</Link>
        {authenticated ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;