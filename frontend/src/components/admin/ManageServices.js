import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageServices.css";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    base_cost: "",
  });
  const [editService, setEditService] = useState(null);

  // Fetch services on component load
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/services.php?action=fetch")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("Error fetching services:", error));
  };

  const handleAddService = () => {
    if (newService.name && newService.description && newService.base_cost) {
      axios
        .post("http://localhost/turbotunes/backend/api/services.php?action=add", newService)
        .then((response) => {
          setServices([...services, response.data]);
          setNewService({ name: "", description: "", base_cost: "" });
        })
        .catch((error) => console.error("Error adding service:", error));
    }
  };

  const handleUpdateService = () => {
    if (editService.name && editService.description && editService.base_cost) {
      axios
        .post(
          "http://localhost/turbotunes/backend/api/services.php?action=update",
          editService
        )
        .then(() => {
          setServices(
            services.map((service) =>
              service.service_id === editService.service_id ? editService : service
            )
          );
          setEditService(null);
        })
        .catch((error) => console.error("Error updating service:", error));
    }
  };

  const handleDeleteService = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/services.php?action=delete", { id })
      .then(() => setServices(services.filter((service) => service.service_id !== id)))
      .catch((error) => console.error("Error deleting service:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Services</h2>

      {/* Add Service */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Service Name"
          value={newService.name}
          onChange={(e) =>
            setNewService({ ...newService, name: e.target.value })
          }
        />
        <textarea
          placeholder="Service Description"
          value={newService.description}
          onChange={(e) =>
            setNewService({ ...newService, description: e.target.value })
          }
        ></textarea>
        <input
          type="number"
          placeholder="Base Cost"
          value={newService.base_cost}
          onChange={(e) =>
            setNewService({ ...newService, base_cost: e.target.value })
          }
        />
        <button onClick={handleAddService}>Add Service</button>
      </div>

      {/* Services List */}
      <ul className="state-list">
        {services.map((service) => (
          <li key={service.service_id} className="state-item">
            {editService && editService.service_id === service.service_id ? (
              <>
                <input
                  type="text"
                  value={editService.name}
                  onChange={(e) =>
                    setEditService({ ...editService, name: e.target.value })
                  }
                />
                <textarea
                  value={editService.description}
                  onChange={(e) =>
                    setEditService({ ...editService, description: e.target.value })
                  }
                ></textarea>
                <input
                  type="number"
                  value={editService.base_cost}
                  onChange={(e) =>
                    setEditService({ ...editService, base_cost: e.target.value })
                  }
                />
                <button onClick={handleUpdateService}>Save</button>
                <button onClick={() => setEditService(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <strong>{service.name}</strong> - {service.description} (
                  ₹{service.base_cost})
                </div>
                <button
                  onClick={() =>
                    setEditService({
                      service_id: service.service_id,
                      name: service.name,
                      description: service.description,
                      base_cost: service.base_cost,
                    })
                  }
                >
                  Edit
                </button>
                <button onClick={() => handleDeleteService(service.service_id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageServices;
