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
      console.error('Error fetching events:', err);
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
      console.error('Error fetching event count:', err);
    }
  }

  /**
   * Removes all events for the current user.
   * @async
   * @returns {Promise<void>}
   */
  async function removeAllEvents() {
    try {
      const response = await fetch(API.REMOVE_EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          type: 'all'
        }),
      });

      const data = await response.json();
      if (response.ok && data.message === 'Success.') {
        await fetchEvents();
        await fetchEventCount();
      } else {
        setGlobalError(data.message || 'Failed to remove all events.');
      }
    } catch (err) {
      console.error('Error removing all events:', err);
      setGlobalError('Failed to remove all events.');
    }
  }

/**
 * Removes an event by its ID.
 * @param {number} eventId - The ID of the event to remove.
 * @async
 */
async function removeEventById(eventId) {
  try {
    const response = await fetch(API.REMOVE_EVENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jwt: jwtToken,
        type: 'by_id',
        id: eventId,
      }),
    });

    const data = await response.json();
    console.log('Remove by ID response:', data);

    if (response.ok && data.message === 'Success.') {
      await fetchEvents();
      await fetchEventCount();
    } else {
      setGlobalError(`Remove by ID failed: ${data.message}`);
    }
  } catch (err) {
    console.error('Error removing event:', err);
    setGlobalError('Failed to remove event.');
  }
}


  return (
    <div className="events-container">
      <div className="events-toolbar">
        <h2>Events ({eventCount})</h2>
        <button className="remove-all-button" onClick={removeAllEvents}>
          Remove All Events
        </button>
      </div>
      <div className="events-box fade-in">
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events scheduled.</p>
        ) : (
          <div className="event-cards">
            {events.map((event) => (
              <div key={event.event_id} className="event-card">
                <h3>{event.event_message || 'No Title'}</h3>
                <p>{new Date(event.event_time).toLocaleString()}</p>
                <button
                  className="remove-event-button"
                  onClick={() => removeEventById(event.event_id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
