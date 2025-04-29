import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import beachIcon from './beachIcon.png';
import Cookies from 'js-cookie';
import searchIcon from './search.png';
import { API } from './api';

function Navbar({ onWeatherData }) {
  const {
    authenticated,
    setAuthenticated,
    username
  } = useContext(UserContext);

  const [searchType, setSearchType] = useState("zipcode");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('cachedFavorites');
    localStorage.removeItem('lastUpdated');
    setAuthenticated(false);
    navigate("/login"); // after logout, go to login page
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault(); // Important: allow calling manually without needing a form submit event

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
    } else if (searchType === "latlon") {
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
      const response = await fetch(API.BEACHINFO, {
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
          uvIndex: data.uvIndex || "N/A",
          searchType,
          zipCode,
          latitude,
          longitude
        };
        onWeatherData(weatherData);
        navigate("/home");
      } else {
        setError("No weather data available for this location.");
      }
    } catch (error) {
      setError("Error fetching weather data");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-container">

          {/* Logo */}
          <div className="navbar-left">
            <Link to="/home" className="navbar-home-link">
              <div className="navbar-content">
                <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
                <h1 className="navbar-title">Beach Day</h1>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="navbar-center">
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
                    placeholder="Enter ZIP code"
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
                <button type="submit" style={{ display: "none" }}></button>
                <img src={searchIcon} alt="Search" className="search-icon" />
              </div>
            </form>
          </div>



          {/* Links */}
          <div className="navbar-right">
            <div className="navbar-links">
              <Link to="/home">Home</Link>

              {/* Only show Favorites and Settings if authenticated */}
              {authenticated && (
                <>
                  <Link to="/favorites">Favorites</Link>
                  <div className="profile-dropdown">
                    <span onClick={toggleDropdown} className="profile-link">
                      Profile
                    </span>

                    {dropdownOpen && (
                      <div className="dropdown-box">
                        <div className="dropdown-header">
                          <div className="avatar">
                            {username ? username.charAt(0).toUpperCase() : "?"}
                          </div> {/* Optional: Just first letter of name */}
                          <div>
                            <div className="dropdown-name">
                              {username}
                            </div>
                          </div>
                        </div>

                        <div className="dropdown-body">
                          <Link to="/settings" onClick={() => setDropdownOpen(false)}>Settings</Link>
                        </div>
                        <button onClick={handleLogout} className="dropdown-logout">Logout</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Show About always */}
              <Link to="/about">About</Link>

              {/* Login or Logout */}
              {!authenticated && (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="error-bar">
          {error}
        </div>
      )}
    </>
  );
}

export default Navbar;
