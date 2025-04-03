import React, { useState } from "react";
import "./Home.css";
import projectphoto from "./projectphoto.png";

function Home() {
  const [searchType, setSearchType] = useState("zipcode");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    let requestBody;
    if (searchType === "zipcode") {
      if (!zipCode.trim()) {
        setError("Please enter a ZIP code.");
        return;
      }
      requestBody = {
        request_type: "current_basic_weather",
        zip_code: zipCode,
        country_code: "US",
      };
    } else {
      if (!latitude.trim() || !longitude.trim()) {
        setError("Please enter both latitude and longitude.");
        return;
      }
      requestBody = {
        request_type: "current_basic_weather",
        latitude: latitude,
        longitude: longitude,
      };
    }

    setError("");

    try {
      const response = await fetch("http://localhost:3010/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      if (data.temperature) {
        setWeather({
          temperature: `${data.temperature}°F`,
          probPrecip: data.probPrecip ? `${data.probPrecip}%` : "N/A",
          relHumidity: data.relHumidity ? `${data.relHumidity}%` : "N/A",
          windSpeed: data.windSpeed || "N/A",
          windDirection: data.windDirection || "N/A",
          forecastSummary: data.forecastSummary || "No summary available",
        });
      } else {
        setError("No weather data available for this location.");
      }
    } catch (error) {
      setError("Error fetching weather data");
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Beach Day!</h1>
      <p>Search for beach weather by ZIP code or latitude/longitude.</p>
      <form onSubmit={handleSearch} className="search-form">
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="zipcode">ZIP Code</option>
          <option value="latlon">Lat/Long</option>
        </select>

        {searchType === "zipcode" ? (
          <input
            type="text"
            placeholder="Enter ZIP code..."
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <input
              type="text"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </>
        )}

        <button type="submit">Search</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <h2 className="weather-header">
            Weather Info for{" "}
            {searchType === "zipcode" ? `Zip Code ${zipCode}` : `Latitude/Longitude: ${latitude}, ${longitude}`}
          </h2>

      {weather && (
        <div className="weather-info-container">
        <p className="weather-info">Temperature: {weather.temperature}</p>
        <p className="weather-info">Humidity: {weather.relHumidity}</p>
        <p className="weather-info">Wind Speed: {weather.windSpeed} </p>
        <p className="weather-info">Wind Direction: {weather.windDirection}</p>
        <p className="weather-info">Forecast: {weather.forecastSummary}</p>
        <p className="weather-info">Precipitation: {weather.probPrecip}</p>
      </div>
      
      )}

      <img src={projectphoto} alt="Beach drawing" className="beach-image" />
    </div>
  );
}

export default Home;
