import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';  // Import Home
import Navbar from "./Navbar"; // Import Navbar
import Favorites from "./Favorites"; // Import Favorites

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('authenticated')) || false
  );

  // Update local storage whenever `authenticated` state changes
  useEffect(() => {
    localStorage.setItem('authenticated', JSON.stringify(authenticated));
  }, [authenticated]);

  return (
    <Router>
      <Navbar authenticated={authenticated} setAuthenticated={setAuthenticated} />
      <Routes>
        {/* Redirect default route to Home if authenticated, else to Login */}
        <Route
          path="/"
          element={<Navigate to="/home" />}
        />

        {/* Favorites Route */}
        <Route path="/favorites" element={<Favorites />} />

        {/* Login Route */}
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/home" replace /> : <Login setAuthenticated={setAuthenticated} />}
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/home" replace /> : <Register />}
        />

        {/* Home Route (No authentication required) */}
        <Route
          path="/home"
          element={<Home />} // Accessible without authentication
        />
      </Routes>
    </Router>
  );
}

export default App;
