import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/PartsUsage.css";

const PartsUsage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
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
          fetchBookings(response.data.mechanic_id); // Fetch bookings after mechanic ID is retrieved
        } else {
          console.error("Mechanic ID not found in response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mechanic ID:", error));
  };

  const fetchBookings = (mechanicId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_active_bookings&mechanic_id=${mechanicId}`)
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching bookings:", error));
  };

  const fetchParts = (serviceId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_service_parts&service_id=${serviceId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setParts(response.data);
        } else {
          console.error("Unexpected parts response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching parts:", error));
  };

  const handleBookingChange = (bookingId, serviceId) => {
    setSelectedBooking(bookingId);
    fetchParts(serviceId);
  };

  const handleAddPart = (part) => {
    setSelectedParts((prev) => {
      const exists = prev.find((p) => p.part_id === part.part_id);
      if (exists) {
        alert("Part already added. Update quantity if needed.");
        return prev;
      }
      return [...prev, { ...part, quantity: 1, cost: part.cost_per_unit }];
    });
  };
  
  const handleQuantityChange = (index, quantity) => {
    const updatedParts = [...selectedParts];
    updatedParts[index].quantity = quantity;
    updatedParts[index].cost = quantity * updatedParts[index].cost_per_unit; // Update total cost for the part
    setSelectedParts(updatedParts);
  };
  
  const handleSubmit = () => {
    if (!selectedBooking) {
      alert("Please select a booking.");
      return;
    }
  
    if (selectedParts.length === 0) {
      alert("No parts selected. Please add parts before submitting.");
      return;
    }
  
    axios
      .post("http://localhost/turbotunes/backend/api/appointments.php?action=log_parts", {
        booking_id: selectedBooking,
        parts: selectedParts,
      })
      .then((response) => {
        alert("Parts logged successfully!");
        setSelectedParts([]); // Reset the selected parts after successful submission
      })
      .catch((error) => console.error("Error logging parts:", error));
  };

  return (
    <div className="parts-usage">
      <h2>Log Parts Used</h2>
      <div>
        <label>Select Booking:</label>
        <select
          onChange={(e) => {
            const selectedIndex = e.target.selectedIndex;
            const serviceId = e.target[selectedIndex].getAttribute("data-service-id");
            handleBookingChange(e.target.value, serviceId);
          }}
        >
          <option value="">-- Select Booking --</option>
          {bookings.map((booking) => (
            <option key={booking.booking_id} value={booking.booking_id} data-service-id={booking.service_id}>
              {booking.booking_id} - {booking.vehicle_details}
            </option>
          ))}
        </select>
      </div>
      <div className="parts-list">
        <h3>Available Parts</h3>
        <ul>
          {parts.map((part) => (
            <li key={part.part_id}>
              {part.name} - ₹{part.cost_per_unit} ({part.stock} in stock)
              <button onClick={() => handleAddPart(part)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="selected-parts">
        <h3>Selected Parts</h3>
        {selectedParts.map((part, index) => (
          <div key={index}>
            {part.name} - ₹{part.cost_per_unit}
            <input
              type="number"
              value={part.quantity}
              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
              min="1"
              max={part.stock}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit Parts Usage</button>
    </div>
  );
};

export default PartsUsage;
