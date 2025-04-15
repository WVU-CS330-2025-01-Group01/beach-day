import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useContext } from 'react';
import { UserContext } from './UserContext';
import { fetchBeachInfoWithWeather, cacheFavorites, refreshWeatherData } from './utils';
import Cookies from 'js-cookie';
import './Favorites.css';
import { API } from './api';

function Favorites() {
  const {
    authenticated,
    loadingFavorites,
    setLoadingFavorites,
    jwtToken,
    favorites,
    setFavorites
  } = useContext(UserContext);

  const [viewMode, setViewMode] = useState('grid'); // Display mode (grid/list)
  const [error, setError] = useState(null); // Error state
  const [newBeachId, setNewBeachId] = useState(''); // Beach ID for adding new favorites
  const [adding, setAdding] = useState(false); // State to manage adding new beach

  // updates favorites used within interval
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // Occurs on page mount
  useEffect(() => {
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    const lastUpdated = localStorage.getItem('lastUpdated');
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    const shouldRefresh = !lastUpdated || (Date.now() - lastUpdated > tenMinutes);

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
        setError(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      setError('Failed to clear favorites. Please try again later.');
    }
  };

  // Add a beach to favorites
  const addFavorite = async () => {
    const trimmedBeachId = newBeachId.trim(); // trims whitespace

    // If user adds empty string
    if (!trimmedBeachId) {
      setError('Please enter a valid BeachID.');
      return;
    }

    // Check if the beach is already in favorites
    if (favorites.some(fav => fav.id === newBeachId)) {
      setError('That beach is already in your favorites.');
      return;
    }

    if (loadingFavorites) {
      setError('Please wait until all beaches have loaded');
      return;
    }

    try {
      setAdding(true);
      const beachInfo = await fetchBeachInfoWithWeather(newBeachId);

      // if user enters invalid BeachID
      if (beachInfo.name === null) {
        setError('BeachID is invalid. Please enter valid BeachID');
        return;
      }

      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken, type: 'add', favorite: trimmedBeachId })
      });

      const data = await response.json();

      if (data.message !== 'Success.') {
        setError(data.message || 'Failed to add beach to favorites.');
        return;
      }

      const newFavorite = { id: trimmedBeachId, ...beachInfo }; // creates new json object for newBeach
      const updatedFavorites = [...favorites, newFavorite]; // adds this object to favorites
      setFavorites(updatedFavorites); // updates local favorites state
      localStorage.setItem('cachedFavorites', JSON.stringify(updatedFavorites)); // updates cachedFavorites
      setNewBeachId(''); // clears newBeachID state
      setError(null); // clears error state
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Could not add favorite. Please try again later.');
    } finally {
      setAdding(false);
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
        const updatedFavorites = await response.json();
        setFavorites(updatedFavorites); // fallback if server returns corrected list
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>Your Favorite Beaches</h2>
        <div className="view-toggle">
          <button onClick={() => setViewMode('list')}>List</button>
          <button onClick={() => setViewMode('grid')}>Grid</button>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all favorite beaches?")) {
              clearFavorites();
            }
          }}
          className="clear-btn"
        >
          Clear Favorites
        </button>
      </div>

      <div className={`favorites-list ${viewMode}`}>
        {favorites.map((beach, index) => (
          <div key={beach.id} className="favorite-item">
            <h3>{beach.name}</h3>
            <p>{beach.county ? `${beach.county}, ` : ''}{beach.state}</p>
            <p>Temperature: {beach.temperature === 'N/A' ? 'Data not available' : `${beach.temperature}°F`}</p>
            <p>Forecast: {beach.forecast === 'N/A' ? 'Data not available' : beach.forecast}</p>
            <button onClick={() => removeFavorite(beach.id)} className="remove-btn">Remove</button>
          </div>
        ))}

        {/* Show loading spinner inline if more beaches are still coming */}
        {loadingFavorites && (
          <div className="favorite-item loading">
            <p>Loading next beach...</p>
            <div className="spinner"></div>
          </div>
        )}

        {/* Add Beach Block */}
        <div className="favorite-item add-favorite">
          <h3>Add a Beach by ID</h3>
          <input
            type="text"
            placeholder="Enter BeachID"
            value={newBeachId}
            onChange={(e) => {
              setNewBeachId(e.target.value);
              setError(null);
            }}
            style={{ marginRight: '10px' }}
          />
          <button onClick={addFavorite} disabled={adding}>
            {adding ? 'Adding...' : 'Add Beach'}
          </button>

          {/* Show error below input if any */}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Favorites;