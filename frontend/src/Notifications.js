import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import './Notifications.css';
import { API } from './api';

/**
 * Notification component displays and manages user notifications.
 * @component
 * @returns {JSX.Element} Notification UI
 */
function Notification() {
  const {
    jwtToken,
    setGlobalError,
    notificationCount,
    setNotificationCount
  } = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Load notifications and count when component mounts
  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
  }, [jwtToken]);

  /**
   * Fetches all pending notifications for the authenticated user.
   * @async
   * @returns {Promise<void>}
   */
  async function fetchNotifications() {
    setLoading(true);
    try {
      const response = await fetch(API.GET_NOTIFICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          type: 'pending',
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setNotifications(data.notifications);
      }
    } catch (err) {
      setGlobalError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetches the current count of pending notifications.
   * @async
   * @returns {Promise<void>}
   */
  async function fetchNotificationCount() {
    try {
      const response = await fetch(API.COUNT_NOTIFICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setNotificationCount(data.count);
      }
    } catch (err) {
      setGlobalError('Failed to fetch notification count.');
    }
  }

  /**
   * Handles form submission to add a new notification.
   * @param {React.FormEvent} e - Form submit event
   * @async
   * @returns {Promise<void>}
   */
  async function handleAddNotification(e) {
    e.preventDefault();

    if (!titleInput.trim() || !messageInput.trim()) {
      setGlobalError('Title and message are required.');
      return;
    }

    try {
      const response = await fetch(API.ADD_NOTIFICATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          title: titleInput.trim(),
          message: messageInput.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setTitleInput('');
        setMessageInput('');
        fetchNotifications();
        fetchNotificationCount();
      } else {
        setGlobalError(`Add failed: ${data.message}`);
      }
    } catch (err) {
      setGlobalError('Failed to add notification.');
    }
  }

  /**
   * Marks a specific notification as received (removes from view).
   * @param {number} notificationId - ID of the notification to update
   * @async
   * @returns {Promise<void>}
   */
  async function handleMarkAsReceived(notificationId) {
    try {
      const response = await fetch(API.RECEIVE_NOTIFICATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          id: notificationId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setNotifications((prev) =>
          prev.filter((notif) => notif.notification_id !== notificationId)
        );
        fetchNotificationCount();
      } else {
        setGlobalError(`Mark as received failed: ${data.message}`);
      }
    } catch (err) {
      setGlobalError('Failed to mark notification as received.');
    }
  }

  /**
   * Removes all notifications for the user.
   * @async
   * @returns {Promise<void>}
   */
  async function handleRemoveAllNotifications() {
    try {
      const response = await fetch(API.REMOVE_NOTIFICATIONS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: jwtToken,
          type: 'all',
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === 'Success.') {
        setNotifications([]);
        fetchNotificationCount();
      } else {
        setGlobalError(`Remove failed: ${data.message}`);
      }
    } catch (err) {
      setGlobalError('Failed to remove notifications.');
    }
  }

  return (
    <div className="notifications-container">
      <div className="notifications-box">
        <div className="notifications-toolbar">
          <h2>Notifications ({notificationCount})</h2>
          <button className="remove-all-button" onClick={handleRemoveAllNotifications}>
            Remove All Notifications
          </button>
        </div>
        <div className="notifications-box fade-in">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
            <div className="notification-cards">
              {notifications.map((notif) => (
                <div key={notif.notification_id} className="notification-card">
                  <h3>{notif.notification_title || 'No Title'}</h3>
                  <p>{notif.message || 'No Message'}</p>
                  <button
                    className="mark-received-button"
                    onClick={() => handleMarkAsReceived(notif.notification_id)}
                  >
                    Mark as Received
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddNotification} className="add-notification-form">
            <h3>Add Notification</h3>
            <input
              type="text"
              placeholder="Title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
            <br />
            <input
              type="text"
              placeholder="Message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <br />
            <button type="submit">Add Notification</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Notification;
