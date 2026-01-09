import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FooterNew.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  return (
    <footer className="main-footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter-section">
        <div className="container">
          <div className="newsletter-wrapper-footer">
            <div className="newsletter-info-footer">
              <i className="fas fa-envelope-open-text"></i>
              <div>
                <h3>Subscribe to Our Newsletter</h3>
                <p>Get exclusive deals and latest travel updates</p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form-footer">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                Subscribe <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="footer-content-section">
        <div className="container">
          <div className="footer-grid-new">
            {/* Brand Column */}
            <div className="footer-brand-col">
              <div className="brand-logo-footer">
                <div className="logo-icon">
                  <i className="fas fa-globe-americas"></i>
                </div>
                <div className="logo-text">
                  <h3>Travel Axis</h3>
                  <span>Plan • Book • Explore</span>
                </div>
              </div>
              <p className="brand-description">
                Your trusted partner for seamless travel experiences across the globe.
              </p>
              <div className="social-icons">
                <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
              </div>
            </div>

            {/* Explore Links */}
            <div className="footer-links-col">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/tour">Tours</Link></li>
                <li><Link to="/destination">Destinations</Link></li>
                <li><Link to="/hotels">Hotels</Link></li>
                <li><Link to="/flights">Flights</Link></li>
                <li><Link to="/offers">Offers</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-links-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/travel-agents">Become a Partner</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-links-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/service">Services</Link></li>
                <li><Link to="/contact">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-copyright">
        <div className="container">
          <div className="copyright-content">
            <p>© {currentYear} Travel Axis Online Limited, India. All rights reserved.</p>
            <div className="copyright-links">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Use</a>
              <span>|</span>
              <a href="#">Disclaimer</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
