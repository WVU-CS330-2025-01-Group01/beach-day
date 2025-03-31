import React, { useState, useEffect } from 'react';
import './Favorites.css'; // Import the CSS file for styling
import Cookies from 'js-cookie'; // Import js-cookie to manage cookies
import { Navigate } from 'react-router-dom';

const favoritesURL =
    'http://' +
    process.env.REACT_APP_BACKEND_HOST +
    ':' +
    process.env.REACT_APP_BACKEND_PORT +
    '/favorites';

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
