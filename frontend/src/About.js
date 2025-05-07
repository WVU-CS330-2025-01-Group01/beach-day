import React from 'react';
import './About.css';

/**
 * About component displays information about the Beach Day project.
 * Includes a project description, development status, and team credits.
 *
 * @component
 * @returns {JSX.Element} The rendered About page
 */
function About() {
  return (
    <div className="about-container">
      <div className="about-box fade-in">
        <h1 className="about-title">About Beach Day</h1>
        
        {/* Project description */}
        <p className="about-description">
          Beach Day is an interactive web application designed to help users discover beautiful beaches across the United States.
          The app provides beach information, including weather conditions, and allows users to search for beaches by county and state, or coordinates.
        </p>

        {/* Beach list source */}
        <p className="beach-list-source">
          Beach Day uses a publicly available list of beaches in the United States provided by the U.S. Environmental Protection Agency (EPA).
          This list is provided to conform to the Beaches Environmental and Coastal Health Act (BEACH Act).
        </p>

        {/* Weather data source */}
        <p className="weather-data-source">
          Beach Day uses publicly available weather and UV index data provided by the U.S. National Weather Service (NWS) and the National Oceanic and Atmospheric Administration (NOAA).
        </p>

        {/* Disclaimer / project status */}
        <p className="about-status">
          Please note that this project is currently in development as part of a school assignment. While we strive to provide accurate
          and up-to-date information, some features and data may not be 100% reliable or fully implemented.
        </p>

        {/* Team and course credit */}
        <p className="about-credits">
          This project is developed by a team of students at West Virginia University as part of a Computer Science course.
          We appreciate your understanding as we continue to improve the app.
        </p>
      </div>
    </div>
  );
}

export default About;