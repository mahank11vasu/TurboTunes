import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/MechanicPaymentVerification.css";

const MechanicPaymentVerification = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMechanicId();
  }, []);

  const fetchMechanicId = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost/turbotunes/backend/api/billing.php", {
        action: "fetch_mechanic_id",
        user_id: user.user_id,
      });
      setMechanicId(response.data.mechanic_id);
      fetchPendingPayments(response.data.mechanic_id);
      fetchCompletedPayments(response.data.mechanic_id);
    } catch (err) {
      console.error("Error fetching mechanic ID:", err);
      setError("Failed to fetch mechanic ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async (mechanicId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost/turbotunes/backend/api/billing.php", {
        action: "fetch_pending_payments",
        mechanic_id: mechanicId,
      });
      setPendingPayments(response.data);
    } catch (err) {
      console.error("Error fetching pending payments:", err);
      setError("Failed to fetch payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPayments = async (mechanicId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost/turbotunes/backend/api/billing.php", {
        action: "fetch_completed_payments",
        mechanic_id: mechanicId,
      });
      setCompletedPayments(response.data);
    } catch (err) {
      console.error("Error fetching completed payments:", err);
      setError("Failed to fetch completed payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (transactionId, status) => {
    try {
      await axios.post("http://localhost/turbotunes/backend/api/billing.php", {
        action: "update_payment_status",
        transaction_id: transactionId,
        payment_status: status,
        mechanic_id: mechanicId,
      });

      alert("Payment status updated successfully!");
      fetchPendingPayments(mechanicId);
      fetchCompletedPayments(mechanicId);
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert("Failed to update payment status. Please try again.");
    }
  };

  return (
    <div className="payment-verification">
      <h2>Verify Payments</h2>
      {loading ? (
        <p>Loading payments...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div>
          <h3>Pending Payments</h3>
          {pendingPayments.length === 0 ? (
            <p>No pending payments.</p>
          ) : (
            <ul>
              {pendingPayments.map((payment) => (
                <li key={payment.transaction_id}>
                  <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
                  <p><strong>Bill ID:</strong> {payment.bill_id}</p>
                  <p><strong>Amount:</strong> ₹{parseFloat(payment.amount).toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {payment.payment_method}</p>
                  <p><strong>Customer:</strong> {payment.customer_name} ({payment.customer_contact})</p>
                  <p><strong>Vehicle:</strong> {payment.vehicle_details}</p>
                  <p><strong>Service:</strong> {payment.service_name}</p>
                  <button onClick={() => updatePaymentStatus(payment.transaction_id, "Success")}>
                    Mark as Success
                  </button>
                  <button onClick={() => updatePaymentStatus(payment.transaction_id, "Failed")}>
                    Mark as Failed
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3>Completed Payments</h3>
          {completedPayments.length === 0 ? (
            <p>No completed payments.</p>
          ) : (
            <ul>
              {completedPayments.map((payment) => (
                <li key={payment.transaction_id}>
                  <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
                  <p><strong>Bill ID:</strong> {payment.bill_id}</p>
                  <p><strong>Amount:</strong> ₹{parseFloat(payment.amount).toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {payment.payment_method}</p>
                  <p><strong>Status:</strong> {payment.payment_status}</p>
                  <p><strong>Customer:</strong> {payment.customer_name} ({payment.customer_contact})</p>
                  <p><strong>Vehicle:</strong> {payment.vehicle_details}</p>
                  <p><strong>Service:</strong> {payment.service_name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MechanicPaymentVerification;
