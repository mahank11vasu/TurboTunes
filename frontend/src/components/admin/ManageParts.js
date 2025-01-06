import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageParts.css";

const ManageParts = () => {
  const [parts, setParts] = useState([]);
  const [newPart, setNewPart] = useState({ name: "", cost: "", stock: "", description: "" });
  const [editPart, setEditPart] = useState(null);

  // Fetch parts on component load
  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/parts.php?action=fetch")
      .then((response) => setParts(response.data))
      .catch((error) => console.error("Error fetching parts:", error));
  };

  // Add a new part
  const handleAddPart = () => {
    if (newPart.name && newPart.cost && newPart.stock && newPart.description) {
      axios
        .post("http://localhost/turbotunes/backend/api/parts.php?action=add", newPart)
        .then(() => {
          fetchParts(); // Refresh the parts list
          setNewPart({ name: "", cost: "", stock: "", description: "" }); // Clear inputs
        })
        .catch((error) => console.error("Error adding part:", error));
    }
  };

  // Update part
  const handleUpdatePart = () => {
    if (editPart.name && editPart.cost && editPart.stock && editPart.description) {
      axios
        .post("http://localhost/turbotunes/backend/api/parts.php?action=update", editPart)
        .then(() => {
          fetchParts(); // Refresh the parts list
          setEditPart(null); // Exit edit mode
        })
        .catch((error) => console.error("Error updating part:", error));
    }
  };

  // Delete part
  const handleDeletePart = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/parts.php?action=delete", { id })
      .then(() => fetchParts()) // Refresh the parts list
      .catch((error) => console.error("Error deleting part:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Parts</h2>

      {/* Add Part */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Part Name"
          value={newPart.name}
          onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Cost"
          value={newPart.cost}
          onChange={(e) => setNewPart({ ...newPart, cost: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={newPart.stock}
          onChange={(e) => setNewPart({ ...newPart, stock: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newPart.description}
          onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
        />
        <button onClick={handleAddPart}>Add Part</button>
      </div>

      {/* Parts List */}
      <ul className="state-list">
        {parts.map((part) => (
            <li key={part.part_id} className="state-item">
            {editPart && editPart.part_id === part.part_id ? (
                <>
                <div className="edit-inputs">
                    <input
                    type="text"
                    value={editPart.name}
                    onChange={(e) => setEditPart({ ...editPart, name: e.target.value })}
                    placeholder="Part Name"
                    />
                    <input
                    type="number"
                    value={editPart.cost}
                    onChange={(e) => setEditPart({ ...editPart, cost: e.target.value })}
                    placeholder="Cost"
                    />
                    <input
                    type="number"
                    value={editPart.stock}
                    onChange={(e) => setEditPart({ ...editPart, stock: e.target.value })}
                    placeholder="Stock"
                    />
                    <input
                    type="text"
                    value={editPart.description}
                    onChange={(e) =>
                        setEditPart({ ...editPart, description: e.target.value })
                    }
                    placeholder="Description"
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleUpdatePart}>Save</button>
                    <button onClick={() => setEditPart(null)}>Cancel</button>
                </div>
                </>
            ) : (
                <>
                <span>
                    {part.name} (₹{part.cost}) - Stock: {part.stock} - {part.description}
                </span>
                <div className="button-group">
                    <button
                    onClick={() =>
                        setEditPart({
                        part_id: part.part_id,
                        name: part.name,
                        cost: part.cost,
                        stock: part.stock,
                        description: part.description,
                        })
                    }
                    >
                    Edit
                    </button>
                    <button onClick={() => handleDeletePart(part.part_id)}>Delete</button>
                </div>
                </>
            )}
            </li>
        ))}
        </ul>
    </div>
  );
};

export default ManageParts;
