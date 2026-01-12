import React from 'react';
import { Link } from 'react-router-dom';
import './PartnerFooter.css';

export default function PartnerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="partner-footer">
      {/* Partner CTA Section */}
      <div className="partner-footer-cta">
        <div className="container">
          <div className="cta-wrapper">
            <div className="cta-content">
              <i className="fas fa-handshake"></i>
              <div>
                <h3>Ready to Grow Your Business?</h3>
                <p>Join 5,000+ successful travel partners across India</p>
              </div>
            </div>
            <div className="cta-actions">
              <Link to="/agent-signup" className="cta-btn-primary">
                <i className="fas fa-rocket"></i> Become a Partner
              </Link>
              <Link to="/agent-login" className="cta-btn-secondary">
                <i className="fas fa-sign-in-alt"></i> Partner Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="partner-footer-content">
        <div className="container">
          <div className="partner-footer-grid">
            {/* Brand Column */}
            <div className="partner-footer-brand">
              <div className="partner-brand-logo">
                <div className="logo-icon">
                  <i className="fas fa-globe-americas"></i>
                </div>
                <div className="logo-text">
                  <h3>Travel Axis</h3>
                  <span>Partner Portal</span>
                </div>
              </div>
              <p className="partner-brand-desc">
                Empowering travel agents and partners with cutting-edge technology and unmatched support to grow their business.
              </p>
              <div className="partner-contact-info">
                <div className="contact-item">
                  <i className="fas fa-phone-alt"></i>
                  <span>Partner Helpline: 1800-XXX-XXXX</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>partners@travelaxis.com</span>
                </div>
              </div>
            </div>

            {/* Partner Resources */}
            <div className="partner-footer-links">
              <h4>Partner Resources</h4>
              <ul>
                <li><Link to="/travel-agents">Partner Program</Link></li>
                <li><Link to="/agent-signup">Register as Partner</Link></li>
                <li><Link to="/agent-login">Partner Login</Link></li>
                <li><Link to="/portal-dashboard">Partner Dashboard</Link></li>
                <li><a href="#">Training & Webinars</a></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="partner-footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/tour">Tours</Link></li>
                <li><Link to="/hotels">Hotels</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="partner-footer-links">
              <h4>Support</h4>
              <ul>
                <li><Link to="/faq">FAQs</Link></li>
                <li><a href="#">Partner Guidelines</a></li>
                <li><a href="#">Commission Structure</a></li>
                <li><a href="#">Payment Terms</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
          </div>

          {/* Partner Stats */}
          <div className="partner-footer-stats">
            <div className="stat-box">
              <i className="fas fa-users"></i>
              <div>
                <h4>5,000+</h4>
                <p>Active Partners</p>
              </div>
            </div>
            <div className="stat-box">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>200+</h4>
                <p>Cities</p>
              </div>
            </div>
            <div className="stat-box">
              <i className="fas fa-ticket-alt"></i>
              <div>
                <h4>1M+</h4>
                <p>Bookings</p>
              </div>
            </div>
            <div className="stat-box">
              <i className="fas fa-star"></i>
              <div>
                <h4>4.8</h4>
                <p>Partner Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="partner-footer-copyright">
        <div className="container">
          <div className="copyright-content">
            <p>© {currentYear} Travel Axis Partner Portal. All rights reserved.</p>
            <div className="copyright-links">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Service</a>
              <span>|</span>
              <a href="#">Partner Agreement</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
