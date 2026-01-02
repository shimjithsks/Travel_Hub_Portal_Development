import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/hotelReview.css';

export default function HotelReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelData, roomData } = location.state || {};

  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [bookingDetails, setBookingDetails] = useState({
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 2,
    children: 0
  });

  const [paymentMethod, setPaymentMethod] = useState('');

  // Calculate nights
  const calculateNights = () => {
    if (bookingDetails.checkIn && bookingDetails.checkOut) {
      const checkIn = new Date(bookingDetails.checkIn);
      const checkOut = new Date(bookingDetails.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1;
  };

  const nights = calculateNights();
  const roomPrice = roomData?.price || 250;
  const basePrice = roomPrice * nights * bookingDetails.rooms;
  const taxes = basePrice * 0.18; // 18% tax
  const totalPrice = basePrice + taxes;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Processing payment... Redirecting to payment gateway.');
    // Here you would integrate with actual payment gateway
  };

  if (!hotelData || !roomData) {
    return (
      <div className="hotel-review-page">
        <div className="container">
          <div className="error-message">
            <h2>No booking data found</h2>
            <button onClick={() => navigate('/hotels')} className="back-btn">
              Return to Hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-review-page">
      {/* Header */}
      <div className="review-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <h1>Review Your Booking</h1>
          <div className="steps-indicator">
            <div className="step active">
              <span className="step-number">1</span>
              <span className="step-label">Review</span>
            </div>
            <div className="step-divider"></div>
            <div className="step">
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className="step-divider"></div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-content">
        <div className="container">
          <div className="review-layout">
            {/* Left Side - Forms */}
            <div className="review-main">
              {/* Hotel Summary */}
              <div className="booking-section hotel-summary">
                <h2>
                  <i className="fas fa-hotel"></i>
                  Hotel Details
                </h2>
                <div className="hotel-info-card">
                  <div className="hotel-image">
                    <img src={roomData.image} alt={hotelData.name} />
                  </div>
                  <div className="hotel-info">
                    <div className="hotel-stars">{'⭐'.repeat(hotelData.stars)}</div>
                    <h3>{hotelData.name}</h3>
                    <p className="hotel-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {hotelData.location}
                    </p>
                    <div className="room-selected">
                      <i className="fas fa-bed"></i>
                      <strong>{roomData.name}</strong> - {roomData.size}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="booking-section">
                <h2>
                  <i className="fas fa-calendar-alt"></i>
                  Booking Details
                </h2>
                <div className="booking-details-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="fas fa-calendar-check"></i>
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        value={bookingDetails.checkIn}
                        onChange={(e) => setBookingDetails({...bookingDetails, checkIn: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <i className="fas fa-calendar-times"></i>
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        value={bookingDetails.checkOut}
                        onChange={(e) => setBookingDetails({...bookingDetails, checkOut: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="fas fa-door-open"></i>
                        Number of Rooms *
                      </label>
                      <select
                        value={bookingDetails.rooms}
                        onChange={(e) => setBookingDetails({...bookingDetails, rooms: parseInt(e.target.value)})}
                      >
                        <option value="1">1 Room</option>
                        <option value="2">2 Rooms</option>
                        <option value="3">3 Rooms</option>
                        <option value="4">4 Rooms</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        <i className="fas fa-users"></i>
                        Guests *
                      </label>
                      <select
                        value={bookingDetails.adults}
                        onChange={(e) => setBookingDetails({...bookingDetails, adults: parseInt(e.target.value)})}
                      >
                        <option value="1">1 Adult</option>
                        <option value="2">2 Adults</option>
                        <option value="3">3 Adults</option>
                        <option value="4">4 Adults</option>
                      </select>
                    </div>
                  </div>

                  <div className="nights-display">
                    <i className="fas fa-moon"></i>
                    <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="booking-section">
                <h2>
                  <i className="fas fa-user"></i>
                  Guest Details
                </h2>
                <form className="guest-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={guestDetails.firstName}
                        onChange={(e) => setGuestDetails({...guestDetails, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={guestDetails.lastName}
                        onChange={(e) => setGuestDetails({...guestDetails, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        placeholder="yourname@email.com"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({...guestDetails, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Requests (Optional)</label>
                    <textarea
                      placeholder="Any special requests or preferences..."
                      rows="4"
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({...guestDetails, specialRequests: e.target.value})}
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="booking-section">
                <h2>
                  <i className="fas fa-credit-card"></i>
                  Payment Method
                </h2>
                <div className="payment-methods">
                  <div 
                    className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="payment-radio">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                    </div>
                    <div className="payment-info">
                      <i className="fas fa-credit-card"></i>
                      <div>
                        <h4>Credit / Debit Card</h4>
                        <p>Pay securely with your card</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="payment-radio">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                    </div>
                    <div className="payment-info">
                      <i className="fas fa-mobile-alt"></i>
                      <div>
                        <h4>UPI Payment</h4>
                        <p>Pay using UPI apps</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <div className="payment-radio">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={() => setPaymentMethod('wallet')}
                      />
                    </div>
                    <div className="payment-info">
                      <i className="fas fa-wallet"></i>
                      <div>
                        <h4>Digital Wallet</h4>
                        <p>PayPal, Google Pay, etc.</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`payment-option ${paymentMethod === 'payAtHotel' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('payAtHotel')}
                  >
                    <div className="payment-radio">
                      <input
                        type="radio"
                        name="payment"
                        value="payAtHotel"
                        checked={paymentMethod === 'payAtHotel'}
                        onChange={() => setPaymentMethod('payAtHotel')}
                      />
                    </div>
                    <div className="payment-info">
                      <i className="fas fa-hotel"></i>
                      <div>
                        <h4>Pay at Hotel</h4>
                        <p>Pay when you check-in</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="booking-section important-info">
                <h2>
                  <i className="fas fa-info-circle"></i>
                  Important Information
                </h2>
                <ul className="info-list">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Free cancellation up to 24 hours before check-in
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Check-in time: {hotelData.policies?.checkIn || '2:00 PM'}
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Check-out time: {hotelData.policies?.checkOut || '12:00 PM'}
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    Valid ID proof required at check-in
                  </li>
                  <li>
                    <i className="fas fa-info-circle"></i>
                    All rates are in USD and include applicable taxes
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side - Price Summary */}
            <div className="review-sidebar">
              <div className="price-summary-card">
                <h3>Price Summary</h3>
                
                <div className="summary-section">
                  <h4>Room Details</h4>
                  <div className="summary-item">
                    <span>{roomData.name}</span>
                    <span>{bookingDetails.rooms} × ${roomPrice}</span>
                  </div>
                  <div className="summary-item">
                    <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                    <span></span>
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-item">
                    <span>Room Price</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Taxes & Fees (18%)</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="total-price">${totalPrice.toFixed(2)}</span>
                </div>

                <button 
                  className="proceed-payment-btn"
                  onClick={handleSubmit}
                  disabled={!paymentMethod || !bookingDetails.checkIn || !bookingDetails.checkOut}
                >
                  <i className="fas fa-lock"></i>
                  Proceed to Payment
                </button>

                <div className="security-badges">
                  <div className="badge">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure Payment</span>
                  </div>
                  <div className="badge">
                    <i className="fas fa-lock"></i>
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="benefits-card">
                <h4>Why Book With Us?</h4>
                <ul className="benefits-list">
                  <li>
                    <i className="fas fa-tag"></i>
                    <span>Best Price Guarantee</span>
                  </li>
                  <li>
                    <i className="fas fa-undo"></i>
                    <span>Free Cancellation</span>
                  </li>
                  <li>
                    <i className="fas fa-headset"></i>
                    <span>24/7 Customer Support</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Instant Confirmation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
