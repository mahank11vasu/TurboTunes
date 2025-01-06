import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/custnotify.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/notifications.php",
        {
          action: "fetch_notifications",
          user_id: user.user_id,
        }
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (notificationId) => {
    try {
      await axios.post("http://localhost/turbotunes/backend/api/notifications.php", {
        action: "mark_as_seen",
        notification_id: notificationId,
      });
      fetchNotifications(); // Refresh the list after marking as seen
    } catch (err) {
      console.error("Error marking notification as seen:", err);
      setError("Failed to update the notification. Please try again.");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.post("http://localhost/turbotunes/backend/api/notifications.php", {
        action: "delete_notification",
        notification_id: notificationId,
      });
      fetchNotifications(); // Refresh the list after deleting
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete the notification. Please try again.");
    }
  };

  return (
    <div className="notifications">
      <h2>Your Notifications</h2>

      {loading ? (
        <p>Loading notifications...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.notification_id}>
              <p>{notification.message}</p>
              <p>Status: {notification.status}</p>
              {notification.status === "Pending" && (
                <button onClick={() => markAsSeen(notification.notification_id)}>Mark as Seen</button>
              )}
              <button onClick={() => deleteNotification(notification.notification_id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
