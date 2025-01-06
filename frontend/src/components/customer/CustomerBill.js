import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/CustomerBill.css";

const CustomerBill = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, bill: null });
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(1);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost/turbotunes/backend/api/billing.php",
        { action: "fetch_bills", user_id: user.user_id }
      );
      setBills(response.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Failed to fetch bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedBill) {
      alert("Please select a bill to pay.");
      return;
    }

    try {
      await axios.post("http://localhost/turbotunes/backend/api/billing.php", {
        action: "make_payment",
        bill_id: selectedBill.bill_id,
        payment_method: paymentMethod,
        amount: selectedBill.total_cost,
      });

      alert("Payment successful!");
      fetchBills(); // Refresh bills
      setSelectedBill(null); // Reset selection
      setPaymentMethod("Card");
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Payment failed. Please try again.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!rating || !review) {
      alert("Please provide a rating and review.");
      return;
    }
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post("http://localhost/turbotunes/backend/api/reviews.php", {
        action: "add_review",
        user_id: user.user_id, // Send user_id from localStorage
        booking_id: reviewModal.bill.booking_id, // Send booking_id
        rating,
        review,
      });
  
      alert("Thank you for your review!");
      setReview("");
      setRating(1);
      setReviewModal({ open: false, bill: null });
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };
  

  return (
    <div className="customer-bill">
      <h2>Your Bills</h2>
      {loading ? (
        <p>Loading bills...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : bills.length === 0 ? (
        <p>No bills available.</p>
      ) : (
        <div>
          <ul>
          {bills.map((bill) => {
            const totalCost = parseFloat(bill.total_cost) || 0; // Ensure it's a number
            return (
              <li key={bill.bill_id}>
                <p>
                  <strong>Booking ID:</strong> {bill.booking_id}
                </p>
                <p>
                  <strong>Total Cost:</strong> ₹{totalCost.toFixed(2)}
                </p>
                <p>
                  <strong>Service:</strong> {bill.service_name}
                </p>
                <p>
                  <strong>Vehicle:</strong> {bill.vehicle_details}
                </p>
                <p>
                  <strong>Mechanic:</strong> {bill.mechanic_name} ({bill.mechanic_contact})
                </p>
                <p>
                  <strong>Garage:</strong> {bill.garage_name}
                </p>
                <p>
                  <strong>Booking Date:</strong> {bill.booking_date}
                </p>
                <p>
                  <strong>Status:</strong> {bill.payment_status || "Pending"}
                </p>
                {!bill.payment_status && (
                  <button onClick={() => setSelectedBill(bill)}>Pay Now</button>
                )}
                {bill.payment_status === "Success" && (
                  <>
                    <button
                      onClick={() =>
                        alert("Download Invoice feature will generate a PDF.")
                      }
                    >
                      Download Invoice
                    </button>
                    {/* Show "Review & Rate" button only if the user hasn't reviewed */}
                    {!bill.has_reviewed && (
                      <button
                        onClick={() => setReviewModal({ open: true, bill })}
                      >
                        Review & Rate
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
          </ul>

          {/* Payment Modal */}
          {selectedBill && (
            <div className="payment-modal">
              <h3>Make Payment</h3>
              <p>
                <strong>Bill ID:</strong> {selectedBill.bill_id}
              </p>
              <p>
                <strong>Total Cost:</strong> ₹
                {parseFloat(selectedBill.total_cost || 0).toFixed(2)}
              </p>
              <label>Select Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
              <button onClick={handlePayment}>Confirm Payment</button>
              <button onClick={() => setSelectedBill(null)}>Cancel</button>
            </div>
          )}

          {/* Review & Rating Modal */}
          {reviewModal.open && (
            <div className="review-modal">
              <h3>Review & Rate</h3>
              <p>
                <strong>Service:</strong> {reviewModal.bill.service_name}
              </p>
              <p>
                <strong>Mechanic:</strong> {reviewModal.bill.mechanic_name}
              </p>
              <label>Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <label>Review:</label>
              <textarea
                rows="4"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
              <button onClick={handleReviewSubmit}>Submit Review</button>
              <button
                className="cancel"
                onClick={() => setReviewModal({ open: false, bill: null })}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerBill;
