import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Navbar from './Navbar';
import Favorites from './Favorites';

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('authenticated')) || false
  );

  const [weather, setWeather] = useState(null); // New state to hold weather info

  useEffect(() => {
    localStorage.setItem('authenticated', JSON.stringify(authenticated));
  }, [authenticated]);

  return (
    <Router>
      <Navbar
        authenticated={authenticated}
        setAuthenticated={setAuthenticated}
        onWeatherData={setWeather} // Pass setter to Navbar
      />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/favorites" element={<Favorites authenticated={authenticated} />} />
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/home" replace /> : <Login setAuthenticated={setAuthenticated} />}
        />
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/home" replace /> : <Register />}
        />
        <Route
          path="/home"
          element={<Home weather={weather} />} // Pass weather to Home
        />
      </Routes>
    </Router>
  );
}

export default App;
