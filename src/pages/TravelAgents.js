import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/travelAgents.css';

export default function TravelAgents() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const features = [
    {
      title: 'Round-the-clock customer and technical support'
    },
    {
      title: '1000+ White Label/API customers across the globe'
    },
    {
      title: 'Wide range of hotels and flights at multiple locations suitable for every need'
    },
    {
      title: 'Seamless rescheduling and cancellations'
    }
  ];

  const services = [
    { name: 'Flights', icon: 'fa-plane', link: '/flights' },
    { name: 'Hotels', icon: 'fa-hotel', link: '/hotels' },
    { name: 'Trains', icon: 'fa-train', link: '/trains' },
    { name: 'Visa', icon: 'fa-passport', link: '/visa' },
    { name: 'Holiday', icon: 'fa-umbrella-beach', link: '/holiday' },
    { name: 'Bus', icon: 'fa-bus', link: '/bus' }
  ];

  const testimonials = [
    {
      name: 'SANYOGITA PANDEY',
      company: 'Partner - TRACOSE',
      image: 'https://www.yatra.com/travel-agents/agent1.png',
      rating: 5,
      text: 'Travel Axis Online Services excels in the highly competitive travel industry. Their service is at par with top providers, offering smooth and efficient experiences. The fares are good, making them a reliable choice.'
    },
    {
      name: 'Ace Travels',
      company: 'Bhutan',
      image: 'https://www.yatra.com/travel-agents/agent2.jpg',
      rating: 5,
      text: 'Greetings from Ace Travels Bhutan. This is a brief note to thank Travel Axis for being a great business partner for such a long time. It has been exactly 12 years of working with Travel Axis.'
    },
    {
      name: 'Suvendu Das',
      company: 'Travel Professional',
      image: 'https://www.yatra.com/travel-agents/agent3.jpg',
      rating: 5,
      text: 'I have been working with Travel Axis for a long, long period of time. It was a perfect experience for me while working with Travel Axis. In this competitive world of the tourism industry, Travel Axis has always upgraded.'
    },
    {
      name: 'Tejinder Singh Sobti',
      company: 'Whistling Vacations',
      image: 'https://www.yatra.com/travel-agents/agent4.jpg',
      rating: 5,
      text: 'I would like to give a Testimonial to Travel Axis Limited. We have been working with them for the last 8 years and have had a great experience working with them. Their services and rates are excellent.'
    }
  ];

  return (
    <div className="travel-agents-page">
      {/* Hero Section */}
      <section className="agents-hero">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content" data-aos="fade-up">
              <h1>Let India's top business travel brand handle your organization's travel needs!</h1>
              <div className="stats-row">
                <div className="stat-item">
                  <h3>31.9K+</h3>
                  <p>Travel Agents</p>
                </div>
                <div className="stat-item">
                  <h3>150+</h3>
                  <p>Distributors</p>
                </div>
                <div className="stat-item">
                  <h3>998.8K+</h3>
                  <p>API Searches</p>
                </div>
              </div>
              <div className="hero-actions">
                <Link to="/agent-login" className="btn-primary">Login</Link>
                <Link to="/agent-signup" className="btn-secondary">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Explore our range of services</h2>
          <p className="section-subtitle">
            Flights, hotels, car rentals, cruises, tours, and more—everything you need for your next adventure, all in one place. 
            Let us help you craft unforgettable travel experiences, wherever you're headed.
          </p>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-item" data-aos="zoom-in" data-aos-delay={index * 100}>
                <i className={`fas ${service.icon}`}></i>
                <h3>{service.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="why-book-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Why Book with Travel Axis?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-box" data-aos="fade-up" data-aos-delay={index * 100}>
                <p>{feature.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Don't just take our words</h2>
          <h3 className="happy-users">3940+ Happy Travel Axis Users</h3>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <img src={testimonial.image} alt={testimonial.name} className="testimonial-img" />
                <div className="rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <h4>{testimonial.name}</h4>
                <p className="company">{testimonial.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-aos="fade-up">
        <div className="container">
          <h2>Ready to Partner with Travel Axis?</h2>
          <p>Join thousands of travel agents who trust Travel Axis for their business needs</p>
          <div className="cta-buttons">
            <Link to="/agent-login" className="btn-primary">Login Now</Link>
            <Link to="/agent-signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="agents-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>Corporate Information</h3>
              <Link to="/about">About Us</Link>
              <Link to="/service">Our Products</Link>
              <Link to="/contact">Terms and Conditions</Link>
            </div>
            <div className="footer-col">
              <h3>TSI-Travel Axis Services</h3>
              <Link to="/tour">Flights</Link>
              <Link to="/tour">Hotels</Link>
              <Link to="/tour">Trains</Link>
            </div>
            <div className="footer-col">
              <h3>Customer Care</h3>
              <Link to="/contact">Contact Us</Link>
              <Link to="/faq">FAQs</Link>
            </div>
            <div className="footer-col">
              <h3>Partner with Us</h3>
              <Link to="/contact">API Services</Link>
              <Link to="/agent-signup">Register as Agent</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Travel Axis Online Limited, India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
