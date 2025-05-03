import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-box fade-in">
        <h1 className="about-title">About Beach Day</h1>
        <p className="about-description">
          Beach Day is an interactive web application designed to help users discover beautiful beaches across the United States.
          The app provides beach information, including weather conditions, and allows users to search for beaches by county and state, or coordinates.
        </p>
        <p className="about-status">
          Please note that this project is currently in development as part of a school assignment. While we strive to provide accurate
          and up-to-date information, some features and data may not be 100% reliable or fully implemented.
        </p>
        <p className="about-credits">
          This project is developed by a team of students at West Virginia University as part of a Computer Science course.
          We appreciate your understanding as we continue to improve the app.
        </p>
      </div>
    </div>
  );
}

export default About;