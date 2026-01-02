import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/vehicleDetails.css';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleData = location.state?.vehicle;
  const searchParams = location.state?.searchParams || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  // Sample reviews data
  const sampleReviews = [
    { id: 1, name: 'Rajesh Kumar', rating: 5, date: '2 weeks ago', comment: 'Excellent service! The vehicle was clean and the driver was very professional.' },
    { id: 2, name: 'Priya Singh', rating: 4, date: '1 month ago', comment: 'Good experience overall. Would recommend for family trips.' },
    { id: 3, name: 'Mohammed Ali', rating: 5, date: '3 weeks ago', comment: 'Best rental experience. Great value for money!' }
  ];

  const handleEnquiry = () => {
    // Handle enquiry logic here
    const enquiryData = {
      vehicle: vehicleData.name,
      operator: vehicleData.operatorName,
      pickupDate: searchParams.date,
      pickupLocation: searchParams.location,
      vehicleCategory: searchParams.vehicleCategory,
      additionalRequirements
    };
    console.log('Enquiry submitted:', enquiryData);
    alert('Enquiry submitted! Our team will contact you soon.');
  };

  // Check if vehicle data exists
  if (!vehicleData) {
    return (
      <div className="vehicle-details-page">
        <div className="container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <h2>Vehicle Not Found</h2>
            <p>The vehicle you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/fleet-results')} className="back-btn">
              <i className="fas fa-arrow-left"></i> Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sample gallery images (in production, these would come from the vehicle data)
  const galleryImages = [
    vehicleData.image,
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
  ];

  return (
    <div className="vehicle-details-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <i className="fas fa-chevron-right"></i>
            <span onClick={() => navigate('/fleet-results')} className="breadcrumb-link">Fleet Search</span>
            <i className="fas fa-chevron-right"></i>
            <span className="breadcrumb-current">{vehicleData.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="vehicle-content">
        <div className="container">
          <div className="content-layout">
            {/* Left Side - Vehicle Info */}
            <div className="vehicle-info-section">
              {/* Image Gallery */}
              <div className="image-gallery">
                <div className="main-image">
                  <img src={galleryImages[selectedImage]} alt={vehicleData.name} />
                  <span className="category-badge">{vehicleData.category.replace('-', ' ')}</span>
                </div>
                <div className="thumbnail-gallery">
                  {galleryImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`View ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Header */}
              <div className="vehicle-header">
                <div className="title-section">
                  <h1>{vehicleData.name}</h1>
                  <div className="operator-info">
                    <i className="fas fa-building"></i>
                    <span>Operated by <strong>{vehicleData.operatorName}</strong>
                      <span className="verified-partner" style={{marginLeft: '12px', color: '#22c55e', fontWeight: 600}}>
                        <i className="fas fa-check-circle" style={{color: '#22c55e', marginRight: '4px'}}></i> Verified Partner
                      </span>
                    </span>
                  </div>
                </div>
                <div className="rating-section">
                  <div className="rating-badge">
                    <i className="fas fa-star"></i>
                    <span className="rating-value">{vehicleData.rating}</span>
                  </div>
                  <span className="reviews-count">{vehicleData.reviews} Reviews</span>
                  <button className="share-btn" title="Share this vehicle">
                    <i className="fas fa-share-alt"></i>
                  </button>
                </div>
              </div>

              {/* Highlights */}
              <div className="vehicle-highlights">
                <div className="highlight-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Free Cancellation</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Fully Insured</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-user-tie"></i>
                  <span>{vehicleData.driverIncluded ? 'Driver Included' : 'Self Drive'}</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-clock"></i>
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="details-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'amenities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('amenities')}
                >
                  Amenities
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('policies')}
                >
                  Policies
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({vehicleData.reviews})
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-content">
                    <h3>About This Vehicle</h3>
                    <p>
                      Experience comfort and reliability with our {vehicleData.name}. Perfect for 
                      {vehicleData.seatingCapacity <= 5 ? ' individual and small family trips' : 
                       vehicleData.seatingCapacity <= 12 ? ' family tours and small group travel' :
                       vehicleData.seatingCapacity <= 26 ? ' medium group tours and events' :
                       ' large group tours, events, and corporate travel'}.
                    </p>
                    
                    <div className="quick-specs">
                      <div className="spec-card">
                        <i className="fas fa-users"></i>
                        <div>
                          <strong>{vehicleData.seatingCapacity}</strong>
                          <span>Passengers</span>
                        </div>
                      </div>
                      <div className="spec-card">
                        <i className="fas fa-snowflake"></i>
                        <div>
                          <strong>{vehicleData.acType}</strong>
                          <span>Climate</span>
                        </div>
                      </div>
                      <div className="spec-card">
                        <i className="fas fa-cog"></i>
                        <div>
                          <strong>{vehicleData.transmission}</strong>
                          <span>Transmission</span>
                        </div>
                      </div>
                      <div className="spec-card">
                        <i className="fas fa-gas-pump"></i>
                        <div>
                          <strong>{vehicleData.fuelType}</strong>
                          <span>Fuel Type</span>
                        </div>
                      </div>
                    </div>

                    <div className="location-info">
                      <h4><i className="fas fa-map-marker-alt"></i> Location & Service Area</h4>
                      <p>
                        <strong>Based in:</strong> {vehicleData.baseCity}<br />
                        <strong>Service Radius:</strong> {vehicleData.serviceRadiusKm} km from base location<br />
                        <strong>Coordinates:</strong> {vehicleData.lat}, {vehicleData.lng}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="specifications-content">
                    <h3>Technical Specifications</h3>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Vehicle ID</span>
                        <span className="spec-value">{vehicleData.vehicleId}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Category</span>
                        <span className="spec-value">{vehicleData.category.replace('-', ' ').toUpperCase()}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Seating Capacity</span>
                        <span className="spec-value">{vehicleData.seatingCapacity} Passengers</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Air Conditioning</span>
                        <span className="spec-value">{vehicleData.acType}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Transmission</span>
                        <span className="spec-value">{vehicleData.transmission}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Fuel Type</span>
                        <span className="spec-value">{vehicleData.fuelType}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Driver</span>
                        <span className="spec-value">{vehicleData.driverIncluded ? 'Included' : 'Not Included'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Base Location</span>
                        <span className="spec-value">{vehicleData.baseCity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="amenities-content">
                    <h3>Features & Amenities</h3>
                    <div className="amenities-grid">
                      {vehicleData.features.map((feature, index) => (
                        <div key={index} className="amenity-item">
                          <i className="fas fa-check-circle"></i>
                          <span>{feature}</span>
                        </div>
                      ))}
                      {vehicleData.driverIncluded && (
                        <div className="amenity-item">
                          <i className="fas fa-check-circle"></i>
                          <span>Professional Driver Included</span>
                        </div>
                      )}
                      <div className="amenity-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Fully Insured Vehicle</span>
                      </div>
                      <div className="amenity-item">
                        <i className="fas fa-check-circle"></i>
                        <span>24/7 Roadside Assistance</span>
                      </div>
                      <div className="amenity-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Regular Maintenance</span>
                      </div>
                      <div className="amenity-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Clean & Sanitized</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'policies' && (
                  <div className="policies-content">
                    <h3>Rental Policies</h3>
                    
                    <div className="policy-section">
                      <h4><i className="fas fa-calendar-check"></i> Booking Policy</h4>
                      <ul>
                        <li>Advance booking required (minimum 24 hours)</li>
                        <li>Instant confirmation upon payment</li>
                        <li>Valid ID proof required at pickup</li>
                      </ul>
                    </div>

                    <div className="policy-section">
                      <h4><i className="fas fa-ban"></i> Cancellation Policy</h4>
                      <ul>
                        <li>Free cancellation up to 48 hours before pickup</li>
                        <li>50% refund for cancellation 24-48 hours before</li>
                        <li>No refund for cancellation within 24 hours</li>
                      </ul>
                    </div>

                    <div className="policy-section">
                      <h4><i className="fas fa-rupee-sign"></i> Payment Policy</h4>
                      <ul>
                        <li>20% advance payment to confirm booking</li>
                        <li>Balance payment before trip start</li>
                        <li>Refundable security deposit: ₹5,000</li>
                      </ul>
                    </div>

                    <div className="policy-section">
                      <h4><i className="fas fa-exclamation-triangle"></i> Additional Charges</h4>
                      <ul>
                        <li>Night charges (10 PM - 6 AM): Extra ₹500/day</li>
                        <li>Hill station charges: Extra ₹1000/trip</li>
                        <li>Driver allowance: ₹500/day (included in price)</li>
                        <li>Toll, parking & permit charges: Actual</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="reviews-content">
                    <h3>Customer Reviews</h3>
                    <div className="reviews-summary">
                      <div className="rating-overview">
                        <div className="overall-rating">
                          <span className="rating-number">{vehicleData.rating}</span>
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < Math.floor(vehicleData.rating) ? 'filled' : ''}`}></i>
                            ))}
                          </div>
                          <span className="total-reviews">Based on {vehicleData.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="reviews-list">
                      {sampleReviews.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">
                                {review.name.charAt(0)}
                              </div>
                              <div>
                                <strong>{review.name}</strong>
                                <span className="review-date">{review.date}</span>
                              </div>
                            </div>
                            <div className="review-rating">
                              {[...Array(review.rating)].map((_, i) => (
                                <i key={i} className="fas fa-star"></i>
                              ))}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Booking Card */}
            <div className="booking-sidebar">
              <div className="booking-card">
                <div className="price-section">
                  <div className="price-row">
                    <span className="price-label">Starting From</span>
                    <div className="price-value">₹{vehicleData.pricePerDay.toLocaleString()}</div>
                    <span className="price-period">per day</span>
                  </div>
                  <div className="price-divider"></div>
                  <div className="price-row">
                    <span className="price-label">Per Kilometer</span>
                    <div className="price-value-small">₹{vehicleData.pricePerKm}</div>
                  </div>
                </div>

                <div className="special-offer-tag">
                  <i className="fas fa-tag"></i>
                  <span>Save up to 15% on weekly bookings!</span>
                </div>

                <div className="booking-info">
                  <div className="info-item">
                    <span className="info-label">Pickup Date</span>
                    <div className="info-value">
                      <i className="fas fa-calendar"></i>
                      {searchParams.date || 'Not specified'}
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Drop-off Date</span>
                    <div className="info-value">
                      <i className="fas fa-calendar-check"></i>
                      {searchParams.dropoffDate || 'Not specified'}
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Pickup Location</span>
                    <div className="info-value">
                      <i className="fas fa-map-marker-alt"></i>
                      {searchParams.location || 'Not specified'}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Requirements</label>
                    <textarea 
                      rows="3"
                      placeholder="Any special requests or requirements..."
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                    ></textarea>
                  </div>

                  <button onClick={handleEnquiry} className="book-now-btn">
                    <i className="fas fa-check-circle"></i> Book Now
                  </button>

                  <button onClick={handleEnquiry} className="contact-btn">
                    <i className="fas fa-paper-plane"></i> Send Enquiry
                  </button>
                </div>

                <div className="trust-badges">
                  <div className="badge-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>Verified Operator</span>
                  </div>
                  <div className="badge-item">
                    <i className="fas fa-certificate"></i>
                    <span>Certified Vehicle</span>
                  </div>
                  <div className="badge-item">
                    <i className="fas fa-headset"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
