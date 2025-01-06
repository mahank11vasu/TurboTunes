import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/mechnotify.css";

const MechanicNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMechanicId();
  }, []);

  const fetchMechanicId = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/notifications.php",
        {
          action: "get_mechanic_id",
          user_id: user.user_id,
        }
      );
      setMechanicId(response.data.mechanic_id);
      fetchNotifications(response.data.mechanic_id);
    } catch (err) {
      console.error("Error fetching mechanic ID:", err);
      setError("Failed to fetch mechanic ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (mechanicId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/notifications.php",
        {
          action: "fetch_sent_notifications",
          mechanic_id: mechanicId,
        }
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mechanic-notifications">
      <h2>Notifications Sent to Customers</h2>
      {loading ? (
        <p>Loading notifications...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.notification_id}>
              <p>Message: {notification.message}</p>
              <p>Status: {notification.status}</p>
              <p>Sent to: {notification.customer_name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MechanicNotifications;
