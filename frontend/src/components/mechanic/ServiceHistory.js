import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ServiceHistory.css";

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);
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
          fetchServiceHistory(response.data.mechanic_id); // Fetch service history after mechanic ID
        } else {
          console.error("Mechanic ID not found in response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mechanic ID:", error));
  };

  const fetchServiceHistory = (mechanicId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_service_history&mechanic_id=${mechanicId}`)
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Error fetching service history:", error));
  };

  return (
    <div className="service-history">
      <h2>Service History</h2>
      {history.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Service</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.booking_id}>
                <td>{entry.booking_id}</td>
                <td>{entry.customer_name}</td>
                <td>{entry.vehicle_details}</td>
                <td>{entry.service_name}</td>
                <td>{new Date(entry.booking_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No service history available.</p>
      )}
    </div>
  );
};

export default ServiceHistory;
