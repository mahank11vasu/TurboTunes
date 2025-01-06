import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/DashboardOverview.css"; // Separate CSS file

const DashboardOverview = () => {
  const [overviewData, setOverviewData] = useState({
    users: 0,
    states: 0,
    cities: 0,
    roles: 0,
    bookings: 0,
  });

  useEffect(() => {
    // Fetch data for the dashboard overview
    axios
      .get("http://localhost/turbotunes/backend/api/overview.php")
      .then((response) => setOverviewData(response.data))
      .catch((error) => console.error("Error fetching overview data:", error));
  }, []);

  return (
    <div className="dashboard-overview">
      <h2>Admin Dashboard</h2>
      <ul>
        <li>Total Users: {overviewData.users}</li>
        <li>Total States: {overviewData.states}</li>
        <li>Total Cities: {overviewData.cities}</li>
        <li>Total Roles: {overviewData.roles}</li>
        <li>Total Bookings: {overviewData.bookings}</li>
      </ul>
    </div>
  );
};

export default DashboardOverview;
