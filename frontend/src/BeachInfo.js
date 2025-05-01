import React, { useContext, useState } from "react";
import "./BeachInfo.css";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { API } from './api';
import { fetchBeachInfoWithWeather } from './utils';

function BeachInfo() {
  const location = useLocation();
  const { beachId, beach, weather } = location.state || {};
  const navigate = useNavigate();

  const { jwtToken, favorites, setFavorites } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const addFavorite = async () => {
    if (!beachId) {
      setError("Missing beach ID.");
      return;
    }

    if (favorites.some(fav => fav.id === beachId)) {
      setError("This beach is already in your favorites.");
      return;
    }

    try {
      setAdding(true);
      const beachInfo = await fetchBeachInfoWithWeather(beachId);

      if (beachInfo.name === null) {
        setError("Invalid Beach ID.");
        return;
      }

      const response = await fetch(API.UPDATE_FAVORITES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, type: "add", favorite: beachId })
      });

      const data = await response.json();

      if (data.message !== "Success.") {
        setError(data.message || "Failed to add beach to favorites.");
        return;
      }

      const newFavorite = { id: beachId, ...beachInfo };
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem("cachedFavorites", JSON.stringify(updatedFavorites));
      setError(null);
    } catch (err) {
      console.error("Add favorite error:", err);
      setError("Could not add favorite. Try again later.");
    } finally {
      setAdding(false);
    }
  };

  if (!beach || !weather) {
    return (
      <div className="beach-info-container">
        <h2>No beach data or weather information available</h2>
        <button onClick={() => navigate("/home")}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="beach-info-container">
      <h2>{beach.beach_name} Weather Info</h2>

      <div className="beach-info">
        <h3>Location: {beach.beach_county}, {beach.beach_state}</h3>
        <p>Latitude: {beach.latitude}</p>
        <p>Longitude: {beach.longitude}</p>
        <p>Beach Access: {beach.beach_access || "Unavailable"}</p>
        <p>Beach Length: {beach.beach_length || "Unavailable"} miles</p>
        <div>-------------------------------------------</div>
        <h3>Weather Information:</h3>
        <p>Temperature: {weather.temperature}°F</p>
        <p>Humidity: {weather.relHumidity}%</p>
        <p>Wind Speed: {weather.windSpeed}</p>
        <p>Wind Direction: {weather.windDirection}</p>
        <p>Forecast: {weather.forecastSummary}</p>
        <p>Precipitation: {weather.probPrecip}%</p>
        <p>UV Index: {weather.uvIndex}</p>
        <p>Air Quality: {weather.airQuality}</p>
        <p>E. Coli Level: {weather.ecoli || "Unavailable"}</p>
        <p>Alerts: {weather.alerts?.length > 0 ? weather.alerts.join(", ") : "None"}</p>
        <div>-------------------------------------------</div>
        <h3>Beach ID:</h3>
        <p>{beachId}</p>

        <button disabled={adding} onClick={addFavorite}>
          {adding ? "Adding..." : "Add to Favorites"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <button onClick={() => navigate("/home")}>Go Back</button>
    </div>
  );
}

export default BeachInfo;
