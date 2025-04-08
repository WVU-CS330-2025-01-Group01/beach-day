import React from "react";
import "./Home.css";
import projectphoto from "./projectphoto.png";

function Home({ weather }) {
  return (
    <div className="home-container">
      <h1>Welcome to Beach Day!</h1>
      <p>Use the search bar above to check beach weather by ZIP code or coordinates</p>

      {weather && (
        <>
          <h2 className="weather-header">
            Weather Info for{" "}
            {weather.searchType === "zipcode"
              ? `Zip Code ${weather.zipCode}`
              : `Latitude/Longitude: ${weather.latitude}, ${weather.longitude}`}
          </h2>

          <div className="weather-info-container">
            <p className="weather-info">Temperature: {weather.temperature}</p>
            <p className="weather-info">Humidity: {weather.relHumidity}</p>
            <p className="weather-info">Wind Speed: {weather.windSpeed}</p>
            <p className="weather-info">Wind Direction: {weather.windDirection}</p>
            <p className="weather-info">Forecast: {weather.forecastSummary}</p>
            <p className="weather-info">Precipitation: {weather.probPrecip}</p>
          </div>
        </>
      )}

      <img src={projectphoto} alt="Beach drawing" className="beach-image" />
    </div>
  );
}

export default Home;
