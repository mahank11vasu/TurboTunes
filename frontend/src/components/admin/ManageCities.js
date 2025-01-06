import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageCities.css";

const ManageCities = () => {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [newCity, setNewCity] = useState({ name: "", state_id: "" });
  const [editCity, setEditCity] = useState(null);

  // Fetch cities and states on component load
  useEffect(() => {
    fetchCities();
    fetchStates();
  }, []);

  const fetchCities = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/cities.php?action=fetch")
      .then((response) => setCities(response.data))
      .catch((error) => console.error("Error fetching cities:", error));
  };

  const fetchStates = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/states.php?action=fetch")
      .then((response) => setStates(response.data))
      .catch((error) => console.error("Error fetching states:", error));
  };

  // Add a new city and refresh the cities list
    const handleAddCity = () => {
    if (newCity.name && newCity.state_id) {
      axios
        .post("http://localhost/turbotunes/backend/api/cities.php?action=add", newCity)
        .then(() => {
          setNewCity({ name: "", state_id: "" }); // Clear input fields
          fetchCities(); // Re-fetch the updated list of cities
        })
        .catch((error) => console.error("Error adding city:", error));
    }
  };

  // Update city
  const handleUpdateCity = () => {
    if (editCity.name && editCity.state_id) {
      axios
        .post("http://localhost/turbotunes/backend/api/cities.php?action=update", editCity)
        .then(() => {
          setCities(
            cities.map((city) =>
              city.city_id === editCity.city_id ? editCity : city
            )
          );
          setEditCity(null);
        })
        .catch((error) => console.error("Error updating city:", error));
    }
  };

  // Delete city
  const handleDeleteCity = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/cities.php?action=delete", { id })
      .then(() => setCities(cities.filter((city) => city.city_id !== id)))
      .catch((error) => console.error("Error deleting city:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Cities</h2>

      {/* Add City */}
      <div className="form-group">
        <input
          type="text"
          placeholder="City Name"
          value={newCity.name}
          onChange={(e) =>
            setNewCity({ ...newCity, name: e.target.value })
          }
        />
        <select
          value={newCity.state_id}
          onChange={(e) =>
            setNewCity({ ...newCity, state_id: e.target.value })
          }
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.state_id} value={state.state_id}>
              {state.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddCity}>Add City</button>
      </div>

      {/* Cities List */}
      <ul className="state-list">
        {cities.map((city) => (
          <li key={city.city_id} className="state-item">
            {editCity && editCity.city_id === city.city_id ? (
              <>
                <input
                  type="text"
                  value={editCity.name}
                  onChange={(e) =>
                    setEditCity({ ...editCity, name: e.target.value })
                  }
                />
                <select
                  value={editCity.state_id}
                  onChange={(e) =>
                    setEditCity({ ...editCity, state_id: e.target.value })
                  }
                >
                  {states.map((state) => (
                    <option key={state.state_id} value={state.state_id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <div className="actions">
                  <button onClick={handleUpdateCity}>Save</button>
                  <button onClick={() => setEditCity(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {city.city_name} ({city.state_name})
                <div className="actions">
                  <button
                    onClick={() =>
                      setEditCity({
                        city_id: city.city_id,
                        name: city.city_name,
                        state_id: city.state_id,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCity(city.city_id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageCities;
