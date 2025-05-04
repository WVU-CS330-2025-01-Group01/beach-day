import React, { useState, useEffect, useContext } from "react";
import { UserContext } from './UserContext';
import { Link, useLocation } from "react-router-dom";
import "./Home.css";

/**
 * Home component displays a welcome message and search results.
 * It receives weather data either via props or router state and shows
 * a list of nearby beaches with links to detailed beach info.
 *
 * @component
 * @param {object} props
 * @param {object} props.weather - Optional weather data passed from parent
 * @returns {JSX.Element}
 */
function Home({ weather: propWeather = {} }) {
  const location = useLocation();
  const {
    username,
    usingCurrentLocation,
    latitude,
    longitude
  } = useContext(UserContext);

  const [weather, setWeather] = useState(null);

  // Load weather data from props or routing state
  useEffect(() => {
    if (propWeather && Object.keys(propWeather).length > 0) {
      setWeather(propWeather); // Use prop if available
    } else if (
      location.state &&
      location.state.weather &&
      Object.keys(location.state.weather).length > 0
    ) {
      setWeather(location.state.weather); // Use router state if available
    } else {
      setWeather(null); // Clear if no weather info
    }
  }, [propWeather, location.state]);

  /**
   * Calculates the distance in miles between two coordinate points
   * using the Haversine formula.
   *
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in miles, rounded to 1 decimal place
   */
  function getDistanceInMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles
    const toRad = angle => angle * (Math.PI / 180); // Convert degrees to radians

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal
  }

  return (
    <div className="home-container">
      {/* Show welcome message if no weather data */}
      {!weather ? (
        <h1 className="home-header">
          {username ? `Welcome back, ${username}!` : 'Plan your next Beach Day'}
        </h1>
      ) : null}

      <div className="beach-list-container fade-in">
        {weather ? (
          <>
            <h2 className="weather-results-header">Search Results</h2>

            {/* Location context for search results */}
            <p className="weather-subtext">
              {weather.searchType === "latlon" &&
                `Closest to: ${weather.latitude}°, ${weather.longitude}°`}
              {weather.searchType === "county_state" &&
                `Near ${weather.county} County, ${weather.state}`}
            </p>

            {/* List of matching beaches */}
            {weather.result && weather.order.length > 0 ? (
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
                        {beach.beach_county ? `${beach.beach_county}, ` : ""}
                        {beach.beach_state}
                        {usingCurrentLocation &&
                          ` (~${getDistanceInMiles(
                            beach.latitude,
                            beach.longitude,
                            latitude,
                            longitude
                          )} mi) `}
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
        ) : (
          <p className="home-prompt">
            🌴 Start your search using the bar above to discover nearby beaches!
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;
