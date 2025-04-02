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
                    setFavorites(favoritesData);
                    setLoading(false); // Stop loading
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
                                <h3>{beach}</h3> {/* Display the beach ID */}
                                <button onClick={() => removeFavorite(beach)} style={{ marginLeft: '10px' }}></button>
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
