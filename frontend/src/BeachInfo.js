import React, { useContext, useState } from "react";
import "./BeachInfo.css";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { API } from './api';
import { fetchBeachInfoWithWeather } from './utils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * BeachInfo component displays detailed information about a selected beach,
 * including both static beach details and dynamic weather data.
 * Allows authenticated users to add the beach to their favorites list.
 *
 * @component
 * @returns {JSX.Element} A page showing beach and weather info with an "Add to Favorites" option
 */
function BeachInfo() {
  const location = useLocation(); // Get passed state from previous navigation
  const navigate = useNavigate();

  // Pull global user state and setters from context
  const {
    jwtToken,
    favorites,
    setFavorites,
    setGlobalError
  } = useContext(UserContext);

  // Get beach info and weather from router state
  const { beachId, beach, weather } = location.state || {};
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles adding the current beach to user's favorites.
   * Performs validation, API call, and updates local/remote state.
   */
  const addFavorite = async () => {
    if (!beachId) {
      setGlobalError("Missing beach ID.");
      return;
    }

    // Prevent duplicate favorites
    if (favorites.some(fav => fav.id === beachId)) {
      setGlobalError("This beach is already in your favorites.");
      return;
    }

    try {
      setAdding(true); // Show "Adding..." while processing

      const beachInfo = await fetchBeachInfoWithWeather(beachId);

      if (beachInfo.name === null) {
        setGlobalError("Invalid Beach ID.");
        return;
      }

      // POST request to add beach to user's favorites
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

      // Update global state and local cache
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

  const addEvent = async () => {
    if (!eventTitle) {
      setGlobalError("Event title is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API.ADD_EVENT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: jwtToken,
          title: eventTitle,
          beach_id: beachId,
          time: eventTime.toISOString().slice(0, 19).replace("T", " ")
        })
      });

      const data = await response.json();

      if (data.message !== "Success.") {
        setGlobalError(data.message || "Failed to add event.");
      } else {
        setShowModal(false);
        setEventTitle("");
        setGlobalError(null);
      }
    } catch (err) {
      setGlobalError("Failed to add event. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Fallback for missing beach/weather data
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
      <div className="beach-info-toolbar">
        <h2>{beach.beach_name}</h2>
        <div className="beach-info-buttons">
          <button className="favorite-button" onClick={addFavorite} disabled={adding}>
            {adding ? "Adding..." : "Add to Favorites"}
          </button>
          <button className="event-button" onClick={() => setShowModal(true)}>
            Create Event
          </button>
        </div>
      </div>

      <div className="beach-info-cards">
        {/* Beach Info Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>Beach Info</h3>
          </div>

          <p><strong>Location:</strong> {beach.beach_county ? `${beach.beach_county}, ` : ''}{beach.beach_state}</p>

          {/* Conditionally show latitude if valid */}
          {beach.latitude?.toString().trim() && (
            <p><strong>Latitude:</strong> {parseFloat(beach.latitude).toFixed(6)}</p>
          )}

          {/* Conditionally show longitude if valid */}
          {beach.longitude?.toString().trim() && (
            <p><strong>Longitude:</strong> {parseFloat(beach.longitude).toFixed(6)}</p>
          )}

          <p><strong>Beach Access:</strong> {beach.beach_access || "Unavailable"}</p>

          {/* Conditionally show beach length if valid */}
          {beach.beach_length?.toString().trim() && (
            <p><strong>Length:</strong> {`${parseFloat(beach.beach_length).toFixed(3)} mi`}</p>
          )}
        </div>

        {/* Weather Info Card */}
        <div className="info-card">
          <div className="card-header">
            <h3>Weather Info</h3>
          </div>

          {weather.temperature?.toString().trim() && (
            <p><strong>Temperature:</strong> {weather.temperature}°F</p>
          )}
          {weather.relHumidity?.toString().trim() && (
            <p><strong>Humidity:</strong> {weather.relHumidity}%</p>
          )}
          {(weather.windSpeed?.toString().trim() || weather.windDirection?.toString().trim()) && (
            <p><strong>Wind:</strong> {weather.windSpeed || "?"} {weather.windDirection || ""}</p>
          )}
          {weather.forecastSummary?.trim() && (
            <p><strong>Forecast:</strong> {weather.forecastSummary}</p>
          )}
          {weather.probPrecip?.toString().trim() && (
            <p><strong>Precipitation:</strong> {weather.probPrecip}%</p>
          )}
          {weather.uvIndex?.toString().trim() && (
            <p><strong>UV Index:</strong> {weather.uvIndex}</p>
          )}
          {weather.airQuality?.toString().trim() && (
            <p><strong>Air Quality:</strong> {weather.airQuality}</p>
          )}
          {weather.ecoli?.toString().trim() && (
            <p><strong>E. Coli:</strong> {weather.ecoli}</p>
          )}
          {Array.isArray(weather.alerts) && weather.alerts.length > 0 && (
            <p><strong>Alerts:</strong> {weather.alerts.join(", ")}</p>
          )}
        </div>
      </div>

      {/* Local error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Back navigation */}
      <button className="go-back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Event</h3>
            <label>Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event title"
            />

            <label>Time</label>
            <DatePicker
              selected={eventTime}
              onChange={(date) => setEventTime(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm:ss"
            />

            <div className="modal-buttons">
              <button onClick={addEvent} disabled={submitting}>
                {submitting ? "Creating..." : "Add Event"}
              </button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      )}

    </div>

  );
}

export default BeachInfo;
