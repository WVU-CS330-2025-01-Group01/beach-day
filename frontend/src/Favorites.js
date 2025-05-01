import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { fetchBeachInfoWithWeather, refreshWeatherData } from './utils';
import './Favorites.css';
import { API } from './api';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

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

  const [error, setError] = useState(null); // Error state
  const [newBeachId, setNewBeachId] = useState(''); // Beach ID for adding new favorites
  const [editing, setEditing] = useState(false); // State to manage editing beach list

  // updates favorites used within interval
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // Occurs on page mount
  useEffect(() => {
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    // If cached data exists, use it immediately without waiting for a refresh
    if (cachedFavorites) {
      setFavorites(JSON.parse(cachedFavorites));
      setLoadingFavorites(false); // Immediately show cached data
    }

    // Auto-refetch every 10 minutes
    const interval = setInterval(() => {
      refreshWeatherData(favoritesRef.current, setFavorites);
    }, tenMinutes);

    return () => clearInterval(interval); // Clean up when component unmounts

  }, [authenticated, jwtToken]);

  // Clear all favorites from both local state and server
  const clearFavorites = async () => {
    try {
      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken, type: 'clear' }),
      });

      const data = await response.json();

      if (data.message === 'Success.') {
        setFavorites([]); // Clear the list in local state
        localStorage.setItem('cachedFavorites', JSON.stringify([])); // Clear cached favorites
      } else {
        setGlobalError(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      setGlobalError('Failed to clear favorites. Please try again later.');
    }
  };

  // Remove a beach from favorites
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
      <div className="favorites-box">
        <div className="favorites-toolbar">
          <h2>Favorite Beaches</h2>
          <button
            onClick={() => { setEditing(!editing); }}
            className="edit-btn"
            title="Edit Favorites"
          > <span>Edit</span>
            <FiEdit size={20} />
          </button>
          {editing && (<button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all favorite beaches?")) {
                clearFavorites();
              }
            }}
            className="clear-btn"
            title="Clear favorites"
          > Clear Favorites
          </button>)}

        </div>

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
                <div className="location">{beach.county ? `${beach.county}, ` : ''}{beach.state}</div>
                <div className="forecast">{beach.forecast === null ? 'No forecast available' : beach.forecast}</div>
                <div className="info-container">
                  <div className="data-big">Beach Access<p>{beach.access === null ? 'Unavailable' : beach.access}</p></div>
                  <div className="data">Temperature <p>{beach.temperature === null ? 'Unavailable' : `${beach.temperature}°F`}</p></div>
                  <div className="data">UV Index <p>{beach.uvIndex === null ? 'Unavailable' : beach.uvIndex}</p></div>
                  <div className="data-big">Wind Speed and Direction
                    <p>{(beach.windSpeed === null && beach.windDirection === null) ? 'Unavailable' : beach.windSpeed + " " + beach.windDirection}</p></div>
                </div>
                {editing && (<button onClick={() => removeFavorite(beach.id)} className="remove-btn"><FiTrash2 size={20} />Remove</button>)}
              </div>
            </Link>
          ))}

          {/* Show loading spinner inline if more beaches are still coming */}
          {loadingFavorites && (
            <div className="favorite-item loading">
              <p>Loading next beach...</p>
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div >
    </div>
  );
}

export default Favorites;