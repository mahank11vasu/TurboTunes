import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageBookings.css";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [updatedLocations, setUpdatedLocations] = useState({
    pick_up_location: "",
    drop_off_location: "",
  });
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      alert("Unauthorized access. Please login.");
    }
  }, []);

  const fetchBookings = () => {
    axios
      .get(`http://localhost/turbotunes/backend/api/manageBookingsnew.php?action=get&user_id=${user.user_id}`)
      .then((response) => setBookings(response.data))
      .catch((error) => console.error("Error fetching bookings:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedLocations((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking.booking_id);
    setUpdatedLocations({
      pick_up_location: booking.pick_up_address || "", // Use the address from backend
      drop_off_location: booking.drop_off_address || "",
    });
  };

  const handleSave = (booking_id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/manageBookingsnew.php", {
        action: "update",
        booking_id,
        pick_up_location: updatedLocations.pick_up_location,
        drop_off_location: updatedLocations.drop_off_location,
        user_id: user.user_id, // Pass user_id for new address insertion if needed
      })
      .then(() => {
        alert("Booking updated successfully!");
        fetchBookings();
        setEditingBooking(null);
      })
      .catch((error) => console.error("Error updating booking:", error));
  };

  const handleCancel = (booking_id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      axios
        .post("http://localhost/turbotunes/backend/api/manageBookingsnew.php", {
          action: "cancel",
          booking_id,
        })
        .then(() => {
          alert("Booking canceled successfully!");
          fetchBookings();
        })
        .catch((error) => console.error("Error canceling booking:", error));
    }
  };

  return (
    <div className="manage-bookings">
      <h2>Manage Your Bookings</h2>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Mechanic</th>
            <th>Booking Date</th>
            <th>Pick-Up Location</th>
            <th>Drop-Off Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.booking_id}>
              <td>{booking.vehicle_details}</td>
              <td>{booking.service_name}</td>
              <td>{booking.mechanic_name || "Not Assigned"}</td>
              <td>{booking.booking_date}</td>
              <td>
                {editingBooking === booking.booking_id ? (
                  <input
                    type="text"
                    name="pick_up_location"
                    value={updatedLocations.pick_up_location}
                    onChange={handleInputChange}
                  />
                ) : (
                  booking.pick_up_address // Display address instead of ID
                )}
              </td>
              <td>
                {editingBooking === booking.booking_id ? (
                  <input
                    type="text"
                    name="drop_off_location"
                    value={updatedLocations.drop_off_location}
                    onChange={handleInputChange}
                  />
                ) : (
                  booking.drop_off_address // Display address instead of ID
                )}
              </td>
              <td>{booking.status}</td>
              <td>
                {editingBooking === booking.booking_id ? (
                  <>
                    <button onClick={() => handleSave(booking.booking_id)}>Save</button>
                    <button onClick={() => setEditingBooking(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {booking.status === "Pending" && (
                      <>
                        <button onClick={() => handleEdit(booking)}>Edit</button>
                        <button onClick={() => handleCancel(booking.booking_id)}>Cancel</button>
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBookings;
