import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import './Events.css';  // Assuming your event styles are in this file
import { API } from './api';

/**
 * Event component displays and manages user events.
 * It allows authenticated users to:
 *  - View upcoming scheduled events
 *  - See time remaining until each event starts
 *  - Remove individual events
 *  - Remove all events at once
 *  - Automatically fetch beach names by beach ID
 * 
 * @component
 * @returns {JSX.Element} Rendered event management UI
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
  * Adds beach names to each event using their beach ID.
  * Sets loading and error states as needed.
  * 
  * @async
  * @function fetchEvents
  * @returns {Promise<void>}
  */
  async function fetchEvents() {
    setLoading(true);
    try {
      const response = await fetch(API.GET_EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken, type: 'all' }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        const eventsWithBeachNames = await Promise.all(
          data.events.map(async (event) => {
            const beach_name = await fetchBeachName(event.beach_id);
            return { ...event, beach_name };
          })
        );
        setEvents(eventsWithBeachNames);
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
 * Fetches the name of a beach given its ID.
 * If the request fails, returns a fallback name with the beach ID.
 * 
 * @async
 * @function fetchBeachName
 * @param {number} beach_id - ID of the beach
 * @returns {Promise<string>} The name of the beach or fallback label
 */
  async function fetchBeachName(beach_id) {
    try {
      const response = await fetch(API.BEACHINFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_type: "get_beach_info_by_id",
          beach_id: beach_id
        })
      });

      const data = await response.json();
      return data.beach_name;
    } catch (err) {
      console.error(`Failed to fetch beach name for ID ${beach_id}:`, err);
      return `Beach #${beach_id}`;
    }
  }

  /**
   * Fetches the total number of scheduled events for the authenticated user.
   * Sets the event count or global error message.
   * 
   * @async
   * @function fetchEventCount
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
   * Deletes all scheduled events for the authenticated user.
   * Refreshes the event list and count upon success.
   * 
   * @async
   * @function removeAllEvents
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
   * Deletes a specific event by its ID.
   * Refreshes the event list and count upon success.
   * 
   * @async
   * @function removeEventById
   * @param {number} eventId - ID of the event to be removed
   * @returns {Promise<void>}
   */
  async function removeEventById(eventId) {
    try {
      console.log('Sending remove by ID request:', {
        jwt: jwtToken,
        type: 'by_id',
        id: Number(eventId),
      });

      const response = await fetch(API.REMOVE_EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          type: 'by_id',
          id: Number(eventId),
        }),
      });

      const data = await response.json();
      console.log('Remove by ID response:', data);

      if (response.ok && data.message === 'Success.') {
        await fetchEvents();
        await fetchEventCount();
      } else {
        setGlobalError(data.message || 'Failed to remove event.');
      }
    } catch (err) {
      console.error('Error removing event:', err);
      setGlobalError('Failed to remove event.');
    }
  }

  /**
 * Calculates a countdown string from now until the event time.
 * Formats the result in "Xd Yh Zm" style, or returns "Started" if in the past.
 * 
 * @function getCountdown
 * @param {string} eventTime - ISO timestamp string of the event
 * @returns {string} Human-readable countdown or "Started"
 */
  function getCountdown(eventTime) {
    const now = new Date();
    const eventDate = new Date(eventTime);
    const diffMs = eventDate - now;

    if (diffMs <= 0) return "Started";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600) % 24;
    const days = Math.floor(seconds / 86400);

    let parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);

    return parts.length ? `In ${parts.join(" ")}` : "Less than a minute";
  }

  return (
    <div className="events-container">
      <div className="events-box fade-in">
        <div className="events-toolbar">
          <h2>Events ({eventCount})</h2>
          {events.length > 0 && (
            <button className="remove-all-button" onClick={removeAllEvents}>
              Remove All Events
            </button>
          )}
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
                  <div className="event-countdown">{getCountdown(event.event_time)}</div>
                  <p>{new Date(event.event_time).toLocaleString()}</p>
                  <p>{event.beach_name}</p>
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
    </div>
  );
}

export default Events;
