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
