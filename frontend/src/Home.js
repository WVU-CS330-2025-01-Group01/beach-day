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
                  <h3>
                    <Link
                      to="/beach-info"
                      state={{ beachId, beach, weather: w }} // Pass beach and weather data to the BeachInfo page
                      className="beach-link"
                    >
                      {beach.beach_name}, {beach.beach_county}
                    </Link>
                  </h3>
                  <p>Temperature: {w.temperature}°F</p>
                  <p>Humidity: {w.relHumidity || null}%</p>
                  <p>Wind Speed: {w.windSpeed || null}</p>
                  <p>Wind Direction: {w.windDirection || null}</p>
                  <p>Forecast: {w.forecastSummary || null}</p>
                  <p>Precipitation: {w.probPrecip || null}%</p>
                  <p>UV Index: {w.uvIndex || null}</p>
                  <p>Air Quality: {w.airQuality || null}</p>
                  <p>E. Coli Level: {w.ecoli || null}</p>
                  <p>Latitude: {beach.latitude || null}</p>
                  <p>Longitude: {beach.longitude || null}</p>
                  <p>Beach Access: {beach.beach_access || null}</p>
                  <p>Beach Length: {beach.beach_length || null} miles</p>
                  <p>Beach County: {beach.beach_county || null}</p>
                  <p>Beach State: {beach.beach_state || null}</p>
                  <p>Beach ID: {beachId || null}</p>
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
