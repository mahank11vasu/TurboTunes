import React from "react";
import "../styles/Home.css";
import car from "../assets/car.png";
import car2 from "../assets/car2.jpg";
import car3 from "../assets/car3.jpg";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <header className="hero">
        <h1>Reliable Car Repairs at Your Fingertips</h1>
        <p>Expert mechanics delivering trusted service wherever you are.</p>
        <button className="cta-btn">Get Started</button>
      </header>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <img src={car} alt="Book Service" />
            <h3>Book a Service</h3>
            <p>Choose the service you need and book it online in a few clicks.</p>
          </div>
          <div className="step">
            <img src={car2} alt="Mechanic Assigned" />
            <h3>Mechanic Assigned</h3>
            <p>Our skilled mechanic will reach your location or pick up your vehicle.</p>
          </div>
          <div className="step">
            <img src={car3} alt="Get it Delivered" />
            <h3>Get it Delivered</h3>
            <p>Enjoy your serviced car delivered to your doorstep, hassle-free.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="card">
            <h3>Vehicle Diagnostics</h3>
            <p>Comprehensive health check for your car to ensure peak performance.</p>
          </div>
          <div className="card">
            <h3>Repairs</h3>
            <p>From minor fixes to major repairs, our mechanics have you covered.</p>
          </div>
          <div className="card">
            <h3>Pickup & Drop</h3>
            <p>Convenient pickup and drop services to save you time and effort.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-cards">
          <div className="testimonial">
            <p>"The service was exceptional! The mechanic arrived on time and fixed my car perfectly."</p>
            <h4>- Priya Sharma</h4>
          </div>
          <div className="testimonial">
            <p>"I loved the transparency and professionalism. Definitely recommended!"</p>
            <h4>- Rahul Verma</h4>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
