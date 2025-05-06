import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import './Events.css';  // Assuming your event styles are in this file
import { API } from './api';

/**
 * Event component displays and manages user events.
 * @component
 * @returns {JSX.Element} Event UI
 */
function Events() {
  const { jwtToken, setGlobalError } = useContext(UserContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventCount, setEventCount] = useState(0);

  // Load events and count when component mounts
  useEffect(() => {
    fetchEvents();
    fetchEventCount();
  }, [jwtToken]);

  /**
   * Fetches all events for the authenticated user.
   * @async
   * @returns {Promise<void>}
   */
  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch(API.GET_EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          type: 'all',  // Adjust type as needed: 'future', 'all', etc.
        }),
      });

      const data = await response.json();

      console.log('Fetched events:', data);  // Log the data for debugging

      if (response.ok && data.message === 'Success.') {
        setEvents(data.events);
      } else {
        setGlobalError(data.message || 'Failed to fetch events.');
      }
    } catch (err) {
      setGlobalError('Failed to fetch events.');
      console.error('Error fetching events:', err);  // Log the error for debugging
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetches the current count of events.
   * @async
   * @returns {Promise<void>}
   */
  async function fetchEventCount() {
    try {
      const response = await fetch(API.COUNT_EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setEventCount(data.count);
      } else {
        setGlobalError(data.message || 'Failed to fetch event count.');
      }
    } catch (err) {
      setGlobalError('Failed to fetch event count.');
      console.error('Error fetching event count:', err);  // Log the error for debugging
    }
  }

  return (
    <div className="events-container">
      <h2>Events ({eventCount})</h2>
      <div className="events-box fade-in">
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events scheduled.</p>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.event_id} className="event-item">
                <strong className="event-title">{event.title || 'No Title'}</strong>
                <br />
                {new Date(event.time).toLocaleString()} {/* Format the date as needed */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Events;
