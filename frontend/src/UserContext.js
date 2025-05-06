import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';  // For managing JWT in cookies

// Create global context
export const UserContext = createContext();

/**
 * UserProvider
 * Global provider to wrap app and supply authentication/user state via context
 *
 * @param {ReactNode} children - Components wrapped inside the provider
 * @returns {JSX.Element} context provider with state values and setters
 */
export const UserProvider = ({ children }) => {
  // Initialize state from localStorage or cookies
  const [authenticated, setAuthenticated] = useState(() =>
    JSON.parse(localStorage.getItem('authenticated')) || false
  );
  const [username, setUsername] = useState(() =>
    localStorage.getItem('username') || ''
  );
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [jwtToken, setJwtToken] = useState(() => Cookies.get('jwt') || null);
  const [globalError, setGlobalError] = useState("");
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  // Keep authenticated state in sync with localStorage
  useEffect(() => {
    localStorage.setItem('authenticated', JSON.stringify(authenticated));
  }, [authenticated]);

  return (
    <UserContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        favorites,
        setFavorites,
        loadingFavorites,
        setLoadingFavorites,
        jwtToken,
        setJwtToken,
        username,
        setUsername,
        globalError,
        setGlobalError,
        usingCurrentLocation,
        setUsingCurrentLocation,
        latitude,
        setLatitude,
        longitude,
        setLongitude,
        notificationCount,
        setNotificationCount
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
