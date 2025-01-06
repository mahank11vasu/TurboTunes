import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/FinalizeBill.css";

const FinalizeBill = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [totalCost, setTotalCost] = useState(0); // Default to 0 to ensure it's a number
  const [gstAmount, setGstAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [parts, setParts] = useState([]);
  const mechanicId = JSON.parse(localStorage.getItem("user")).mechanic_id;

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

  const fetchPartsUsage = (bookingId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_booking_details&booking_id=${bookingId}`)
      .then((response) => {
        if (response.data) {
          setParts(response.data.parts_used || []);
          calculateTotalCost(response.data.parts_used || [], Number(response.data.service_cost || 0));
        } else {
          console.error("Unexpected booking details format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching parts usage:", error));
  };

  const calculateTotalCost = (parts, serviceCost) => {
    const partsCost = parts.reduce((sum, part) => sum + (Number(part.cost) || 0), 0); // Ensure part cost is numeric
    const total = partsCost + serviceCost; // Add service cost
    const gst = total * 0.18; // Assuming 18% GST
    setTotalCost(total);
    setGstAmount(gst);
    setFinalAmount(total + gst); // Final amount after GST
  };

  const handleBookingChange = (bookingId) => {
    setSelectedBooking(bookingId);
    fetchPartsUsage(bookingId);
  };

  const handleFinalize = () => {
    if (!selectedBooking) {
      alert("Please select a booking.");
      return;
    }

    axios
      .post("http://localhost/turbotunes/backend/api/appointments.php?action=finalize_bill", {
        booking_id: selectedBooking,
        total_cost: finalAmount, // Send the final calculated amount
      })
      .then((response) => {
        alert("Bill finalized successfully!");
        fetchBookings(mechanicId); // Refresh bookings
        setSelectedBooking(null);
        setParts([]);
        setTotalCost(0);
        setGstAmount(0);
        setFinalAmount(0);
      })
      .catch((error) => console.error("Error finalizing bill:", error));
  };

  return (
    <div className="finalize-bill">
      <h2>Finalize Bill</h2>
      <div>
        <label>Select Booking:</label>
        <select
          onChange={(e) => {
            const bookingId = e.target.value;
            handleBookingChange(bookingId);
          }}
        >
          <option value="">-- Select Booking --</option>
          {bookings.map((booking) => (
            <option key={booking.booking_id} value={booking.booking_id}>
              {booking.booking_id} - {booking.vehicle_details}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>Parts Used</h3>
        <ul>
          {parts.map((part) => (
            <li key={part.part_id}>
              {part.name} - ₹{part.cost} (Qty: {part.quantity})
            </li>
          ))}
        </ul>
      </div>
      <h3>Parts + Service Cost: ₹{totalCost.toFixed(2)}</h3>
      <h3>GST (18%): ₹{gstAmount.toFixed(2)}</h3>
      <h3>Final Amount: ₹{finalAmount.toFixed(2)}</h3>
      <button onClick={handleFinalize}>Finalize Bill</button>
    </div>
  );
};

export default FinalizeBill;
