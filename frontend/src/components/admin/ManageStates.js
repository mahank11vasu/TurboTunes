import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageStates.css";

const ManageStates = () => {
  const [states, setStates] = useState([]);
  const [newState, setNewState] = useState("");
  const [editStateId, setEditStateId] = useState(null);
  const [editStateName, setEditStateName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch states from the database
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/states.php?action=fetch")
      .then((response) => {
        setStates(response.data);
      })
      .catch((error) => {
        console.error("Error fetching states:", error);
      });
  };

  // Add a new state
  const handleAddState = () => {
    if (newState.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/states.php?action=add", { name: newState })
        .then((response) => {
          setStates([...states, response.data]);
          setFeedback("State added successfully!");
          setNewState("");
        })
        .catch((error) => {
          console.error("Error adding state:", error);
          setFeedback("Failed to add state.");
        });
    }
  };

  // Edit an existing state
  const handleEditState = (id, name) => {
    setEditStateId(id);
    setEditStateName(name);
    setFeedback("");
  };

  const handleUpdateState = () => {
    if (editStateName.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/states.php?action=update", { id: editStateId, name: editStateName })
        .then(() => {
          setStates(
            states.map((state) =>
              state.state_id === editStateId ? { ...state, name: editStateName } : state
            )
          );
          setEditStateId(null);
          setEditStateName("");
          setFeedback("State updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating state:", error);
          setFeedback("Failed to update state.");
        });
    }
  };

  // Delete a state
  const handleDeleteState = (id) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      axios
        .post("http://localhost/turbotunes/backend/api/states.php?action=delete", { id })
        .then(() => {
          setStates(states.filter((state) => state.state_id !== id));
          setFeedback("State deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting state:", error);
          setFeedback("Failed to delete state.");
        });
    }
  };

  // Filter states based on search term
  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-section">
      <h2>Manage States</h2>

      {/* Feedback Message */}
      {feedback && <p className="feedback">{feedback}</p>}

      {/* Add State */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter state name"
          value={newState}
          onChange={(e) => setNewState(e.target.value)}
        />
        <button onClick={handleAddState} disabled={!newState.trim()}>
          Add State
        </button>
      </div>

      {/* Search Bar */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Search states"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* States List */}
      <ul className="state-list">
        {filteredStates.map((state) => (
          <li key={state.state_id} className="state-item">
            {editStateId === state.state_id ? (
              <>
                <input
                  type="text"
                  value={editStateName}
                  onChange={(e) => setEditStateName(e.target.value)}
                />
                <button onClick={handleUpdateState}>Save</button>
                <button onClick={() => setEditStateId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{state.name}</span>
                <div className="actions">
                  <button onClick={() => handleEditState(state.state_id, state.name)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteState(state.state_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageStates;
