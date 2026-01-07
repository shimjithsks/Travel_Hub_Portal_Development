import React, { useState } from 'react';
import '../styles/completeHoliday.css';

export default function CompleteHoliday() {
  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingRef.trim() && email.trim()) {
      alert(`Processing holiday package for booking: ${bookingRef}`);
      // Process booking logic
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="complete-holiday-container">
      <div className="holiday-header">
        <div className="holiday-header-background">
          <div className="holiday-palm-tree holiday-palm-1"></div>
          <div className="holiday-palm-tree holiday-palm-2"></div>
          <div className="holiday-sun"></div>
          <div className="holiday-wave"></div>
        </div>
        <div className="header-content holiday-header-content">
          <div className="holiday-header-left">
            <div className="holiday-icon-badge">
              <i className="fas fa-umbrella-beach"></i>
            </div>
            <div className="holiday-header-text">
              <h1>Complete Your Holiday</h1>
              <p>Finalize your dream vacation package</p>
            </div>
          </div>
          <div className="holiday-features-box">
            <div className="feature-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Best Destinations</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-star"></i>
              <span>Luxury Packages</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-heart"></i>
              <span>Unforgettable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="holiday-content">
        <div className="holiday-card">
          <div className="card-icon">
            <i className="fas fa-umbrella-beach"></i>
          </div>
          <h2>Holiday Package Booking</h2>
          <p className="card-subtitle">Enter your booking details to complete your holiday package</p>

          <form onSubmit={handleSubmit} className="holiday-form">
            <div className="form-group">
              <label htmlFor="bookingRef">Booking Reference Number *</label>
              <input
                type="text"
                id="bookingRef"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="Enter your booking reference number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Your Email ID *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <button type="submit" className="btn-submit-holiday">
              <i className="fas fa-check-circle"></i> Submit & Continue
            </button>
          </form>

          <div className="package-benefits">
            <h3>Why Book Holiday Packages?</h3>
            <div className="benefits-grid">
              <div className="benefit">
                <i className="fas fa-tag"></i>
                <span>Best Prices Guaranteed</span>
              </div>
              <div className="benefit">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Booking</span>
              </div>
              <div className="benefit">
                <i className="fas fa-headset"></i>
                <span>24/7 Support</span>
              </div>
              <div className="benefit">
                <i className="fas fa-star"></i>
                <span>Curated Experiences</span>
              </div>
            </div>
          </div>

          <div className="help-note">
            <i className="fas fa-info-circle"></i>
            <p>Need assistance? Our travel experts are here to help! <a href="/contact">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
