import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';  // Import js-cookie

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(() => JSON.parse(localStorage.getItem('authenticated')) || false);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [jwtToken, setJwtToken] = useState(() => Cookies.get('jwt') || null);
  const [globalError, setGlobalError] = useState("");
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

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
        setLongitude
      }}
    >
      {children}
    </UserContext.Provider>
  );
};