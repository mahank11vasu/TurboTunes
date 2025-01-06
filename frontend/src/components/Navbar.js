import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo2.png";
import { FaUserCircle } from "react-icons/fa";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src={logo} alt="TurboTunes Logo" />
        </div>
        <nav className="nav-links">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <div className="auth-button">
          {user ? (
            <div className="user-dropdown">
              <FaUserCircle size={30} className="user-icon" />
              <div className="dropdown-menu">
                <p>Welcome, {user.name}</p>
                <ul>
                  {user.role === "Customer" && (
                    <>
                      <li><Link to="/customer">Dashboard</Link></li>
                      <li><Link to="/book-service">Book New Service</Link></li>
                      <li><Link to="/edit-profile">Edit Profile</Link></li>
                    </>
                  )}
                  {user.role === "Mechanic" && (
                    <>
                      <li><Link to="/mechanic">Dashboard</Link></li>
                      <li><Link to="/view-appointments">View Appointments</Link></li>
                      <li><Link to="/edit-profile">Edit Profile</Link></li>
                    </>
                  )}
                  {user.role === "Admin" && (
                    <>
                      <li><Link to="/admin">Dashboard</Link></li>
                    </>
                  )}
                  <li onClick={logout}>Logout</li>
                </ul>
              </div>
            </div>
          ) : (
            <button className="auth-btn" onClick={() => navigate("/auth")}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
