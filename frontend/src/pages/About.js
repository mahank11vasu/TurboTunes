import React from 'react';
import '../styles/About.css';
import aboutBg from '../assets/about-bg.jpg';
import qualityIcon from '../assets/quality-icon.png';
import affordableIcon from '../assets/affordable-icon.png';
import pickupIcon from '../assets/pickup-icon.png';
import team1 from '../assets/team1.jpg';
import team2 from '../assets/team2.jpg';
import team3 from '../assets/team3.jpg';

const About = () => {
  return (
    <div className="about">
      {/* Hero Section */}
      <div
        className="about-hero"
        style={{
          background: `linear-gradient(135deg, rgba(78, 84, 200, 0.8), rgba(143, 148, 251, 0.8)), url(${aboutBg}) center/cover no-repeat`,
        }}
      >
        <h1>About TurboTunes</h1>
        <p>
          Welcome to TurboTunes, India’s premier automotive service platform, designed to bring convenience and 
          efficiency to vehicle servicing. From diagnostics to routine maintenance, we deliver excellence every time.
        </p>
      </div>

      {/* About Us Section */}
      <div className="about-us">
        <h2>Who We Are</h2>
        <p>
          TurboTunes is an innovative automobile servicing company headquartered in India. Our mission is to provide 
          seamless and reliable vehicle servicing by connecting skilled mechanics with customers through our robust 
          platform. With a focus on quality, transparency, and customer satisfaction, we are transforming the way 
          vehicle servicing is done.
        </p>
      </div>

      {/* Why Choose Us Section */}
      <div className="why-choose-us">
        <h2>Why Choose TurboTunes?</h2>
        <div className="features">
          <div className="feature">
            <img src={qualityIcon} alt="Quality Service" />
            <h3>Quality Service</h3>
            <p>Our certified mechanics ensure top-notch service for every vehicle, every time.</p>
          </div>
          <div className="feature">
            <img src={affordableIcon} alt="Affordable Pricing" />
            <h3>Affordable Pricing</h3>
            <p>Transparent pricing ensures no hidden costs, giving you peace of mind.</p>
          </div>
          <div className="feature">
            <img src={pickupIcon} alt="Pickup & Drop" />
            <h3>Convenient Pickup & Drop</h3>
            <p>Hassle-free pickup and drop services are available across major cities in India.</p>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="vision">
        <h2>Our Vision</h2>
        <p>
          To revolutionize the automotive servicing industry in India by setting new standards for quality and customer
          satisfaction while empowering mechanics and garages with the tools they need to thrive.
        </p>
      </div>

      {/* Team Section */}
      <div className="team">
        <h2>Meet Our Team</h2>
        <p>
          At TurboTunes, our team consists of dedicated professionals who bring expertise, innovation, and passion to 
          the forefront. Together, we strive to deliver exceptional service to our customers.
        </p>
        <div className="team-members">
          <div className="member">
            <img src={team1} alt="Team Member 1" />
            <h3>Rahul Sharma</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="member">
            <img src={team2} alt="Team Member 2" />
            <h3>Ananya Gupta</h3>
            <p>CTO</p>
          </div>
          <div className="member">
            <img src={team3} alt="Team Member 3" />
            <h3>Vikas Mehta</h3>
            <p>Operations Head</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
