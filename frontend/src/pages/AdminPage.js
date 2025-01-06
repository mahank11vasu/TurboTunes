import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManageStates from "../components/admin/ManageStates";
import ManageCities from "../components/admin/ManageCities";
import ManageRoles from "../components/admin/ManageRoles";
import ManageVehicleCategories from "../components/admin/ManageVehicleCategories";
import ManageServices from "../components/admin/ManageServices";
import ManageParts from "../components/admin/ManageParts";
import ManageServiceParts from "../components/admin/ManageServiceParts";
import DashboardOverview from "../components/admin/DashboardOverview";
import Analytics from "../components/admin/Analytics";
import "../styles/AdminPage.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Check for admin authorization
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // Fetch user from localStorage
    if (!user || user.role !== "Admin") {
      // If not an admin, redirect to the login or home page
      alert("Unauthorized access. Redirecting to login.");
      navigate("/auth");
    }
  }, [navigate]);

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "states":
        return <ManageStates />;
      case "cities":
        return <ManageCities />;
      case "roles":
        return <ManageRoles />;
      case "vehicle_categories":
        return <ManageVehicleCategories />;
      case "services":
        return <ManageServices />;
      case "parts":
        return <ManageParts />;
      case "service_parts":
        return <ManageServiceParts />;
      case "analytics":
        return <Analytics />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <button className="analytics-btn" onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        {/* Dropdown for Manage Data */}
        <div className="dropdown">
          <button className="dropdown-btn">Manage Data</button>
          <div className="dropdown-content">
            <button onClick={() => setActiveTab("states")}>Manage States</button>
            <button onClick={() => setActiveTab("cities")}>Manage Cities</button>
            <button onClick={() => setActiveTab("roles")}>Manage Roles</button>
            <button onClick={() => setActiveTab("vehicle_categories")}>
              Manage Vehicle Categories
            </button>
            <button onClick={() => setActiveTab("services")}>
              Manage Services
            </button>
            <button onClick={() => setActiveTab("parts")}>Manage Parts</button>
            <button onClick={() => setActiveTab("service_parts")}>
              Manage Service Parts
            </button>
          </div>
        </div>
        <button className="analytics-btn" onClick={() => setActiveTab("analytics")}>
          Analytics
        </button>
        <button className="analytics-btn" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default AdminPage;
