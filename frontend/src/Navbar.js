import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import beachIcon from './beachIcon.png';
import Cookies from 'js-cookie';
import { FiSearch } from 'react-icons/fi';
import { API } from './api';

function Navbar({ onWeatherData }) {
  const {
    authenticated,
    setAuthenticated,
    username,
    globalError,
    setGlobalError,
    jwtToken,
    setUsingCurrentLocation,
    latitude,
    setLatitude,
    longitude,
    setLongitude
  } = useContext(UserContext);

  const [notificationCount, setNotificationCount] = useState(0);  // default to 0
  const [notifications, setNotifications] = useState("");
  const [searchType, setSearchType] = useState("county_state");
  const [county, setCounty] = useState("");
  const [state, setState] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch notification count when authenticated
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (authenticated && jwtToken) {
        try {
          const response = await fetch(API.COUNT_NOTIFICATIONS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ jwt: jwtToken }),
          });
          const data = await response.json();
          if (response.ok && data.message === 'Success.') {
            setNotificationCount(data.count);
          }
        } catch (err) {
          console.error('Error fetching notifications count:', err);
          setGlobalError("Failed to fetch notification count.");
        }
      }
    };

    fetchNotificationCount();
  }, [authenticated, jwtToken, setGlobalError]);

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
    if (loading) return;

    try {
      let searchResponse, searchData;
      setGlobalError("");

      if (searchType === "county_state") {
        if (!county.trim() || !state.trim()) {
          setGlobalError("Please enter both county and state.");
          return;
        }
        setLoading(true);
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
          setGlobalError("No beaches found for this county and state.");
          setLoading(false);
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
        setUsingCurrentLocation(false);
        setLoading(false);
        navigate("/home");

      } else if (searchType === "latlon") {
        const latNum = parseFloat(latitude);
        const lonNum = parseFloat(longitude);

        if (isNaN(latNum) || isNaN(lonNum)) {
          setGlobalError("Please enter valid numbers for latitude and longitude.");
          return;
        }

        if (latNum < 18.9 || latNum > 71.4 || lonNum < -179.15 || lonNum > -66.9) {
          setGlobalError("Coordinates must be within the U.S. including Alaska and Hawaii.");
          return;
        }
        setLoading(true);
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
          setGlobalError("No beaches found near this location.");
          setLoading(false);
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
        setUsingCurrentLocation(false);
        setLoading(false);
        navigate("/home");
      }
      else if (searchType === "current_location") {
        if (!navigator.geolocation) {
          setGlobalError("Geolocation is not supported.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setLatitude(position.coords.latitude.toFixed(6));
            setLongitude(position.coords.longitude.toFixed(6));
            setLoading(true);
            try {
              const response = await fetch(API.BEACHINFO, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  request_type: "search_beach_by_lat_lon",
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  start: 0,
                  stop: 5,
                }),
              });

              const data = await response.json();

              if (!data.order || data.order.length === 0) {
                setGlobalError("No beaches found near your location.");
                setLoading(false);
                return;
              }

              const multiBeachWeather = {
                searchType: "latlon",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                result: data.result,
                order: data.order,
              };

              onWeatherData(multiBeachWeather);
              setUsingCurrentLocation(true);
              navigate("/home");
              setLoading(false);
            } catch (err) {
              console.error(err);
              setGlobalError("Failed to fetch location-based data.");
              setLoading(false);
            }
          },
          (error) => {
            console.error(error);
            setGlobalError("Could not retrieve your location.");
            setLoading(false);
          }
        );
      }

    } catch (err) {
      console.error(err);
      setGlobalError("Error fetching beach data.");
      setLoading(false);
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
                  <option value="current_location">Use My Location</option>
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
                    <select
                      className="search-dropdown"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="">Select State</option>
                      {[
                        "AK","AL","AS","CA","CT","DE","FL","GA","GU","HI",
                        "IL","IN","LA","MA","MD","ME","MI","MN","MP","MS",
                        "NC","NH","NJ","NY","OH","OR","PA","PR","RI","SC",
                        "ST","TX","VA","VI","WA","WI"
                      ].map(abbr => (
                        <option key={abbr} value={abbr}>{abbr}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Latitude"
                      value={latitude}
                      onChange={e => setLatitude(e.target.value)}
                      readOnly={searchType === "current_location"}
                    />
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Longitude"
                      value={longitude}
                      onChange={e => setLongitude(e.target.value)}
                      readOnly={searchType === "current_location"}
                    />
                  </>
                )}
  
                <button type="submit" style={{ display: "none" }} />
                <button type="submit" className="search-icon-button" disabled={loading}>
                  {loading ? <div className="search-spinner" /> 
                           : <div className="search-icon"><FiSearch size={31} /></div>}
                </button>
              </div>
            </form>
          </div>
  
          {/* Links and Profile */}
          <div className="navbar-right">
            <div className="navbar-links">
              <Link to="/home" className="navbar-link">Home</Link>
  
              {authenticated && (
                <>
                  <Link to="/favorites" className="navbar-link">Favorites</Link>
                  <div className="profile-dropdown">
                    <span onClick={toggleDropdown} className="navbar-link">Profile</span>
  
                    {dropdownOpen && (
                      <div className="dropdown-box">
                        <div className="dropdown-header">
                          <div className="avatar">
                            {username ? username.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="dropdown-name">{username}</div>
                          </div>
                        </div>
  
                        <div className="dropdown-body">
                          <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                            Settings
                          </Link>
                        </div>
  
                        <div className="notifications-link">
                          <Link to="/notifications" onClick={() => setDropdownOpen(false)}>
                            Notifications
                          </Link>
                          <span className="notification-badge">
                            {notificationCount}
                          </span>
                        </div>
  
                        <button
                          onClick={handleLogout}
                          className="dropdown-logout"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
  
              <Link to="/about" className="navbar-link">About</Link>
              {!authenticated && <Link to="/login" className="navbar-link">Login</Link>}
            </div>
          </div>
        </div>
      </div>
  
      {globalError && (
        <div className="error-bar">
          <p>{globalError}</p>
          <button
            className="error-dismiss"
            onClick={() => setGlobalError("")}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
  
}

export default Navbar;
