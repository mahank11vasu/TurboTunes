import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/ManageVehicleCategories.css";

const ManageVehicleCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState(null);

  // Fetch categories on component load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=fetch")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  };

  // Add a new category
  const handleAddCategory = () => {
    if (newCategory.name.trim() && newCategory.description.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=add", newCategory)
        .then((response) => {
          setCategories([...categories, response.data]); // Append new category
          setNewCategory({ name: "", description: "" }); // Clear inputs
        })
        .catch((error) => console.error("Error adding category:", error));
    }
  };

  // Update category
  const handleUpdateCategory = () => {
    if (editCategory.name.trim() && editCategory.description.trim()) {
      axios
        .post("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=update", editCategory)
        .then(() => {
          fetchCategories(); // Refresh categories
          setEditCategory(null); // Exit edit mode
        })
        .catch((error) => console.error("Error updating category:", error));
    }
  };

  // Delete category
  const handleDeleteCategory = (id) => {
    axios
      .post("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=delete", { id })
      .then(() => setCategories(categories.filter((cat) => cat.category_id !== id)))
      .catch((error) => console.error("Error deleting category:", error));
  };

  return (
    <div className="manage-section">
      <h2>Manage Vehicle Categories</h2>

      {/* Add Category */}
      <div className="form-group">
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
        />
        <button onClick={handleAddCategory}>Add Category</button>
      </div>

      {/* Categories List */}
      <ul className="state-list">
        {categories.map((category) => (
          <li key={category.category_id} className="state-item">
            {editCategory && editCategory.category_id === category.category_id ? (
              <>
                <input
                  type="text"
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                />
                <input
                  type="text"
                  value={editCategory.description}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, description: e.target.value })
                  }
                />
                <div className="action-buttons">
                  <button onClick={handleUpdateCategory}>Save</button>
                  <button onClick={() => setEditCategory(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {category.name}: {category.description}
                <div className="action-buttons">
                  <button
                    onClick={() =>
                      setEditCategory({
                        category_id: category.category_id,
                        name: category.name,
                        description: category.description,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCategory(category.category_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageVehicleCategories;
