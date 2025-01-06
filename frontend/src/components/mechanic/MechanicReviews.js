import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/MechanicReviews.css";

const MechanicReviews = () => {
  const [mechanicId, setMechanicId] = useState(null); // State for mechanic ID
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMechanicId(); // Fetch the mechanic ID on component load
  }, []);

  const fetchMechanicId = async () => {
    const user = JSON.parse(localStorage.getItem("user")); // Logged-in user data
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/reviews.php",
        { action: "fetch_mechanic_id", user_id: user.user_id } // Send user_id to fetch mechanic_id
      );

      if (response.data && response.data.mechanic_id) {
        setMechanicId(response.data.mechanic_id);
        fetchReviews(response.data.mechanic_id); // Fetch reviews after getting mechanic ID
      } else {
        setError("Mechanic ID not found. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching mechanic ID:", err);
      setError("Failed to fetch mechanic ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (mechanicId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/reviews.php",
        { action: "fetch_mechanic_reviews", mechanic_id: mechanicId }
      );
      setReviews(response.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to fetch reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mechanic-reviews">
      <h2>Customer Reviews</h2>
      {loading ? (
        <p>Loading reviews...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.review_id}>
              <p><strong>Customer:</strong> {review.customer_name}</p>
              <p><strong>Service:</strong> {review.service_name}</p>
              <p><strong>Vehicle:</strong> {review.vehicle_details}</p>
              <p><strong>Rating:</strong> {review.rating} Star{review.rating > 1 ? "s" : ""}</p>
              <p><strong>Review:</strong> {review.review}</p>
              <p><strong>Date:</strong> {new Date(review.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MechanicReviews;
