import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Appointments from "../components/mechanic/Appointments";
import MechanicNotifications from "../components/mechanic/MechanicNotifications";
import ServiceHistory from "../components/mechanic/ServiceHistory";
import ActiveBookings from "../components/mechanic/ActiveBookings";
import PartsUsage from "../components/mechanic/PartsUsage"; 
import FinalizeBill from "../components/mechanic/FinalizeBill";
import ManagePayment from "../components/mechanic/MechanicPaymentVerification";
import Reviews from "../components/mechanic/MechanicReviews";


import "../styles/MechanicPage.css";

const MechanicPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Mechanic") {
      alert("Unauthorized access. Redirecting to login.");
      navigate("/auth");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <Appointments />;
      case "notifications":
        return <MechanicNotifications/>
      case "active_bookings":
        return <ActiveBookings />;
      case "parts_usage":
        return <PartsUsage />; 
      case "finalize_bill":
        return <FinalizeBill />;
      case "payment":
        return <ManagePayment/>; 
      case "service_history":
        return <ServiceHistory />;
      case "reviews":
        return <Reviews/>;
      default:
        return <Appointments />;
    }
  };

  return (
    <div className="mechanic-page">
      <aside className="mechanic-sidebar">
        <button onClick={() => setActiveTab("appointments")}>Appointments</button>
        <button onClick={() => setActiveTab("notifications")}>Notifications</button>
        <button onClick={() => setActiveTab("active_bookings")}>Active Bookings</button>
        <button onClick={() => setActiveTab("parts_usage")}>Log Parts</button>
        <button onClick={() => setActiveTab("finalize_bill")}>Finalize Bill</button>
        <button onClick={() => setActiveTab("payment")}>Manage Payment</button>
        <button onClick={() => setActiveTab("service_history")}>Service History</button>
        <button onClick={() => setActiveTab("reviews")}>Reviews</button>
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main className="mechanic-content">{renderContent()}</main>
    </div>
  );
};

export default MechanicPage;
