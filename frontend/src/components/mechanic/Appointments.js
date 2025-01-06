import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      fetchMechanicId();
    } else {
      alert("Unauthorized access. Please login.");
    }
  }, []);

  const fetchMechanicId = () => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_mechanic_id&user_id=${user.user_id}`)
      .then((response) => {
        if (response.data.mechanic_id) {
          setMechanicId(response.data.mechanic_id);
          fetchAppointments(response.data.mechanic_id);
        } else {
          console.error("Mechanic ID not found in response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching mechanic ID:", error));
  };

  const fetchAppointments = (mechanicId) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/appointments.php?action=get_bookings&mechanic_id=${mechanicId}`)
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error("Error fetching appointments:", error));
  };

  const handleAccept = (booking_id) => {
    axios
      .post(
        "http://localhost/turbotunes/backend/api/appointments.php?action=update_status",
        {
          booking_id,
          mechanic_id: mechanicId,
          status: "In Progress",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        alert("Booking accepted successfully!");
        fetchAppointments(mechanicId);
      })
      .catch((error) => console.error("Error accepting booking:", error));
  };

  const handleCancel = (booking_id) => {
    axios
      .post(
        "http://localhost/turbotunes/backend/api/appointments.php?action=update_status",
        {
          booking_id,
          mechanic_id: mechanicId,
          status: "Cancelled",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        alert("Booking canceled successfully!");
        fetchAppointments(mechanicId);
      })
      .catch((error) => console.error("Error canceling booking:", error));
  };

  const handleReschedule = (booking_id, newDate) => {
    axios
      .post(
        "http://localhost/turbotunes/backend/api/appointments.php?action=reschedule",
        {
          booking_id,
          mechanic_id: mechanicId,
          new_date: newDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        alert("Booking rescheduled successfully!");
        fetchAppointments(mechanicId);
      })
      .catch((error) => console.error("Error rescheduling booking:", error));
  };

  return (
    <div className="appointments">
      <h2>Your Appointments</h2>
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.booking_id}>
              <td>{appointment.customer_name}</td>
              <td>{appointment.vehicle_details}</td>
              <td>{appointment.service_name}</td>
              <td>{appointment.booking_date}</td>
              <td>{appointment.status}</td>
              <td>
                {appointment.status === "Pending" && (
                  <>
                    <button onClick={() => handleAccept(appointment.booking_id)}>Accept</button>
                    <button onClick={() => handleCancel(appointment.booking_id)}>Cancel</button>
                  </>
                )}
                {appointment.status !== "Cancelled" && (
                  <button
                    onClick={() =>
                      handleReschedule(appointment.booking_id, prompt("Enter new date (YYYY-MM-DD):"))
                    }
                  >
                    Reschedule
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
