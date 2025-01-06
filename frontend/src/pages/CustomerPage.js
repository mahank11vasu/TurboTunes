import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManageBookings from "../components/customer/ManageBookings";
import Notifications from "../components/customer/Notifications";
import ServiceHistory from "../components/customer/ServiceHistory";
import AddVehicle from "../components/customer/AddVehicle"; 
import BookService from "../components/customer/BookService";
import ManageBills from "../components/customer/CustomerBill";
import "../styles/CustomerPage.css";

const CustomerPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Customer") {
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
      case "manage_bookings":
        return <ManageBookings />;
      case "notifications":
        return <Notifications />;
      case "service_history":
        return <ServiceHistory />;
      case "add_vehicle":
        return <AddVehicle />;
      case "book_service":
        return <BookService />;
      case "bill":
        return <ManageBills />;
      default:
        return <ManageBookings />;
    }
  };

  return (
    <div className="customer-page">
      <aside className="customer-sidebar">
        <button onClick={() => setActiveTab("manage_bookings")}>Manage Bookings</button>
        <button onClick={() => setActiveTab("notifications")}>Notifications</button>
        <button onClick={() => setActiveTab("service_history")}>Service History</button>
        <button onClick={() => setActiveTab("add_vehicle")}>Add Vehicle</button>
        <button onClick={() => setActiveTab("book_service")}>Book New Service</button>
        <button onClick={() => setActiveTab("bill")}>View Bills</button>
        
        
        
        
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main className="customer-content">{renderContent()}</main>
    </div>
  );
};

export default CustomerPage;
