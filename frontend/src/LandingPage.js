import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1>🌴 Welcome to Beach Day! 🌴</h1>
      <p>Plan your perfect beach trip with ease and enjoy the sun, sand, and waves! 🌊</p>
      <div className="button-container">
        <Link to="/login" className="btn"> Login</Link>
        <Link to="/register" className="btn"> Register</Link>
      </div>
    </div>
  );
};

export default LandingPage;

