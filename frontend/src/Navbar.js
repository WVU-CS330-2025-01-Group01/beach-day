import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import beachIcon from './beachIcon.png';
import Cookies from 'js-cookie';
import searchIcon from './search.png';
import { API } from './api';

function Navbar({ onWeatherData }) {
  const { authenticated, setAuthenticated } = useContext(UserContext);

  const [searchType, setSearchType] = useState("zipcode");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('cachedFavorites');
    localStorage.removeItem('lastUpdated');
    setAuthenticated(false);
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
  
      try {
        // Step 1: Get beach information (including weather) near lat/lon
        const searchResponse = await fetch(API.BEACHINFO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_type: "search_beach_by_lat_lon",
            latitude,
            longitude,
            start: 0,
            stop: 5, // Top 5 nearest beaches
          }),
        });
  
        const searchData = await searchResponse.json();
        if (!searchData.order || searchData.order.length === 0) {
          setError("No beaches found near this location.");
          return;
        }
  
        const beachIds = searchData.order;
  
        // Step 2: Get weather data from the same response (included in searchData.result)
        const multiBeachWeather = {
          searchType,
          latitude,
          longitude,
          result: searchData.result, // Already contains beach info and weather data
          order: beachIds,
        };
  
        onWeatherData(multiBeachWeather);
        navigate("/home");
  
      } catch (err) {
        console.error(err);
        setError("Error fetching beach data.");
      }
    }
  };
  
  
  return (
    <div className="navbar">
      <Link to="/home" className="navbar-home-link">
        <div className="navbar-content">
          <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
          <h1 className="navbar-title">Beach Day</h1>
        </div>
      </Link>

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
          <button type="submit" style={{ display: "none" }}></button>
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