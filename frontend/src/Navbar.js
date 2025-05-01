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

  const [searchType, setSearchType] = useState("county_state");
  const [county, setCounty] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt');
    localStorage.removeItem('cachedFavorites');
    localStorage.removeItem('lastUpdated');
    localStorage.removeItem('username');
    setAuthenticated(false);
    navigate("/login");
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    try {
      let searchResponse, searchData;

      if (searchType === "county_state") {
        if (!county.trim() || !state.trim()) {
          setError("Please enter both county and state.");
          return;
        }

        searchResponse = await fetch(API.BEACHINFO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_type: "search_beach_by_county_state",
            county,
            state,
            start: 0,
            stop: 5,
          }),
        });

        searchData = await searchResponse.json();

        if (!searchData.order || searchData.order.length === 0) {
          setError("No beaches found for this county and state.");
          return;
        }

        const multiBeachWeather = {
          searchType,
          county,
          state,
          result: searchData.result,
          order: searchData.order,
        };

        onWeatherData(multiBeachWeather);
        navigate("/home");

      } else if (searchType === "latlon") {
        if (!latitude.trim() || !longitude.trim()) {
          setError("Please enter both latitude and longitude.");
          return;
        }

        searchResponse = await fetch(API.BEACHINFO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_type: "search_beach_by_lat_lon",
            latitude,
            longitude,
            start: 0,
            stop: 5,
          }),
        });

        searchData = await searchResponse.json();

        if (!searchData.order || searchData.order.length === 0) {
          setError("No beaches found near this location.");
          return;
        }

        const multiBeachWeather = {
          searchType,
          latitude,
          longitude,
          result: searchData.result,
          order: searchData.order,
        };

        onWeatherData(multiBeachWeather);
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching beach data.");
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
              <img src={beachIcon} alt="Beach Day Icon" className="navbar-icon" />
              <h1 className="navbar-title">Beach Day</h1>
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
                  <option value="county_state">County/State</option>
                  <option value="latlon">Coordinates</option>
                </select>

                {searchType === "county_state" ? (
                  <>
                    <input
                      className="search-input"
                      type="text"
                      placeholder="County"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                    />
                    <input
                      className="search-input"
                      type="text"
                      placeholder="State Abbr."
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      maxLength={2}
                    />
                  </>
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

          {/* Links and Profile — unchanged */}
          {/* ... */}

        </div>
      </div>
      {error && (
        <div className="error-bar">
          <div className="error-bar-inner">
            {error}
            <button className="error-dismiss" onClick={() => setError("")}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
