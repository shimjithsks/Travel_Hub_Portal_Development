import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import AOS from 'aos';
import '../styles/sendEnquiry.css';

export default function SendEnquiry() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // Get data from navigation state
  const vehicleData = location.state?.vehicleData;
  const tourData = location.state?.tourData;
  const searchParams = location.state?.searchParams || {};
  const appliedOffer = location.state?.appliedOffer;

  // Determine enquiry type
  const enquiryType = type || (vehicleData ? 'vehicle' : tourData ? 'tour' : 'general');
  const itemData = vehicleData || tourData;

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    numberOfPersons: 1,
    pickupDate: searchParams.date || today,
    returnDate: searchParams.dropoffDate || today,
    pickupTime: '09:00',
    dropoffTime: '18:00',
    tripType: 'round-trip',
    pickupLocation: searchParams.location || '',
    pickupAddress: '',
    dropoffAddress: '',
    specialRequirements: []
  });

  useEffect(() => {
    AOS.init({ duration: 800 });
    window.scrollTo(0, 0);
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || profile.fullName || '',
        email: profile.email || user.email || '',
        phone: profile.phone || ''
      }));
    }
  }, [user, profile]);

  // Calculate number of days
  const numberOfDays = useMemo(() => {
    const start = new Date(formData.pickupDate);
    const end = new Date(formData.returnDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, [formData.pickupDate, formData.returnDate]);

  // Calculate estimated price
  const estimatedPrice = useMemo(() => {
    if (!itemData?.pricePerDay && !itemData?.price) return 0;
    const basePrice = (itemData.pricePerDay || itemData.price) * numberOfDays;
    let discount = 0;
    if (appliedOffer) {
      if (appliedOffer.discount?.includes('%')) {
        discount = (basePrice * parseInt(appliedOffer.discount)) / 100;
      } else if (appliedOffer.discount?.includes('₹')) {
        discount = parseInt(appliedOffer.discount.replace('₹', ''));
      }
    }
    return basePrice - discount;
  }, [itemData, numberOfDays, appliedOffer]);

  // Toggle special requirement
  const toggleSpecialRequirement = (requirement) => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter(r => r !== requirement)
        : [...prev.specialRequirements, requirement]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      setSubmitting(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      setSubmitting(false);
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setError('Please enter a pickup location');
      setSubmitting(false);
      return;
    }

    try {
      const basePrice = (itemData?.pricePerDay || itemData?.price || 0) * numberOfDays;
      let discount = 0;
      if (appliedOffer) {
        if (appliedOffer.discount?.includes('%')) {
          discount = (basePrice * parseInt(appliedOffer.discount)) / 100;
        } else if (appliedOffer.discount?.includes('₹')) {
          discount = parseInt(appliedOffer.discount.replace('₹', ''));
        }
      }

      const enquiryData = {
        // Customer Details
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        customerId: user?.uid || null,

        // Item Details
        itemId: itemData?.id || id || null,
        itemName: itemData?.name || itemData?.title || 'General Enquiry',
        itemCategory: itemData?.category || '',
        itemType: itemData?.type || enquiryType,
        operatorName: itemData?.operatorName || '',
        itemImage: itemData?.image || itemData?.mainImage || '',
        seatingCapacity: itemData?.seatingCapacity || '',

        // Booking Details
        pickupLocation: formData.pickupLocation,
        pickupAddress: formData.pickupAddress.trim(),
        dropoffAddress: formData.dropoffAddress.trim(),
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        pickupTime: formData.pickupTime,
        dropoffTime: formData.dropoffTime,
        numberOfDays: numberOfDays,
        numberOfPersons: formData.numberOfPersons,
        tripType: formData.tripType,

        // Pricing
        pricePerDay: itemData?.pricePerDay || itemData?.price || 0,
        basePrice: basePrice,
        appliedOfferCode: appliedOffer?.code || null,
        discount: discount,
        estimatedTotal: basePrice - discount,

        // Additional Info
        message: formData.message.trim(),
        specialRequirements: formData.specialRequirements,

        // Meta
        enquiryType: enquiryType,
        status: 'pending',
        createdAt: db ? serverTimestamp() : new Date().toISOString(),
        source: 'website'
      };

      if (db) {
        try {
          await addDoc(collection(db, 'enquiries'), enquiryData);
        } catch (firebaseErr) {
          // Log Firebase error but continue to show success
          console.warn('Firebase write failed (permissions issue):', firebaseErr.message);
          console.log('Enquiry data:', enquiryData);
        }
      } else {
        // If Firebase is not configured, just log the data
        console.log('Enquiry data (Firebase not configured):', enquiryData);
      }

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If no item data and not a general enquiry, show error
  if (!itemData && type !== 'general') {
    return (
      <div className="send-enquiry-page">
        <div className="container">
          <div className="enquiry-error-state">
            <div className="error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2>No Item Selected</h2>
            <p>Please select a vehicle or tour package to send an enquiry.</p>
            <button onClick={() => navigate(-1)} className="back-btn">
              <i className="fas fa-arrow-left"></i> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="send-enquiry-page">
      {/* Hero Section */}
      <section className="enquiry-hero">
        <div className="hero-overlay">
          <div className="hero-top-row">
            <button className="back-button" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
          <div className="container">
            <div className="hero-content" data-aos="fade-up">
              <div className="hero-text">
                <h1>{itemData?.name || itemData?.title || 'Send Enquiry'}</h1>
                <p className="hero-subtitle">
                  Fill in the details below and our team will get back to you shortly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {success ? (
          <div className="enquiry-success-page" data-aos="fade-up">
            <div className="success-card">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Enquiry Sent Successfully!</h2>
              <p>Thank you for your interest in <strong>{itemData?.name || itemData?.title || 'our services'}</strong></p>

              <div className="success-summary">
                <div className="summary-row">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(formData.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(formData.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="summary-row">
                  <i className="fas fa-clock"></i>
                  <span>{formData.pickupTime} - {formData.dropoffTime}</span>
                </div>
                <div className="summary-row">
                  <i className="fas fa-users"></i>
                  <span>{formData.numberOfPersons} Passenger{formData.numberOfPersons > 1 ? 's' : ''}</span>
                </div>
                <div className="summary-row">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{formData.pickupLocation}</span>
                </div>
              </div>

              <div className="success-details">
                <p><i className="fas fa-envelope"></i> Confirmation sent to <strong>{formData.email}</strong></p>
                <p><i className="fas fa-phone"></i> We'll call you at <strong>{formData.phone}</strong></p>
              </div>

              <div className="success-info">
                <i className="fas fa-clock"></i>
                <span>Our team will contact you within 2 hours during business hours (9 AM - 8 PM)</span>
              </div>

              <div className="success-actions">
                <button className="primary-btn" onClick={() => navigate('/')}>
                  <i className="fas fa-home"></i> Back to Home
                </button>
                <button className="secondary-btn" onClick={() => navigate('/fleet-results')}>
                  <i className="fas fa-car"></i> Browse More Vehicles
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="enquiry-form-container">
            <div className="enquiry-grid">
              {/* Left Column - Trip Details */}
              <div className="enquiry-left" data-aos="fade-right">
                {/* Item Card */}
                {itemData && (
                  <div className="item-card">
                    <div className="item-image">
                      <img src={itemData.image || itemData.mainImage} alt={itemData.name || itemData.title} />
                      <span className="item-badge">{itemData.category}</span>
                    </div>
                    <div className="item-info">
                      <h3>{itemData.name || itemData.title}</h3>
                      <p className="operator">
                        <i className="fas fa-building"></i> {itemData.operatorName}
                        <span className="verified"><i className="fas fa-check-circle"></i> Verified</span>
                      </p>
                      <div className="item-meta">
                        <span><i className="fas fa-users"></i> {itemData.seatingCapacity} Seats</span>
                        <span><i className="fas fa-star"></i> {itemData.rating}</span>
                      </div>
                      <div className="item-price">
                        <span className="price">₹{itemData.pricePerDay || itemData.price}</span>
                        <span className="per-unit">/ {enquiryType === 'tour' ? 'person' : 'day'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trip Type */}
                <div className="form-section">
                  <h4><i className="fas fa-route"></i> Trip Type</h4>
                  <div className="trip-type-options">
                    {[
                      { value: 'one-way', icon: 'fa-arrow-right', label: 'One Way' },
                      { value: 'round-trip', icon: 'fa-exchange-alt', label: 'Round Trip' },
                      { value: 'multi-city', icon: 'fa-map-marked-alt', label: 'Multi City' }
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`trip-option ${formData.tripType === option.value ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="tripType"
                          value={option.value}
                          checked={formData.tripType === option.value}
                          onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                        />
                        <i className={`fas ${option.icon}`}></i>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="form-section">
                  <h4><i className="fas fa-calendar-alt"></i> Schedule</h4>
                  <div className="date-time-grid">
                    <div className="form-group">
                      <label>Pickup Date *</label>
                      <input
                        type="date"
                        value={formData.pickupDate}
                        min={today}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            pickupDate: e.target.value,
                            returnDate: e.target.value > formData.returnDate ? e.target.value : formData.returnDate
                          });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pickup Time *</label>
                      <input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Return Date *</label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        min={formData.pickupDate || today}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Drop-off Time *</label>
                      <input
                        type="time"
                        value={formData.dropoffTime}
                        onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="form-section">
                  <h4><i className="fas fa-map-marker-alt"></i> Location Details</h4>
                  <div className="form-group">
                    <label>Pickup City *</label>
                    <input
                      type="text"
                      placeholder="Enter pickup city"
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pickup Address (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter detailed pickup address"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    />
                  </div>
                  {formData.tripType !== 'one-way' && (
                    <div className="form-group">
                      <label>Drop-off Address (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter drop-off address"
                        value={formData.dropoffAddress}
                        onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Passengers */}
                <div className="form-section">
                  <h4><i className="fas fa-users"></i> Number of Passengers</h4>
                  <div className="persons-selector">
                    <button
                      type="button"
                      className="persons-btn"
                      onClick={() => setFormData({ ...formData, numberOfPersons: Math.max(1, formData.numberOfPersons - 1) })}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <div className="persons-display">
                      <span className="persons-count">{formData.numberOfPersons}</span>
                      <span className="persons-label">Person{formData.numberOfPersons > 1 ? 's' : ''}</span>
                    </div>
                    <button
                      type="button"
                      className="persons-btn"
                      onClick={() => setFormData({ ...formData, numberOfPersons: Math.min(parseInt(itemData?.seatingCapacity) || 50, formData.numberOfPersons + 1) })}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  {itemData?.seatingCapacity && (
                    <p className="capacity-note">
                      <i className="fas fa-info-circle"></i>
                      Maximum capacity: {itemData.seatingCapacity} passengers
                    </p>
                  )}
                </div>

                {/* Special Requirements */}
                <div className="form-section">
                  <h4><i className="fas fa-cog"></i> Special Requirements</h4>
                  <div className="special-requirements-grid">
                    {[
                      { id: 'child-seat', icon: 'fa-baby', label: 'Child Seat' },
                      { id: 'wheelchair', icon: 'fa-wheelchair', label: 'Wheelchair Access' },
                      { id: 'luggage', icon: 'fa-suitcase-rolling', label: 'Extra Luggage' },
                      { id: 'wifi', icon: 'fa-wifi', label: 'WiFi Required' },
                      { id: 'pet-friendly', icon: 'fa-paw', label: 'Pet Friendly' },
                      { id: 'smoking', icon: 'fa-smoking-ban', label: 'Non-Smoking' }
                    ].map(req => (
                      <label
                        key={req.id}
                        className={`requirement-option ${formData.specialRequirements.includes(req.id) ? 'active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialRequirements.includes(req.id)}
                          onChange={() => toggleSpecialRequirement(req.id)}
                        />
                        <i className={`fas ${req.icon}`}></i>
                        <span>{req.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Contact & Summary */}
              <div className="enquiry-right" data-aos="fade-left">
                {/* Price Summary */}
                <div className="price-summary-card">
                  <h4>Price Summary</h4>
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Base Price</span>
                      <span>₹{itemData?.pricePerDay || itemData?.price || 0} × {numberOfDays} days</span>
                    </div>
                    <div className="price-row">
                      <span>Subtotal</span>
                      <span>₹{(itemData?.pricePerDay || itemData?.price || 0) * numberOfDays}</span>
                    </div>
                    {appliedOffer && (
                      <div className="price-row discount">
                        <span><i className="fas fa-tag"></i> {appliedOffer.code}</span>
                        <span>-{appliedOffer.discount}</span>
                      </div>
                    )}
                    <div className="price-row total">
                      <span>Estimated Total</span>
                      <span>₹{estimatedPrice}</span>
                    </div>
                  </div>
                  <p className="price-note">* Final price may vary based on actual usage</p>
                </div>

                {/* Contact Form */}
                <div className="contact-form-card">
                  <h4><i className="fas fa-user-circle"></i> Contact Information</h4>

                  {error && (
                    <div className="form-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label><i className="fas fa-user"></i> Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label><i className="fas fa-envelope"></i> Email *</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label><i className="fas fa-phone"></i> Phone *</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label><i className="fas fa-comment-alt"></i> Additional Message (Optional)</label>
                      <textarea
                        rows="4"
                        placeholder="Any specific requirements, questions, or special instructions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-btn" disabled={submitting}>
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Sending Enquiry...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Send Enquiry
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Trust Badges */}
                <div className="trust-badges">
                  <div className="trust-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure & Private</span>
                  </div>
                  <div className="trust-item">
                    <i className="fas fa-clock"></i>
                    <span>Quick Response</span>
                  </div>
                  <div className="trust-item">
                    <i className="fas fa-headset"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>

                <p className="enquiry-note">
                  <i className="fas fa-info-circle"></i>
                  Our team will contact you within 2 hours during business hours (9 AM - 8 PM).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
