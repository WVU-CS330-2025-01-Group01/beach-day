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

function App() {
  const { authenticated } = useContext(UserContext);
  const [weather, setWeather] = useState(null); // State to hold weather info

  return (
    <Router>
      <Navbar onWeatherData={setWeather} />
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" />} />
        <Route
          path="/favorites"
          element={authenticated ? <Favorites /> : <Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/home" replace /> : <Register />}
        />
        <Route
          path="/home"
          element={<Home weather={weather} />} 
           /> 
        <Route
          path="/settings"
          element={authenticated ? <Settings /> : <Navigate to="/login" replace />} />
        <Route
          path="/beach-info"
          element={<BeachInfo />} />
        <Route
          path="/about"
          element={<About />} />
        <Route
          path="/notifications"
          element={<Notifications />} />
      </Routes>
    </Router>
  );
}

export default App;
