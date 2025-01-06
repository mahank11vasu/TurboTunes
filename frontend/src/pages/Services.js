import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0); // For slider control
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch services from the API
    fetch('http://localhost/TurboTunes/backend/api/services.php?action=fetch')
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
      });
  }, []);

  const handleBookService = () => {
    navigate('/auth'); // Redirect to login/register page
  };

  const handleMechanicJoin = () => {
    navigate('/auth'); // Redirect to login/register page
  };

  // Divide services into slides of 6 items (2x3 structure)
  const slideSize = 6;
  const slides = [];
  for (let i = 0; i < services.length; i += slideSize) {
    slides.push(services.slice(i, i + slideSize));
  }

  const goToPreviousSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? slides.length - 1 : prevSlide - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === slides.length - 1 ? 0 : prevSlide + 1
    );
  };

  return (
    <div className="services">
      {/* Hero Section */}
      <div className="services-hero">
        <h1>Our Services</h1>
        <p>
          Explore our range of vehicle services tailored to your needs. Whether it's diagnostics, repairs, or routine maintenance, we've got you covered!
        </p>
      </div>

      {/* Services Slider Section */}
      <div className="services-slider">
        <button className="slider-btn" onClick={goToPreviousSlide}>
          &#8592; Prev
        </button>
        <div className="slider">
          {slides[currentSlide]?.map((service) => (
            <div key={service.service_id} className="service-card">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p>
                <strong>Starting from ₹{service.base_cost}</strong>
              </p>
              <button className="book-btn" onClick={handleBookService}>
                Book Service
              </button>
            </div>
          ))}
        </div>
        <button className="slider-btn" onClick={goToNextSlide}>
          Next &#8594;
        </button>
      </div>

      {/* Mechanic Join Section */}
      <div className="mechanic-join">
        <h2>Mechanics, Join Us!</h2>
        <p>
          Are you a skilled mechanic looking for opportunities? TurboTunes is the perfect platform to grow your business and connect with customers.
        </p>
        <button className="join-btn" onClick={handleMechanicJoin}>
          Join as a Mechanic
        </button>
      </div>
    </div>
  );
};

export default Services;
