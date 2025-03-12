import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';  // Import your LandingPage component
import BeachInfo from './BeachInfo';  // Make sure you import BeachInfo

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
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Route */}
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/beach-info" replace /> : <Login setAuthenticated={setAuthenticated} />}
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/beach-info" replace /> : <Register />}
        />

        {/* Beach Info Route */}
        <Route
          path="/beach-info"
          element={authenticated ? <BeachInfo /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
