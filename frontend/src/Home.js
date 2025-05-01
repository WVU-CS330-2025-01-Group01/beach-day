import React, { useState, useEffect, useContext } from "react";
import { UserContext } from './UserContext';
import { Link, useLocation } from "react-router-dom";
import "./Home.css";
import { API } from "./api";

function Home({ weather: propWeather }) {
  const location = useLocation();
  const { username } = useContext(UserContext);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  // Combine weather from props and location.state
  useEffect(() => {
    if (propWeather) {
      setWeather(propWeather);
    } else if (location.state && location.state.weather) {
      setWeather(location.state.weather);
    }
  }, [propWeather, location.state]);

  return (
    <div className="home-container">
      {!weather && (
        <h1 className="home-header">
          {username ? `Welcome back, ${username}!` : 'Plan your next Beach Day'}
        </h1>
      )}
      {error && <p className="error-message">{error}</p>}

      <div className="beach-list-container fade-in">
        {weather ? (
          <>
            <h2 className="weather-results-header">Search Results</h2>
            <p className="weather-subtext">
              {weather.searchType === "latlon" && `Closest to: ${weather.latitude}°, ${weather.longitude}°`}
              {weather.searchType === "county_state" && `Near ${weather.county} County, ${weather.state}`}
            </p>

            {weather.result ? (
              weather.order.map((beachId) => {
                const beach = weather.result[beachId];
                const w = beach.weather;
                return (
                  <div key={beachId} className="beach-box fade-in">
                    <Link
                      to="/beach-info"
                      state={{ beachId, beach, weather: w }}
                      className="beach-card"
                    >
                      <div className="beach-title">{beach.beach_name}</div>
                      <div className="beach-location">
                        {beach.beach_county ? `${beach.beach_county}, ` : ''}{beach.beach_state}
                      </div>
                      <div className="beach-access">
                        Beach Access: {beach.beach_access || "Unavailable"}
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <h2>No beaches found</h2>
            )}
          </>
        ) : "🌴 Start your search using the bar above to discover nearby beaches!"}
      </div>
    </div>
  );
}

export default Home;
