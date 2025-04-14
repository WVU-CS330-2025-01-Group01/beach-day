import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(() => JSON.parse(localStorage.getItem('authenticated')) || false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);

  return (
    <UserContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        favorites,
        setFavorites,
        loadingFavorites,
        setLoadingFavorites,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};