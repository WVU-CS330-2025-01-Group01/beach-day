import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Home.css";
import { API } from "./api";

function Home({ weather: propWeather }) {
  const location = useLocation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Combine weather from props and location.state
  useEffect(() => {
    if (propWeather) {
      setWeather(propWeather);
    } else if (location.state && location.state.weather) {
      setWeather(location.state.weather);
    }
  }, [propWeather, location.state]);

  const handleCurrentWeather = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          setLoading(true);
          const response = await fetch(API.BEACHINFO, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              request_type: "search_beach_by_lat_lon",
              latitude: lat,
              longitude: lon,
              start: 0,
              stop: 1,
            }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Error fetching weather.");
          setWeather(data);
          setError("");
        } catch (error) {
          console.error(error);
          alert("Error fetching weather data.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <div className="home-container">
      <h1>Welcome to Beach Day</h1>

      <button onClick={handleCurrentWeather} className="location-button">
        Current Weather
      </button>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Fetching weather for your location...</p>}

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
            weather.order.map((beachId) => {
              const beach = weather.result[beachId];
              const w = beach.weather;
              return (
                <div key={beachId} className="weather-box">
                  <h3>
                    <Link
                      to="/beach-info"
                      state={{ beachId, beach, weather: w }}
                      className="beach-link"
                    >
                      {beach.beach_name}, {beach.beach_county}
                    </Link>
                  </h3>
                  <p>Temperature: {w.temperature}°F</p>
                  <p>Humidity: {w.relHumidity || "N/A"}%</p>
                  <p>Wind Speed: {w.windSpeed || "N/A"}</p>
                  <p>Wind Direction: {w.windDirection || "N/A"}</p>
                  <p>Forecast: {w.forecastSummary || "N/A"}</p>
                  <p>Precipitation: {w.probPrecip || "N/A"}%</p>
                  <p>UV Index: {w.uvIndex || "N/A"}</p>
                  <p>Air Quality: {w.airQuality || "N/A"}</p>
                  <p>E. Coli Level: {w.ecoli || "N/A"}</p>
                  <p>Latitude: {beach.latitude || "N/A"}</p>
                  <p>Longitude: {beach.longitude || "N/A"}</p>
                  <p>Beach Access: {beach.beach_access || "N/A"}</p>
                  <p>Beach Length: {beach.beach_length || "N/A"} miles</p>
                  <p>Beach State: {beach.beach_state || "N/A"}</p>
                  <p>Beach ID: {beachId}</p>
                  <p>Alerts: {w.alerts?.length ? w.alerts.join(", ") : "None"}</p>
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
        !loading && <p>Search for a beach to see the weather!</p>
      )}
    </div>
  );
}

export default Home;
