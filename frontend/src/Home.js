import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home({ weather }) {
  return (
    <div className="home-container">
      <h1>Welcome to Beach Day</h1>

      {weather ? (
        <>
          <h2 className="weather-header">
            {weather.searchType === "zipcode" && (
              <Link to="/beach-info" state={{ weather }} className="zipcode-link">
                Zip Code {weather.zipCode}
              </Link>
            )}

            {weather.searchType === "latlon" && (
              <>Beaches near: {weather.latitude}, {weather.longitude}</>
            )}

            {weather.searchType === "county_state" && (
              <>Beaches in {weather.county} County, {weather.state}</>
            )}
          </h2>

          {weather.result ? (
            // Loop through the beaches and display their weather information
            weather.order.map((beachId) => {
              const beach = weather.result[beachId];
              const w = beach.weather; // Access weather data for each beach
              return (
                <div key={beachId} className="weather-box">
                  <h3>{beach.beach_name}, {beach.beach_county}</h3>
                  <p>Temperature: {w.temperature}°F</p>
                  <p>Humidity: {w.relHumidity || "N/A"}%</p>
                  <p>Wind Speed: {w.windSpeed || "N/A"}</p>
                  <p>Wind Direction: {w.windDirection || "N/A"}</p>
                  <p>Forecast: {w.forecastSummary || "No summary available"}</p>
                  <p>Precipitation: {w.probPrecip || "N/A"}%</p>
                  <p>UV Index: {w.uvIndex || "N/A"}</p>
                  <p>Air Quality: {w.airQuality || "N/A"}</p>
                  <p>E. Coli Level: {w.ecoli || "N/A"}</p>
                  <p>Alerts: {w.alerts && w.alerts.length > 0 ? w.alerts.join(", ") : "None"}</p>
                </div>

              );
            })
          ) : (
            <div className="weather-box">
              <p>No weather data available.</p>
            </div>
          )}
        </>
      ) : (
        <p>Search for a beach to see the weather!</p>
      )}
    </div>
  );
}

export default Home;
