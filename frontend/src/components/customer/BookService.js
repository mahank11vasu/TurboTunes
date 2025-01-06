import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/BookService.css";

const BookService = () => {
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [bookingData, setBookingData] = useState({
    vehicle_id: "",
    service_id: "",
    mechanic_id: "",
    booking_date: "",
    pick_up_location: "",
    drop_off_location: "",
  });
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchServices();
      fetchAddresses();
    } else {
      alert("Unauthorized access. Please login.");
    }
  }, []);

  const fetchVehicles = () => {
    axios
      .get(`http://localhost/turbotunes/backend/api/getVehicles.php?user_id=${user.user_id}`)
      .then((response) => setVehicles(response.data))
      .catch((error) => console.error("Error fetching vehicles:", error));
  };

  const fetchServices = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/services.php?action=fetch")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("Error fetching services:", error));
  };

  const fetchAddresses = () => {
    axios
      .get(`http://localhost/turbotunes/backend/api/getAddresses.php?user_id=${user.user_id}`)
      .then((response) => setAddresses(response.data))
      .catch((error) => console.error("Error fetching addresses:", error));
  };

  const fetchMechanics = (city_id) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/getMechanics.php?city_id=${city_id}`)
      .then((response) => setMechanics(response.data))
      .catch((error) => console.error("Error fetching mechanics:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));

    if (name === "pick_up_location") {
      // If the user selects an address, fetch mechanics for that city
      const selectedAddress = addresses.find((addr) => addr.address_id === parseInt(value));
      if (selectedAddress) {
        fetchMechanics(selectedAddress.city_id);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost/turbotunes/backend/api/manageBookings.php", {
        ...bookingData,
        user_id: user.user_id,
        action: "add",
      })
      .then(() => {
        alert("Service booked successfully!");
        setBookingData({
          vehicle_id: "",
          service_id: "",
          mechanic_id: "",
          booking_date: "",
          pick_up_location: "",
          drop_off_location: "",
        });
      })
      .catch((error) => console.error("Error booking service:", error))
      .finally(() => setLoading(false));
  };

  return (
    <div className="book-service">
      <h2>Book New Service</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Select Vehicle:
          <select
            name="vehicle_id"
            value={bookingData.vehicle_id}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Vehicle--</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </option>
            ))}
          </select>
        </label>
        <label>
          Select Service:
          <select
            name="service_id"
            value={bookingData.service_id}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Service--</option>
            {services.map((service) => (
              <option key={service.service_id} value={service.service_id}>
                {service.name} - ₹{service.base_cost}
              </option>
            ))}
          </select>
        </label>
        <label>
          Booking Date:
          <input
            type="date"
            name="booking_date"
            value={bookingData.booking_date}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Pick-Up Location:
          <select
            name="pick_up_location"
            value={bookingData.pick_up_location}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Pick-Up Location--</option>
            {addresses.map((address) => (
              <option key={address.address_id} value={address.address_id}>
                {address.street_address}
              </option>
            ))}
          </select>
        </label>
        <label>
          Drop-Off Location:
          <select
            name="drop_off_location"
            value={bookingData.drop_off_location}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Drop-Off Location--</option>
            {addresses.map((address) => (
              <option key={address.address_id} value={address.address_id}>
                {address.street_address}
              </option>
            ))}
          </select>
        </label>
        <label>
          Select Mechanic:
          <select
            name="mechanic_id"
            value={bookingData.mechanic_id}
            onChange={handleInputChange}
            required
          >
            <option value="">--Select Mechanic--</option>
            {mechanics.map((mechanic) => (
              <option key={mechanic.mechanic_id} value={mechanic.mechanic_id}>
                {mechanic.mechanic_name} - {mechanic.category} ({mechanic.average_rating}⭐)
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Book Service"}
        </button>
      </form>
    </div>
  );
};

export default BookService;
