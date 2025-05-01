import React, { useContext, useState } from "react";
import "./BeachInfo.css";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { API } from './api';
import { fetchBeachInfoWithWeather } from './utils';

function BeachInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    jwtToken, 
    favorites, 
    setFavorites,
    setGlobalError 
  } = useContext(UserContext);

  const { beachId, beach, weather } = location.state || {};
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const addFavorite = async () => {
    if (!beachId) {
      setGlobalError("Missing beach ID.");
      return;
    }

    if (favorites.some(fav => fav.id === beachId)) {
      setGlobalError("This beach is already in your favorites.");
      return;
    }

    try {
      setAdding(true);
      const beachInfo = await fetchBeachInfoWithWeather(beachId);

      if (beachInfo.name === null) {
        setGlobalError("Invalid Beach ID.");
        return;
      }

      const response = await fetch(API.UPDATE_FAVORITES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: jwtToken, type: "add", favorite: beachId })
      });

      const data = await response.json();

      if (data.message !== "Success.") {
        setGlobalError(data.message || "Failed to add beach to favorites.");
        return;
      }

      const newFavorite = { id: beachId, ...beachInfo };
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem("cachedFavorites", JSON.stringify(updatedFavorites));
      setError(null);
    } catch (err) {
      console.error("Add favorite error:", err);
      setGlobalError("Could not add favorite. Try again later.");
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
  <h2>{beach.beach_name}</h2>

  <div className="beach-info-cards">
    {/* Beach Info Card */}
    <div className="info-card">
      <div className="card-header">
        <h3>Beach Info</h3>
        <button className="favorite-button" onClick={addFavorite} disabled={adding}>
          {adding ? "Adding..." : "Add to Favorites"}
        </button>
      </div>
      <p><strong>Location:</strong> {beach.beach_county}, {beach.beach_state}</p>
      <p><strong>Latitude:</strong> {beach.latitude}</p>
      <p><strong>Longitude:</strong> {beach.longitude}</p>
      <p><strong>Beach Access:</strong> {beach.beach_access || "Unavailable"}</p>
      <p><strong>Length:</strong> {beach.beach_length || "Unavailable"} miles</p>
    </div>

    {/* Weather Info Card */}
    <div className="info-card">
      <div className="card-header">
        <h3>Weather Info</h3>
      </div>
      <p><strong>Temperature:</strong> {weather.temperature}°F</p>
      <p><strong>Humidity:</strong> {weather.relHumidity}%</p>
      <p><strong>Wind:</strong> {weather.windSpeed} {weather.windDirection}</p>
      <p><strong>Forecast:</strong> {weather.forecastSummary}</p>
      <p><strong>Precipitation:</strong> {weather.probPrecip}%</p>
      <p><strong>UV Index:</strong> {weather.uvIndex}</p>
      <p><strong>Air Quality:</strong> {weather.airQuality}</p>
      <p><strong>E. Coli:</strong> {weather.ecoli || "Unavailable"}</p>
      <p><strong>Alerts:</strong> {weather.alerts?.length > 0 ? weather.alerts.join(", ") : "None"}</p>
    </div>
  </div>

  {error && <p style={{ color: "red" }}>{error}</p>}

  <button className="go-back-button" onClick={() => navigate("/home")}>
    ← Go Back
  </button>
</div>
  );
}

export default BeachInfo;
