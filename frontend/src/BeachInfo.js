import React, { useState } from "react";
import "./BeachInfo.css";
import projectphoto from "./projectphoto.png"; // Adjusted path for direct src folder

function BeachInfo() {
  const [beach, setBeach] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!beach.trim()) {
      setError("Please enter a beach name.");
      return;
    }

    setError(""); // Clear error on valid search
    setWeather(`Sunny, 75°F at ${beach}`); // Mock weather data for now
  };

  return (
    <div className="beach-info-container">
      <h1>Welcome to Beach Day!</h1>
      <p>Search for a beach to see the weather conditions.</p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter beach name..."
          value={beach}
          onChange={(e) => setBeach(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {weather && <p className="weather-info">{weather}</p>}
      <img
        src={projectphoto}
        alt="Beach drawing"
        className="beach-image"
      />
    </div>
  );
}

export default BeachInfo;
