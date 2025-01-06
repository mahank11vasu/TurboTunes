import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ActiveBookings.css";

const ActiveBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

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
          fetchActiveBookings(response.data.mechanic_id); // Fetch bookings after mechanic ID is retrieved
        } else {
          console.error("Mechanic ID not found in response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mechanic ID:", error));
  };

  const fetchActiveBookings = (mechanicId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_active_bookings&mechanic_id=${mechanicId}`)
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching active bookings:", error));
  };

  const fetchBookingDetails = (bookingId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_booking_details&booking_id=${bookingId}`)
      .then((response) => setBookingDetails(response.data))
      .catch((error) => console.error("Error fetching booking details:", error));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    fetchBookingDetails(booking.booking_id); // Fetch detailed information for the selected booking
  };

  return (
    <div className="active-bookings">
      <h2>Active Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.customer_name}</td>
                <td>{booking.vehicle_details}</td>
                <td>{booking.status}</td>
                <td>
                  <button onClick={() => handleViewDetails(booking)}>Details</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No active bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedBooking && bookingDetails && (
        <div className="booking-details">
          <h3>Booking Details</h3>
          <p>
            <strong>Booking ID:</strong> {bookingDetails.booking_id}
          </p>
          <p>
            <strong>Customer:</strong> {bookingDetails.customer_name} ({bookingDetails.contact})
          </p>
          <p>
            <strong>Vehicle:</strong> {bookingDetails.vehicle_details}
          </p>
          <p>
            <strong>Service:</strong> {bookingDetails.service_name}
          </p>
          <p>
            <strong>Status:</strong> {bookingDetails.status}
          </p>
          {bookingDetails.parts_used && (
            <div>
              <h4>Parts Used</h4>
              <ul>
                {bookingDetails.parts_used.map((part) => (
                  <li key={part.part_id}>
                    {part.name} - Quantity: {part.quantity}, Cost: ₹{part.cost}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <button onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveBookings;
