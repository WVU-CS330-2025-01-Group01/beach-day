import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import Cookies from 'js-cookie';
import './Favorites.css';
import { API } from './api';

function Favorites({ authenticated }) {
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authenticated) {
      setError('You need to be logged in to view your favorites.');
      setLoading(false);
      return;
    }

    const token = Cookies.get('jwt');
    const cachedFavorites = localStorage.getItem('cachedFavorites');
    const lastUpdated = localStorage.getItem('lastUpdated');

    const tenMinutes = 10 * 60 * 1000;
    const shouldRefresh = !lastUpdated || (Date.now() - lastUpdated > tenMinutes);

    if (cachedFavorites) {
      setFavorites(JSON.parse(cachedFavorites));
      setLoading(false);
    }

    if (token && shouldRefresh) {
      fetch(API.FAVORITES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jwt: token })
      })
        .then(response => response.json())
        .then(data => {
          const favoritesData = Array.isArray(data.favorites) ? data.favorites : [];

          Promise.all(favoritesData.map(async (id) => {
            const beachInfo = await fetchBeachInfoWithWeather(id);
            return { id, ...beachInfo };
          }))
            .then(updatedFavorites => {
              setFavorites(updatedFavorites);
              localStorage.setItem('cachedFavorites', JSON.stringify(updatedFavorites));
              localStorage.setItem('lastUpdated', Date.now());
              setLoading(false);
            });
        })
        .catch(error => {
          console.error('Error fetching favorites:', error);
          setError('Failed to load favorite beaches. Please try again later.');
          setLoading(false);
        });
    }
  }, [authenticated]);

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
        setFavorites([]);
        localStorage.removeItem('cachedFavorites');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error clearing favorites:', error);
      setError('Failed to clear favorites. Please try again later.');
    }
  };

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

  const fetchBeachInfoWithWeather = async (beachId) => {
    try {
      const response = await fetch(API.BEACHINFO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
      });

      const result = await response.json();
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
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className={`favorites-list ${viewMode}`}>
          {favorites.length > 0 ? (
            favorites.map((beach, index) => (
              <div key={index} className="favorite-item">
                <h3>{beach.name}</h3>
                <p>{beach.county}, {beach.state}</p>
                <p>Temperature: {beach.temperature === 'N/A' ? 'Data not available' : `${beach.temperature}°F`}</p>
                <p>Forecast: {beach.forecast === 'N/A' ? 'Data not available' : beach.forecast}</p>
                <button onClick={() => removeFavorite(beach.id)} style={{ marginLeft: '10px' }}>Remove</button>
              </div>
            ))
          ) : (
            <p>No favorite beaches added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Favorites;