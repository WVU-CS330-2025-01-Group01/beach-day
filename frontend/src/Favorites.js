import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie to manage cookies
import { Navigate } from 'react-router-dom';
import './Favorites.css'; // Import the CSS file for styling

const favoritesURL =
    'http://' +
    process.env.REACT_APP_BACKEND_HOST +
    ':' +
    process.env.REACT_APP_BACKEND_PORT +
    '/favorites';

const updateFavoritesURL =
    'http://' +
    process.env.REACT_APP_BACKEND_HOST +
    ':' +
    process.env.REACT_APP_BACKEND_PORT +
    '/update_favorites';

const beachInfoURL =
    'http://' +
    process.env.REACT_APP_BACKEND_HOST +
    ':' +
    process.env.REACT_APP_BACKEND_PORT +
    '/weather';

function Favorites() {
    const [favorites, setFavorites] = useState([]); // Store favorite beaches
    const [viewMode, setViewMode] = useState('grid'); // Toggle between list and grid view
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        // Retrieve the JWT from cookies
        const token = Cookies.get('jwt'); // Get JWT from cookies

        if (token) {
            fetch(favoritesURL, {
                method: 'POST',  // Change the method to POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jwt: token })  // Send the JWT in the body
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched data:', data);
                    const favoritesData = Array.isArray(data.favorites) ? data.favorites : [];

                    // Fetch beach info for each favorite beach ID
                    Promise.all(favoritesData.map(async (id) => {
                        const beachInfo = await fetchBeachInfoWithWeather(id); // Fetch beach info with weather
                        return { id, ...beachInfo }; // Return the beach ID along with the additional info
                    }))
                        .then(updatedFavorites => {
                            setFavorites(updatedFavorites); // Update the state with updated beach info
                            setLoading(false); // Stop loading
                        });
                })
                .catch(error => {
                    console.error('Error fetching favorites:', error);
                    setError('Failed to load favorite beaches. Please try again later.');
                    setLoading(false); // Stop loading
                });
        } else {
            setError('You need to be logged in to view your favorites.');
            setLoading(false); // Stop loading
        }
    }, []);

    const clearFavorites = async () => {
        const token = Cookies.get('jwt');

        if (!token) {
            setError('You need to be logged in to modify favorites.');
            return;
        }

        try {
            const response = await fetch(updateFavoritesURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jwt: token, type: 'clear' }),
            });

            const data = await response.json();

            if (data.message === 'Success.') {
                setFavorites([]); // Clear the UI after successful request
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
            const response = await fetch(updateFavoritesURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jwt: token, type: 'remove', favorite: beachId })
            });

            if (response.ok) {
                // Update the UI by removing the deleted beach
                setFavorites(favorites.filter(fav => fav !== beachId));
            } else {
                console.error('Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const fetchBeachInfoWithWeather = async (beachId) => {
        try {
            const response = await fetch(beachInfoURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_type: 'dummy_get_beach_info_weather_by_id', beach_id: beachId })
            });

            const result = await response.json();  // Capture the response JSON

            // Check if the response has the expected structure
            if (result.code === "dummy_get_beach_info_weather_by_id") {
                // Destructure the necessary properties
                const { beach_name, beach_county, beach_state, weather } = result;

                // If weather data exists, return the necessary values; otherwise, fallback to 'N/A'
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
            // Fallback values for missing data
            return {
                name: 'Unknown',
                county: 'Unknown',
                state: 'Unknown',
                temperature: 'N/A',
                forecast: 'N/A',
            };
        }
    };

    // If no JWT token, redirect to login page
    if (!Cookies.get('jwt')) {
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
                <p>Loading...</p> // Display loading message
            ) : error ? (
                <p>{error}</p> // Display error message
            ) : (
                <div className={`favorites-list ${viewMode}`}>
                    {favorites.length > 0 ? (
                        favorites.map((beach, index) => (
                            <div key={index} className="favorite-item">
                                <h3>{beach.name}</h3> {/* Display the beach name */}
                                <p>{beach.county}, {beach.state}</p> {/* Display county and state */}
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
