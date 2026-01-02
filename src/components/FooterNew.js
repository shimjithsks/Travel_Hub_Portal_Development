import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FooterNew.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="yatra-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Company Information */}
            <div className="footer-column">
              <h4 className="footer-heading">
                Company Information
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press Room</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Sitemap</a></li>
              </ul>
            </div>

            {/* Travel Services */}
            <div className="footer-column">
              <h4 className="footer-heading">
                Travel Services
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><Link to="/flights">Flights</Link></li>
                <li><Link to="/hotels">Hotels</Link></li>
                <li><Link to="/tour">Holiday Packages</Link></li>
                <li><Link to="/destination">Destinations</Link></li>
                <li><a href="#">Buses</a></li>
                <li><a href="#">Trains</a></li>
                <li><a href="#">Cabs</a></li>
                <li><a href="#">Cruises</a></li>
              </ul>
            </div>

            {/* Partner With Us */}
            <div className="footer-column">
              <h4 className="footer-heading">
                Partner With Travel Axis
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><a href="#">List Your Property</a></li>
                <li><a href="#">Travel Agent Registration</a></li>
                <li><a href="#">Tour Operator Registration</a></li>
                <li><a href="#">Affiliate Program</a></li>
                <li><a href="#">Advertise with Us</a></li>
                <li><a href="#">Corporate Travel</a></li>
                <li><a href="#">B2B Portal</a></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="footer-column">
              <h4 className="footer-heading">
                Customer Care
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><Link to="/faq">FAQ</Link></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Cancellation Policy</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><a href="#">Payment Options</a></li>
                <li><a href="#">Travel Insurance</a></li>
                <li><a href="#">Customer Reviews</a></li>
                <li><Link to="/contact">Support</Link></li>
              </ul>
            </div>

            {/* Product Offerings */}
            <div className="footer-column">
              <h4 className="footer-heading">
                Product Offerings
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><a href="#">International Flights</a></li>
                <li><a href="#">Domestic Flights</a></li>
                <li><a href="#">International Hotels</a></li>
                <li><a href="#">Domestic Hotels</a></li>
                <li><a href="#">International Packages</a></li>
                <li><a href="#">India Tour Packages</a></li>
                <li><a href="#">Adventure Tours</a></li>
                <li><Link to="/gallery">Gallery</Link></li>
              </ul>
            </div>

            {/* More */}
            <div className="footer-column">
              <h4 className="footer-heading">
                More
                <i className="fas fa-chevron-down"></i>
              </h4>
              <ul className="footer-links">
                <li><Link to="/blog">Travel Blog</Link></li>
                <li><a href="#">Travel Guides</a></li>
                <li><a href="#">Gift Vouchers</a></li>
                <li><a href="#">Travel Deals</a></li>
                <li><a href="#">Special Offers</a></li>
                <li><a href="#">Corporate Solutions</a></li>
                <li><a href="#">Group Bookings</a></li>
                <li><a href="#">Travel News</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="popular-routes-section">
        <div className="container">
          <h4 className="section-title">Popular Flight Routes</h4>
          <div className="routes-grid">
            <a href="#">Delhi to Mumbai</a>
            <a href="#">Mumbai to Bangalore</a>
            <a href="#">Delhi to Goa</a>
            <a href="#">Bangalore to Delhi</a>
            <a href="#">Delhi to Chennai</a>
            <a href="#">Mumbai to Delhi</a>
            <a href="#">Delhi to Kolkata</a>
            <a href="#">Bangalore to Mumbai</a>
            <a href="#">Delhi to Hyderabad</a>
            <a href="#">Mumbai to Chennai</a>
            <a href="#">Delhi to Pune</a>
            <a href="#">Bangalore to Hyderabad</a>
            <a href="#">Delhi to Bangalore</a>
            <a href="#">Mumbai to Goa</a>
            <a href="#">Hyderabad to Delhi</a>
            <a href="#">Chennai to Mumbai</a>
            <a href="#">Kolkata to Delhi</a>
            <a href="#">Pune to Delhi</a>
          </div>
        </div>
      </div>

      {/* International Routes */}
      <div className="popular-routes-section international-routes">
        <div className="container">
          <h4 className="section-title">Popular International Flight Routes</h4>
          <div className="routes-grid">
            <a href="#">Delhi to Dubai</a>
            <a href="#">Mumbai to Singapore</a>
            <a href="#">Delhi to London</a>
            <a href="#">Bangalore to Dubai</a>
            <a href="#">Delhi to Bangkok</a>
            <a href="#">Mumbai to Dubai</a>
            <a href="#">Delhi to Singapore</a>
            <a href="#">Chennai to Singapore</a>
            <a href="#">Delhi to New York</a>
            <a href="#">Mumbai to London</a>
            <a href="#">Delhi to Paris</a>
            <a href="#">Bangalore to Singapore</a>
            <a href="#">Delhi to Bali</a>
            <a href="#">Mumbai to Bangkok</a>
            <a href="#">Hyderabad to Dubai</a>
            <a href="#">Chennai to Dubai</a>
            <a href="#">Kolkata to Bangkok</a>
            <a href="#">Pune to Dubai</a>
          </div>
        </div>
      </div>

      {/* Social Media & Contact */}
      <div className="footer-social-section">
        <div className="container">
          <div className="social-content">
            <div className="social-info">
              <h4>Our Social Media Handles:</h4>
              <div className="social-links-row">
                <a href="https://facebook.com" className="social-item" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook"></i>
                  <span>www.facebook.com/TravelAxis</span>
                </a>
                <a href="https://twitter.com" className="social-item" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                  <span>www.twitter.com/TravelAxis</span>
                </a>
                <a href="https://linkedin.com" className="social-item" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                  <span>www.linkedin.com/company/travel-axis</span>
                </a>
                <a href="https://youtube.com" className="social-item" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                  <span>www.youtube.com/TravelAxis</span>
                </a>
                <a href="https://instagram.com" className="social-item" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                  <span>www.instagram.com/travelaxis</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Security */}
      <div className="footer-security-section">
        <div className="container">
          <div className="security-content">
            <div className="security-title">
              <h4>Security & Payments</h4>
            </div>
            <div className="payment-icons">
              <div className="security-badge">
                <i className="fas fa-shield-alt"></i>
                <span>SSL Secured</span>
              </div>
              <div className="security-badge">
                <i className="fas fa-lock"></i>
                <span>VeriSign Secured</span>
              </div>
              <div className="payment-method">
                <i className="fas fa-university"></i>
                <span>Net Banking</span>
              </div>
              <div className="payment-method">
                <i className="fas fa-wallet"></i>
                <span>Easy EMI</span>
              </div>
              <div className="payment-method">
                <i className="fab fa-cc-visa"></i>
                <span>Visa</span>
              </div>
              <div className="payment-method">
                <i className="fab fa-cc-mastercard"></i>
                <span>Mastercard</span>
              </div>
              <div className="payment-method">
                <i className="fab fa-cc-amex"></i>
                <span>Amex</span>
              </div>
              <div className="payment-method">
                <i className="fas fa-credit-card"></i>
                <span>RuPay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-wrapper">
            <div className="newsletter-info">
              <i className="fas fa-envelope-open-text"></i>
              <div>
                <h3>Subscribe to Our Newsletter</h3>
                <p>Get exclusive deals and latest travel updates</p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form">
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

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <div className="footer-brand">
              <Link to="/" className="brand-link">
                <i className="fas fa-plane-departure"></i>
                <span>Travel Axis</span>
              </Link>
            </div>
            <div className="copyright-text">
              <p>Copyright © {currentYear} Travel Axis Online Limited (formerly known as Travel Axis Online Private Limited), India. All rights reserved</p>
            </div>
            <div className="footer-links-bottom">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Use</a>
              <span>|</span>
              <a href="#">Disclaimer</a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="floating-chat">
        <button className="chat-button">
          <i className="fas fa-comments"></i>
          <span className="chat-badge">Chat with us</span>
        </button>
      </div>
    </footer>
  );
}
