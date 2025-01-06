import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageRoles.css";

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [editRole, setEditRole] = useState(null);

  // Fetch roles on component load
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/roles.php?action=fetch")
      .then((response) => setRoles(response.data))
      .catch((error) => console.error("Error fetching roles:", error));
  };

  // Add a new role
  const handleAddRole = () => {
    if (newRole.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/roles.php?action=add", { role_name: newRole })
        .then((response) => {
          setRoles([...roles, response.data]); // Append the new role
          setNewRole(""); // Clear input
        })
        .catch((error) => console.error("Error adding role:", error));
    }
  };

  // Update a role
  const handleUpdateRole = () => {
    if (editRole.role_name.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/roles.php?action=update", editRole)
        .then(() => {
          fetchRoles(); // Refresh roles
          setEditRole(null); // Exit edit mode
        })
        .catch((error) => console.error("Error updating role:", error));
    }
  };

  // Delete a role
  const handleDeleteRole = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/roles.php?action=delete", { id })
      .then(() => setRoles(roles.filter((role) => role.role_id !== id)))
      .catch((error) => console.error("Error deleting role:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Roles</h2>

      {/* Add Role */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter role name"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button onClick={handleAddRole}>Add Role</button>
      </div>

      {/* Roles List */}
      <ul className="state-list">
        {roles.map((role) => (
          <li key={role.role_id} className="state-item">
            {editRole && editRole.role_id === role.role_id ? (
              <>
                <input
                  type="text"
                  value={editRole.role_name}
                  onChange={(e) =>
                    setEditRole({ ...editRole, role_name: e.target.value })
                  }
                />
                <div className="action-buttons">
                  <button onClick={handleUpdateRole}>Save</button>
                  <button onClick={() => setEditRole(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <span>{role.role_name}</span>
                <div className="action-buttons">
                  <button
                    onClick={() =>
                      setEditRole({ role_id: role.role_id, role_name: role.role_name })
                    }
                  >
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteRole(role.role_id)}>
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

export default ManageRoles;
