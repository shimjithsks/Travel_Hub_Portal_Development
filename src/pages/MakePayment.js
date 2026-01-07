import React, { useState } from 'react';
import '../styles/makePayment.css';

export default function MakePayment() {
  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingRef.trim() && email.trim()) {
      alert(`Processing payment for booking: ${bookingRef}`);
      // Process payment logic
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="make-payment-container">
      <div className="payment-header">
        <div className="payment-header-background">
          <div className="payment-card-bg payment-card-1"></div>
          <div className="payment-card-bg payment-card-2"></div>
          <div className="payment-security-icon">
            <i className="fas fa-lock"></i>
          </div>
        </div>
        <div className="header-content payment-header-content">
          <div className="payment-header-left">
            <div className="payment-icon-badge">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="payment-header-text">
              <h1>Make a Payment</h1>
              <p>Complete your booking payment securely</p>
            </div>
          </div>
          <div className="payment-security-badge">
            <div className="security-item">
              <i className="fas fa-shield-alt"></i>
              <span>100% Secure</span>
            </div>
            <div className="security-divider"></div>
            <div className="security-item">
              <i className="fas fa-lock"></i>
              <span>SSL Protected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-content">
        <div className="payment-card">
          <div className="card-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <h2>Yatra Booking Details</h2>
          <p className="card-subtitle">Enter your booking details to proceed with payment</p>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="bookingRef">Booking Reference Number *</label>
              <input
                type="text"
                id="bookingRef"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="Enter booking reference number"
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

            <button type="submit" className="btn-continue">
              <i className="fas fa-lock"></i> Continue to Payment
            </button>
          </form>

          <div className="payment-methods">
            <h3>We Accept</h3>
            <div className="payment-icons">
              <div className="payment-icon"><i className="fab fa-cc-visa"></i></div>
              <div className="payment-icon"><i className="fab fa-cc-mastercard"></i></div>
              <div className="payment-icon"><i className="fab fa-cc-amex"></i></div>
              <div className="payment-icon"><i className="fas fa-credit-card"></i></div>
              <div className="payment-icon"><i className="fas fa-mobile-alt"></i></div>
            </div>
          </div>

          <div className="security-note">
            <i className="fas fa-shield-alt"></i>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
