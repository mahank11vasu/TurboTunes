import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2"; // Using Chart.js
import "../../styles/Analytics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: [],
    bookings: [],
    revenue: [],
    reviews: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost/turbotunes/backend/api/analytics.php");
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const data = {
    labels: analyticsData.users.map((item) => item.date),
    datasets: [
      {
        label: "New Users",
        data: analyticsData.users.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Bookings",
        data: analyticsData.bookings.map((item) => item.count),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Revenue (₹)",
        data: analyticsData.revenue.map((item) => item.total),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Reviews",
        data: analyticsData.reviews.map((item) => item.count),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  return (
    <div className="analytics">
      <h2>Analytics</h2>
      <div className="chart-container">
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default Analytics;
