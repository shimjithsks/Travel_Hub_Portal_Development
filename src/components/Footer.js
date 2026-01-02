import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  return (
    <footer className="footer-section">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="newsletter-content">
                <h2 className="newsletter-title">Get Updated The Latest Newsletter</h2>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="newsletter-form">
                <form onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="subscribe-btn">
                    Subscribe Now
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="footer-content">
        <div className="container-fluid">
          <div className="row">
            {/* About Section */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <div className="footer-logo">
                  <div className="logo-brand-footer">
                    <i className="fa-solid fa-globe"></i>
                    <div className="logo-text-wrapper-footer">
                      <h3 className="logo-main-footer">Travel Axis</h3>
                      <p className="logo-tagline-footer">Plan • Book • Explore</p>
                    </div>
                  </div>
                </div>
                <p className="footer-description">
                  Rapidiously myocardinate cross-platform intellectual capital model. Appropriately create interactive infrastructures
                </p>
                <div className="social-links">
                  <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook"></i>
                  </a>
                  <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-twitter"></i>
                  </a>
                  <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-linkedin"></i>
                  </a>
                  <a href="https://whatsapp.com" className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                  <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h4 className="footer-widget-title">Quick Links</h4>
                <ul className="footer-links">
                  <li>
                    <i className="fa-solid fa-chevron-right"></i>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <i className="fa-solid fa-chevron-right"></i>
                    <Link to="/about">About us</Link>
                  </li>
                  <li>
                    <i className="fa-solid fa-chevron-right"></i>
                    <Link to="/service">Our Service</Link>
                  </li>
                  <li>
                    <i className="fa-solid fa-chevron-right"></i>
                    <Link to="/contact">Terms of Service</Link>
                  </li>
                  <li>
                    <i className="fa-solid fa-chevron-right"></i>
                    <Link to="/contact">Tour Booking Now</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Address */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h4 className="footer-widget-title">Address</h4>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fa-solid fa-phone"></i>
                    <div className="contact-text">
                      <p><a href="tel:+01234567890">+01 234 567 890</a></p>
                      <p><a href="tel:+09876543210">+09 876 543 210</a></p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="fa-solid fa-envelope"></i>
                    <div className="contact-text">
                      <p><a href="mailto:hello@travelaxis.com">hello@travelaxis.com</a></p>
                      <p><a href="mailto:support@travelaxis.com">support@travelaxis.com</a></p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="fa-solid fa-location-dot"></i>
                    <div className="contact-text">
                      <p>789 Inner Lane, Holy park, California, USA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Posts */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h4 className="footer-widget-title">Instagram Post</h4>
                <div className="instagram-grid">
                  <img src="https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                  <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                  <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                  <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=240&h=240&fit=crop" alt="Travel" className="instagram-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p className="copyright-text">Copyright 2025 Travel Axis. All Rights Reserved.</p>
            </div>
            <div className="col-lg-6">
              <div className="payment-methods">
                <span className="payment-label">We Accept</span>
                <div className="payment-icons">
                  <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="payment-icon" />
                  <img src="https://via.placeholder.com/40x25?text=VISA" alt="Visa" className="payment-icon" />
                  <img src="https://via.placeholder.com/40x25?text=PayPal" alt="PayPal" className="payment-icon" />
                  <img src="https://via.placeholder.com/40x25?text=Apple" alt="Apple Pay" className="payment-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </footer>
  );
}
