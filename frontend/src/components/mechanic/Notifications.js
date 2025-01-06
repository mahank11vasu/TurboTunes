import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);

  useEffect(() => {
    fetchMechanicId();
  }, []);

  const fetchMechanicId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.user_id) {
      console.error("User not logged in or invalid user data.");
      return;
    }

    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_mechanic_id&user_id=${user.user_id}`)
      .then((response) => {
        if (response.data.mechanic_id) {
          setMechanicId(response.data.mechanic_id);
          fetchNotifications(response.data.mechanic_id); // Fetch notifications after mechanic ID
        } else {
          console.error("Mechanic ID not found in response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mechanic ID:", error));
  };

  const fetchNotifications = (mechanicId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_notifications&mechanic_id=${mechanicId}`)
      .then((response) => setNotifications(response.data))
      .catch((error) => console.error("Error fetching notifications:", error));
  };

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.notification_id}>
              {notification.message} - <small>{new Date(notification.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications found.</p>
      )}
    </div>
  );
};

export default Notifications;
