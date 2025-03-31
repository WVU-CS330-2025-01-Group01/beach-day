import React, { useState } from "react";
import "./Home.css";
import projectphoto from "./projectphoto.png"; // Adjusted path for direct src folder

function Home() {
  const [beach, setBeach] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
  
    if (!beach.trim()) {
      setError("Please enter a ZIP code.");
      return;
    }
  
    setError(""); // Clear error on valid search
  
    try {
      const response = await fetch("http://localhost:3010/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_type: "current_basic_weather", // Required request type
          zip_code: beach, // Zip code entered by the user
          country_code: "US", 
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
  
      const data = await response.json();
  
      if (data.temperature) {
        setWeather(`Temperature: ${data.temperature}°F at ${beach}`);
      } else {
        setError("No weather data available for this ZIP code.");
      }
    } catch (error) {
      setError("Error fetching weather data");
    }
  };
  

  return (
    <div className="home-container">
      <h1>Welcome to Beach Day!</h1>
      <p>Enter a beach's ZIP code to see the weather conditions.</p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter ZIP code..."
          value={beach}
          onChange={(e) => setBeach(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {weather && <p className="weather-info">{weather}</p>}
      <img src={projectphoto} alt="Beach drawing" className="beach-image" />
    </div>
  );
}

export default Home;
