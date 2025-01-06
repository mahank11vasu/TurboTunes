import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageServiceParts.css";

const ManageServiceParts = () => {
  const [serviceParts, setServiceParts] = useState([]);
  const [newServicePart, setNewServicePart] = useState({ service_id: "", part_id: "" });
  const [editServicePart, setEditServicePart] = useState(null);
  const [services, setServices] = useState([]);
  const [parts, setParts] = useState([]);

  // Fetch service parts, services, and parts on component load
  useEffect(() => {
    fetchServiceParts();
    fetchServices();
    fetchParts();
  }, []);

  const fetchServiceParts = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/service_parts.php?action=fetch")
      .then((response) => setServiceParts(response.data))
      .catch((error) => console.error("Error fetching service parts:", error));
  };

  const fetchServices = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/services.php?action=fetch")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("Error fetching services:", error));
  };

  const fetchParts = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/parts.php?action=fetch")
      .then((response) => setParts(response.data))
      .catch((error) => console.error("Error fetching parts:", error));
  };

  // Add a new service part
  const handleAddServicePart = () => {
    if (newServicePart.service_id && newServicePart.part_id) {
      axios
        .post("http://localhost/turbotunes/backend/api/service_parts.php?action=add", newServicePart)
        .then(() => {
          fetchServiceParts(); // Refresh service parts
          setNewServicePart({ service_id: "", part_id: "" }); // Clear inputs
        })
        .catch((error) => console.error("Error adding service part:", error));
    }
  };

  // Delete a service part
  const handleDeleteServicePart = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/service_parts.php?action=delete", { id })
      .then(() => fetchServiceParts()) // Refresh service parts
      .catch((error) => console.error("Error deleting service part:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Service Parts</h2>

      {/* Add Service Part */}
      <div className="form-group">
        <select
          value={newServicePart.service_id}
          onChange={(e) => setNewServicePart({ ...newServicePart, service_id: e.target.value })}
        >
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service.service_id} value={service.service_id}>
              {service.name}
            </option>
          ))}
        </select>
        <select
          value={newServicePart.part_id}
          onChange={(e) => setNewServicePart({ ...newServicePart, part_id: e.target.value })}
        >
          <option value="">Select Part</option>
          {parts.map((part) => (
            <option key={part.part_id} value={part.part_id}>
              {part.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddServicePart}>Add Service Part</button>
      </div>

      {/* Service Parts List */}
      <ul className="state-list">
        {serviceParts.map((sp) => (
          <li key={sp.id} className="state-item">
            <span>
              Service: {sp.service_name}, Part: {sp.part_name}
            </span>
            <div className="button-group">
              <button onClick={() => handleDeleteServicePart(sp.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageServiceParts;
