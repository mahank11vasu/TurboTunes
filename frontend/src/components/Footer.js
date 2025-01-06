import React from "react";
import "../styles/Footer.css";
import logo from "../assets/logo2.png";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and description */}
        <div className="logo">
          <img src={logo} alt="TurboTunes Logo" />
        </div>
        <div className="footer-section">
          <h2>TurboTunes</h2>
          <p>Your trusted car service partner, delivering exceptional care and diagnostics for all vehicle needs.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: support@turbotunes.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Address: 123 Car Street, Jaipur, Rajasthan</p>
        </div>

        {/* Social Media Links */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 TurboTunes. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
