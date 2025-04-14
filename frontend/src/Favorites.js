import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import Cookies from 'js-cookie';
import './Favorites.css';
import { API } from './api';

function Favorites({ authenticated }) {
  const [favorites, setFavorites] = useState([]); // List of all favorite beaches
  const [viewMode, setViewMode] = useState('grid'); // Display mode (grid/list)
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [newBeachId, setNewBeachId] = useState(''); // Beach ID for adding new favorites
  const [adding, setAdding] = useState(false); // State to manage adding new beach


  useEffect(() => {
    // Check if authenticated
    if (!authenticated) {
      setError('You need to be logged in to view your favorites.');
      setLoading(false);
      return;
    }

    const token = Cookies.get('jwt');
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    const lastUpdated = localStorage.getItem('lastUpdated');

    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    const shouldRefresh = !lastUpdated || (Date.now() - lastUpdated > tenMinutes);

    // If cached data exists, use it immediately without waiting for a refresh
    if (cachedFavorites) {
      setFavorites(JSON.parse(cachedFavorites));
      setLoading(false); // Immediately show cached data
    }


    if (!shouldRefresh) {
      return; // Data is fresh, skip refetching
    }

    if (token) {
      setLoading(true);

      fetch(API.FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: token })
      })
        .then(response => response.json())
        .then(async data => {
          const favoritesData = Array.isArray(data.favorites) ? data.favorites : [];

          // Reset for fresh data if reloading
          setFavorites([]);
          localStorage.setItem('cachedFavorites', JSON.stringify([]));

          // Fetch each beach one by one and add to the list as they load
          for (let i = 0; i < favoritesData.length; i++) {
          const id = favoritesData[i];
          const beachInfo = await fetchBeachInfoWithWeather(id);

          if (beachInfo.name !== 'Unknown') {
            setFavorites(prev => {
              // Check if the beach already exists in the favorites list
              if (prev.some(fav => fav.id === id)) {
                return prev; // Return previous state if beach already exists
              }
              
              const updated = [...prev, { id, ...beachInfo }];
              localStorage.setItem('cachedFavorites', JSON.stringify(updated));
              return updated; // Add the beach to the list progressively
            });
          }
        }
          // After all beaches are fetched, update lastUpdated timestamp
          localStorage.setItem('lastUpdated', Date.now());
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching favorites:', error);
          setError('Failed to load favorite beaches. Please try again later.');
          setLoading(false);
        });
    }
  }, [authenticated]);

  // Clear all favorites from both local state and server
  const clearFavorites = async () => {
    const token = Cookies.get('jwt');

    if (!token) {
      setError('You need to be logged in to modify favorites.');
      return;
    }

    try {
      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: token, type: 'clear' }),
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
    const token = Cookies.get('jwt');
    if (!token) {
      setError('You need to be logged in to modify favorites.');
      return;
    }

    if (!newBeachId) {
      setError('Please enter a valid BeachID.');
      return;
    }

    try {
      setAdding(true);

      // Check if the beach is already in favorites
      if (favorites.some(fav => fav.id === newBeachId)) {
        setError('That beach is already in your favorites.');
        return;
      }

      // Then fetch and add the beach info locally
      const beachInfo = await fetchBeachInfoWithWeather(newBeachId);

      if (beachInfo.name === 'Unknown') {
        setError('BeachID is invalid. Please enter valid BeachID');
        return;
      }

      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: token, type: 'add', favorite: newBeachId })
      });

      const data = await response.json();

      if (data.message !== 'Success.') {
        setError(data.message || 'Failed to add beach to favorites.');
        return;
      }

      // Add to local state
      const newFavorite = { id: newBeachId, ...beachInfo };
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem('cachedFavorites', JSON.stringify(updatedFavorites));
      setNewBeachId('');
      setError(null);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError('Could not add favorite. Please try again later.');
    } finally {
      setAdding(false);
    }
  };

  // Remove a beach from favorites
  const removeFavorite = async (beachId) => {
    const token = Cookies.get('jwt');

    if (!token) {
      setError('You need to be logged in to modify favorites.');
      return;
    }

    try {
      const newFavorites = favorites.filter(fav => fav.id !== beachId);
      setFavorites(newFavorites);
      localStorage.setItem('cachedFavorites', JSON.stringify(newFavorites));

      const response = await fetch(API.UPDATE_FAVORITES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: token, type: 'remove', favorite: beachId })
      });

      if (response.ok) {
        console.log('Favorite removed successfully');
      } else {
        console.error('Failed to remove favorite');
        const updatedFavorites = await response.json();
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setFavorites(favorites);  // Revert UI update in case of error
    }
  };

  // Fetch beach info and weather for a given beachId
  const fetchBeachInfoWithWeather = async (beachId) => {
    try {
      const response = await fetch(API.BEACHINFO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
      });

      const result = await response.json();
      console.log('Beach info result:', result);
      if (result.code === "dummy_get_beach_info_weather_by_id") {
        const { beach_name, beach_county, beach_state, weather } = result;
        return {
          name: beach_name || 'Unknown Beach',
          county: beach_county || 'Unknown County',
          state: beach_state || 'Unknown State',
          temperature: weather?.temperature || 'N/A',
          forecast: weather?.forecastSummary || 'No forecast available',
        };
      } else {
        throw new Error('Failed to fetch beach info with weather');
      }
    } catch (error) {
      console.error('Error fetching beach info and weather:', error);
      return {
        name: 'Unknown',
        county: 'Unknown',
        state: 'Unknown',
        temperature: 'N/A',
        forecast: 'N/A',
      };
    }
  };

  // Redirect to login page if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>Your Favorite Beaches</h2>
        <div className="view-toggle">
          <button onClick={() => setViewMode('list')}>List</button>
          <button onClick={() => setViewMode('grid')}>Grid</button>
        </div>
        <button onClick={clearFavorites} className="clear-btn">Clear Favorites</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={`favorites-list ${viewMode}`}>
          {favorites.map((beach, index) => (
            <div key={index} className="favorite-item">
              <h3>{beach.name}</h3>
              <p>{beach.county}, {beach.state}</p>
              <p>Temperature: {beach.temperature === 'N/A' ? 'Data not available' : `${beach.temperature}°F`}</p>
              <p>Forecast: {beach.forecast === 'N/A' ? 'Data not available' : beach.forecast}</p>
              <button onClick={() => removeFavorite(beach.id)} style={{ marginLeft: '10px' }}>Remove</button>
            </div>
          ))}

          {/* This part is always shown regardless of favorite count */}
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
      )}
    </div>
  );
}

export default Favorites;