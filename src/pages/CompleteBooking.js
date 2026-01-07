import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/completeBooking.css';

export default function CompleteBooking() {
  const [bookingRef, setBookingRef] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bookingRef.trim()) {
      // Navigate to booking details or payment page
      alert(`Retrieving booking details for: ${bookingRef}`);
      // navigate(`/booking-details/${bookingRef}`);
    } else {
      alert('Please enter a valid booking reference number');
    }
  };

  return (
    <div className="complete-booking-container">
      <div className="booking-header">
        <div className="header-content">
          <h1>Complete Your Booking</h1>
          <p>Retrieve your pending booking and complete the payment</p>
        </div>
      </div>

      <div className="booking-content">
        <div className="booking-card">
          <div className="card-icon">
            <i className="fas fa-plane-departure"></i>
          </div>
          <h2>Booking Reference Number</h2>
          <p className="card-subtitle">Enter your booking reference number to continue with your payment</p>

          <form onSubmit={handleSubmit} className="booking-form">
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

            <button type="submit" className="btn-submit">
              <i className="fas fa-search"></i> Submit & Continue
            </button>
          </form>

          <div className="info-section">
            <h3>How to find your booking reference?</h3>
            <ul>
              <li><i className="fas fa-check-circle"></i> Check your email for booking confirmation</li>
              <li><i className="fas fa-check-circle"></i> Look for a 6-10 character alphanumeric code</li>
              <li><i className="fas fa-check-circle"></i> Contact support if you can't find it</li>
            </ul>
          </div>

          <div className="help-section">
            <p>Need help? <a href="/contact">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
