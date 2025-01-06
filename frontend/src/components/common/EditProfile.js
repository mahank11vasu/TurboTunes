import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import "../../styles/EditProfile.css";

const EditProfile = () => {
  const { user, login } = useContext(UserContext); // Access UserContext
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [profileData, setProfileData] = useState({
    name: "",
    contact: "",
    dob: "",
    gender: "Other",
    street_address: "",
    state_id: "",
    city_id: "",
    garage_name: "",
    specialization_tags: "",
    category: "",
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);

      // Fetch profile data (common fields for all users)
      axios
        .get(`http://localhost/turbotunes/backend/api/getProfile.php?user_id=${user.user_id}`)
        .then((response) => {
          setProfileData(response.data);
          if (response.data.state_id) fetchCities(response.data.state_id);
        })
        .catch((error) => console.error("Error fetching profile:", error))
        .finally(() => setLoading(false));

      // Fetch states
      axios
        .get("http://localhost/turbotunes/backend/api/states.php?action=fetch")
        .then((response) => setStates(response.data))
        .catch((error) => console.error("Error fetching states:", error));

      // Fetch categories (for mechanics only)
      if (user.role === "Mechanic") {
        axios
          .get("http://localhost/turbotunes/backend/api/vehicle_categories.php?action=fetch")
          .then((response) => setCategories(response.data))
          .catch((error) => console.error("Error fetching categories:", error));
      }
    }
  }, [user]);

  const fetchCities = (state_id) => {
    axios
      .get(`http://localhost/turbotunes/backend/api/cities.php?action=fetchByState&state_id=${state_id}`)
      .then((response) => setCities(response.data))
      .catch((error) => console.error("Error fetching cities:", error));
  };

  const handleStateChange = (state_id) => {
    setProfileData((prev) => ({ ...prev, state_id, city_id: "" })); // Reset city_id
    fetchCities(state_id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = () => {
    axios
      .post("http://localhost/turbotunes/backend/api/updateProfile.php", {
        ...profileData,
        user_id: user.user_id,
      })
      .then((response) => {
        alert("Profile updated successfully!");
        login({ ...user, ...response.data }); // Update UserContext
        setIsEditing(false); // Exit edit mode
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  const cancelChanges = () => {
    setIsEditing(false); // Exit edit mode without saving
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <div className="profile-fields">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Contact:
          <input
            type="text"
            name="contact"
            value={profileData.contact}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={profileData.dob}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Gender:
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          State:
          <select
            name="state_id"
            value={profileData.state_id}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!isEditing}
          >
            <option value="">--Select State--</option>
            {states.map((state) => (
              <option key={state.state_id} value={state.state_id}>
                {state.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          City:
          <select
            name="city_id"
            value={profileData.city_id}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, city_id: e.target.value }))
            }
            disabled={!isEditing}
          >
            <option value="">--Select City--</option>
            {cities.map((city) => (
              <option key={city.city_id} value={city.city_id}>
                {city.name || city.city_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Street Address:
          <textarea
            name="street_address"
            value={profileData.street_address}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>

        {user.role === "Mechanic" && (
        <>
          <label>
            Garage Name:
            <input
              type="text"
              name="garage_name"
              value={profileData.garage_name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </label>
          <label>
            Specialization Tags:
            <textarea
              name="specialization_tags"
              value={profileData.specialization_tags}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </label>
          <label>
            Category:
            <select
              name="category"
              value={profileData.category} // Bind dropdown value to profileData.category
              onChange={(e) => setProfileData((prev) => ({ ...prev, category: e.target.value }))} // Update category on change
              disabled={!isEditing}
            >
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Sports">Sports</option>
              <option value="Electric">Electric</option>
            </select>
          </label>
        </>
      )}
      </div>
      <div className="profile-buttons">
        {isEditing ? (
          <>
            <button type="button" onClick={saveChanges}>
              Save Changes
            </button>
            <button type="button" onClick={cancelChanges}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
