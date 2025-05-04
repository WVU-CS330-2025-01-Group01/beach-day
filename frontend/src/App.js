import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Navbar from './Navbar';
import Favorites from './Favorites';
import Settings from './Settings';
import BeachInfo from './BeachInfo';
import Notifications from './Notifications';
import About from './About';

/**
 * Main application component responsible for routing and authentication logic.
 * Wraps all pages within a Router and renders routes conditionally based on authentication state.
 */
function App() {
  const { authenticated } = useContext(UserContext); // Access global authentication state
  const [weather, setWeather] = useState(null); // State to hold weather info passed from Navbar to Home

  return (
    <Router>
      {/* Navbar is always rendered and passes weather data back via prop */}
      <Navbar onWeatherData={setWeather} />
      <Routes>
        {/* Redirect root path to /home */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Protected route: only authenticated users can access /favorites */}
        <Route
          path="/favorites"
          element={authenticated ? <Favorites /> : <Navigate to="/login" replace />}
        />

        {/* Login page; redirect authenticated users to home */}
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/home" replace /> : <Login />}
        />

        {/* Registration page; redirect authenticated users to home */}
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/home" replace /> : <Register />}
        />

        {/* Home page with weather info passed as prop */}
        <Route
          path="/home"
          element={<Home weather={weather} />}
        />

        {/* Protected route: only authenticated users can access /settings */}
        <Route
          path="/settings"
          element={authenticated ? <Settings /> : <Navigate to="/login" replace />}
        />

        {/* Public route to display beach information */}
        <Route
          path="/beach-info"
          element={<BeachInfo />}
        />

        {/* Public about page */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* Public notifications page */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />
      </Routes>
    </Router>
  );
}

export default App;