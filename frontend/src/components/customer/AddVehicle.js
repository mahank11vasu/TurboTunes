import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/AddVehicle.css";

const AddVehicle = () => {
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleData, setVehicleData] = useState({
    category_id: "",
    make: "",
    model: "",
    year: "",
    registration_number: "",
    ownership_start: "",
    ownership_end: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchVehicles();
    } else {
      alert("Unauthorized access. Please login.");
    }
  }, []);

  const fetchCategories = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=fetch")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const fetchVehicles = () => {
    axios
      .get(`http://localhost/turbotunes/backend/api/getVehicles.php?user_id=${user.user_id}`)
      .then((response) => setVehicles(response.data))
      .catch((error) => console.error("Error fetching vehicles:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    setLoading(true);

    const requestData = { ...vehicleData, user_id: user.user_id };

    if (editingVehicle) requestData.vehicle_id = editingVehicle.vehicle_id;

    axios
      .post("http://localhost/turbotunes/backend/api/manageVehicle.php", {
        ...requestData,
        action: editingVehicle ? "update" : "add",
      })
      .then(() => {
        alert(editingVehicle ? "Vehicle updated successfully!" : "Vehicle added successfully!");
        fetchVehicles();
        handleCancel();
      })
      .catch((error) => console.error("Error saving vehicle:", error))
      .finally(() => setLoading(false));
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleData(vehicle);
  };

  const handleDelete = (vehicle_id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      axios
        .post("http://localhost/turbotunes/backend/api/manageVehicle.php", {
          user_id: user.user_id,
          vehicle_id,
          action: "delete",
        })
        .then(() => {
          alert("Vehicle deleted successfully!");
          fetchVehicles();
        })
        .catch((error) => console.error("Error deleting vehicle:", error));
    }
  };

  const handleCancel = () => {
    setEditingVehicle(null);
    setVehicleData({
      category_id: "",
      make: "",
      model: "",
      year: "",
      registration_number: "",
      ownership_start: "",
      ownership_end: "",
    });
  };

  return (
    <div className="add-vehicle-container">
      <div className="form-card">
        <h2>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
        <form onSubmit={handleSaveVehicle}>
          <label>
            Category:
            <select
              name="category_id"
              value={vehicleData.category_id}
              onChange={handleInputChange}
              required
            >
              <option value="">--Select Category--</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Make:
            <input
              type="text"
              name="make"
              value={vehicleData.make}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Model:
            <input
              type="text"
              name="model"
              value={vehicleData.model}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Year:
            <input
              type="number"
              name="year"
              value={vehicleData.year}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Registration Number:
            <input
              type="text"
              name="registration_number"
              value={vehicleData.registration_number}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Ownership Start:
            <input
              type="date"
              name="ownership_start"
              value={vehicleData.ownership_start}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Ownership End:
            <input
              type="date"
              name="ownership_end"
              value={vehicleData.ownership_end}
              onChange={handleInputChange}
            />
          </label>
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
            </button>
            {editingVehicle && <button type="button" onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="list-card">
        <h3>Your Vehicles</h3>
        <ul>
          {vehicles.map((vehicle) => (
            <li key={vehicle.vehicle_id}>
              {vehicle.make} {vehicle.model} ({vehicle.year})
              <button className="edit-btn" onClick={() => handleEdit(vehicle)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(vehicle.vehicle_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddVehicle;
