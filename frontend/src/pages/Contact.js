import React from 'react';
import '../styles/Contact.css';
import officeImage from '../assets/office.jpg'; // Placeholder for office image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const Contact = () => {
  return (
    <div className="contact">
      {/* Hero Section */}
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          We value your feedback and are here to assist you. Reach out to TurboTunes for support, partnerships, or general inquiries. We’re just a call or email away.
        </p>
      </div>

      {/* Contact Details Section */}
      <div className="contact-details">
        <h2>Our Information</h2>
        <div className="details-container">
          {/* Office Headquarters */}
          <div className="detail">
            <img src={officeImage} alt="TurboTunes Office" />
            <h3>Our Headquarters</h3>
            <p>TurboTunes Pvt. Ltd.</p>
            <p>123 Car Street, Jaipur, Rajasthan, India</p>
            <p>Pin Code: 302012</p>
            <p>Phone: +91 98765 43210</p>
          </div>

          {/* Customer Support */}
          <div className="detail">
            <h3>Customer Support</h3>
            <p>Toll-Free: 1800-123-4567</p>
            <p>Email: support@turbotunes.com</p>
            <p>For escalations: escalation@turbotunes.com</p>
            <p>Working Hours: Mon-Sat, 9 AM - 8 PM</p>
          </div>

          {/* Map and Service Locations */}
          <div className="detail">
            <h3>Service Locations</h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.675017743966!2d75.78440437484018!3d26.91243466459496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5df24c92e8d%3A0x395b1c4df6571b0e!2s123%20Car%20Street%2C%20Jaipur%2C%20Rajasthan%20302012!5e0!3m2!1sen!2sin!4v1697721180515!5m2!1sen!2sin"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen=""
              loading="lazy"
              title="Service Locations"
            ></iframe>
            <p>We currently serve 50+ cities across India, including all metro cities and select tier-2 cities.</p>
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="business-hours">
        <h2>Business Hours</h2>
        <p>Monday to Friday: 9 AM - 8 PM</p>
        <p>Saturday: 9 AM - 6 PM</p>
        <p>Sunday: Closed</p>
        <p>Public Holidays: Limited Support</p>
      </div>

      {/* Follow Us Section */}
      <div className="follow-us">
        <h2>Follow Us</h2>
        <p>Connect with us on social media for updates, offers, and more:</p>
        <div className="social-links">
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
