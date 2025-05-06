import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { refreshWeatherData } from './utils';
import './Favorites.css';
import { API } from './api';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

/**
 * Favorites component displays a list of the user's saved favorite beaches.
 * Allows editing the list, including clearing or removing favorites.
 * Automatically refreshes weather data every 10 minutes.
 *
 * @component
 * @returns {JSX.Element} Rendered Favorites page
 */
function Favorites() {
  const {
    authenticated,
    loadingFavorites,
    setLoadingFavorites,
    jwtToken,
    favorites,
    setFavorites,
    setGlobalError
  } = useContext(UserContext);
  const [editing, setEditing] = useState(false); // Edit mode toggle

  // Ref to hold latest favorites list across intervals
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // On mount: load cached favorites and set up periodic refresh
  useEffect(() => {
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in ms

    if (cachedFavorites) {
      setFavorites(JSON.parse(cachedFavorites)); // Use cached data
      setLoadingFavorites(false);
    }

    // Auto-refresh weather data every 10 minutes
    const interval = setInterval(() => {
      refreshWeatherData(favoritesRef.current, setFavorites);
    }, tenMinutes);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [authenticated, jwtToken]);

  /**
   * Clears all favorite beaches from user account and local storage.
   */
  const clearFavorites = async () => {
    try {
      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken, type: 'clear' }),
      });

      const data = await response.json();

      if (data.message === 'Success.') {
        setFavorites([]); // Clear in UI
        localStorage.setItem('cachedFavorites', JSON.stringify([])); // Clear local cache
      } else {
        setGlobalError(data.message);
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      setGlobalError('Failed to clear favorites. Please try again later.');
    }
  };

  /**
   * Removes a single favorite beach from the list and server.
   * @param {string} beachId - ID of the beach to remove
   */
  const removeFavorite = async (beachId) => {
    try {
      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken, type: 'remove', favorite: beachId })
      });

      if (response.ok) {
        const newFavorites = favorites.filter(fav => fav.id !== beachId);
        setFavorites(newFavorites);
        localStorage.setItem('cachedFavorites', JSON.stringify(newFavorites));
      } else {
        console.error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setGlobalError('Failed to remove favorite. Please try again later.');
    }
  };

  return (
    <div className="favorites-container">
      <div className="favorites-box fade-in">
        {/* Toolbar with edit/clear buttons */}
        <div className="favorites-toolbar">
          <h2>Favorite Beaches</h2>
          <button
            onClick={() => { setEditing(!editing); }}
            className="edit-btn"
            title="Edit Favorites"
          >
            <span>Edit</span>
            <FiEdit size={20} />
          </button>
          {editing && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all favorite beaches?")) {
                  clearFavorites();
                }
              }}
              className="clear-btn"
              title="Clear favorites"
            >
              Clear Favorites
            </button>
          )}
        </div>

        {/* Favorites list */}
        <div className="favorites-list">
          {favorites.map((beach, index) => (
            <Link
              to="/beach-info"
              state={{
                beachId: beach.id,
                beach: {
                  beach_name: beach.name,
                  beach_state: beach.state,
                  beach_county: beach.county,
                  latitude: beach.latitude,
                  longitude: beach.longitude,
                  beach_access: beach.access,
                  beach_length: beach.length
                },
                weather: {
                  temperature: beach.temperature,
                  uvIndex: beach.uvIndex,
                  windSpeed: beach.windSpeed,
                  windDirection: beach.windDirection,
                  forecastSummary: beach.forecast,
                  relHumidity: beach.humidity,
                  probPrecip: beach.precip,
                  airQuality: beach.airQuality,
                  ecoli: beach.ecoli,
                  alerts: beach.alerts
                }
              }}
              className="favorite-item-link"
            >
              <div key={beach.id} className="favorite-item">
                <h3>{beach.name}</h3>
                <div className="location">
                  {beach.county ? `${beach.county}, ` : ''}{beach.state}
                </div>
                <div className="forecast">
                  {beach.forecast === null ? 'No forecast available' : beach.forecast}
                </div>

                {/* Key weather/access data */}
                <div className="info-container">
                  <div className="data-big">
                    Beach Access
                    <p>{beach.access === null ? 'Unavailable' : beach.access}</p>
                  </div>
                  <div className="data">
                    Temperature
                    <p>{beach.temperature === null ? 'Unavailable' : `${beach.temperature}°F`}</p>
                  </div>
                  <div className="data">
                    UV Index
                    <p>{beach.uvIndex === null ? 'Unavailable' : beach.uvIndex}</p>
                  </div>
                  <div className="data-big">
                    Wind Speed and Direction
                    <p>
                      {(beach.windSpeed === null && beach.windDirection === null)
                        ? 'Unavailable'
                        : beach.windSpeed + " " + beach.windDirection}
                    </p>
                  </div>
                </div>

                {/* Remove button shown in edit mode */}
                {editing && (
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation
                      e.stopPropagation(); // Stop bubbling to link
                      removeFavorite(beach.id);
                    }}
                    className="remove-btn"
                  >
                    <FiTrash2 size={20} />Remove
                  </button>
                )}
              </div>
            </Link>
          ))}

          {/* Skeleton loader if data is still loading */}
          {loadingFavorites && (
            <div className="favorite-item skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-subtitle" />
              <div className="skeleton skeleton-forecast" />
              <div className="info-container">
                <div className="skeleton skeleton-data-wide" />
                <div className="skeleton skeleton-data" />
                <div className="skeleton skeleton-data" />
                <div className="skeleton skeleton-data-wide" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
