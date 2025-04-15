import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; 

function Home({ weather }) {
  return (
    <div className="home-container">
      <h1>Welcome to Beach Day</h1>

      {weather ? (
        <div className="weather-box">
          <h2 className="weather-header">
            Weather Info for{" "}
            {weather.searchType === "zipcode" ? (
              <Link
                to="/beach-info"
                state={{ weather }}
                className="zipcode-link"
              >
                Zip Code {weather.zipCode}
              </Link>
            ) : (
              `Latitude/Longitude: ${weather.latitude}, ${weather.longitude}`
            )}
          </h2>

          <p>Temperature: {weather.temperature}</p>
          <p>Humidity: {weather.relHumidity}</p>
          <p>Wind Speed: {weather.windSpeed}</p>
          <p>Wind Direction: {weather.windDirection}</p>
          <p>Forecast: {weather.forecastSummary}</p>
          <p>Precipitation: {weather.probPrecip}</p>
        </div>
      ) : (
        <p>Search for a beach to see the weather!</p>
      )}
    </div>
  );
}

export default Home;
