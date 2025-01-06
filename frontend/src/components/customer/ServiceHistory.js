import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ServiceHistoryC.css";

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServiceHistory();
  }, []);

  const fetchServiceHistory = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/service_history.php",
        { action: "fetch_service_history", user_id: user.user_id }
      );
      setHistory(response.data);
    } catch (err) {
      console.error("Error fetching service history:", err);
      setError("Failed to fetch service history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-history">
      <h2>Service History</h2>
      {loading ? (
        <p>Loading service history...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : history.length === 0 ? (
        <p>No service history available.</p>
      ) : (
        <ul>
          {history.map((record) => (
            <li key={record.booking_id}>
              <p><strong>Service Name:</strong> {record.service_name}</p>
              <p><strong>Vehicle:</strong> {record.vehicle_details}</p>
              <p><strong>Mechanic:</strong> {record.mechanic_name} ({record.mechanic_contact})</p>
              <p><strong>Garage:</strong> {record.garage_name}</p>
              <p><strong>Status:</strong> {record.status}</p>
              <p><strong>Booking Date:</strong> {new Date(record.booking_date).toLocaleDateString()}</p>
              <p><strong>Total Cost:</strong> ₹{parseFloat(record.total_cost).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceHistory;
