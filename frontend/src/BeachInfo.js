import React from "react";
import "./BeachInfo.css";
import { useLocation, useNavigate } from "react-router-dom";

function BeachInfo() {
  const location = useLocation();
  const weather = location.state?.weather;
  const navigate = useNavigate();

  if (!weather) {
    return (
      <div className="beach-info-container">
        <h2>No weather data provided</h2>
        <button onClick={() => navigate("/home")}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="beach-info-container">
      <h2>
        Weather Info for{" "}
        {weather.searchType === "zipcode"
          ? `Zip Code ${weather.zipCode}`
          : `Latitude/Longitude: ${weather.latitude}, ${weather.longitude}`}
      </h2>

      <div className="beach-weather-info">
        <p>Temperature: {weather.temperature}</p>
        <p>Humidity: {weather.relHumidity}</p>
        <p>Wind Speed: {weather.windSpeed}</p>
        <p>Wind Direction: {weather.windDirection}</p>
        <p>Forecast: {weather.forecastSummary}</p>
        <p>Precipitation: {weather.probPrecip}</p>
        <p>UV Index: {weather.uvIndex}</p>
      </div>
    </div>
  );
}

export default BeachInfo;
