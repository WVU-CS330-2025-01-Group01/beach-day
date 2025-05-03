import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from './UserContext';
import './Notifications.css';
import { API } from './api';

function Notification() {
  const { jwtToken, setGlobalError } = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
  }, [jwtToken]);

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
      <h2>Notifications ({notificationCount})</h2>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notif) => (
            <li key={notif.notification_id} className="notification-item">
              <strong className="notification-title">
                {notif.notification_title || 'No Title'}
              </strong>
              : {notif.message || 'No Message'}
              <br />
              <button onClick={() => handleMarkAsReceived(notif.notification_id)}>
                Mark as Received
              </button>
            </li>
          ))}
        </ul>
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

      <hr />

      <h3>Manage</h3>
      <button className="remove-all-button" onClick={handleRemoveAllNotifications}>
        Remove All Notifications
      </button>
    </div>
  );
}

export default Notification;
