import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/hotelDetail.css';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rooms');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Hotel data
  const hotelData = {
    1: {
      id: 1,
      name: 'Grand Hyatt Bali',
      location: 'Bali, Indonesia',
      rating: 4.9,
      reviews: 2456,
      address: 'Jl. Danau Tamblingan No.89, Sanur, Denpasar Selatan, Kota Denpasar, Bali 80228',
      stars: 5,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
        'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200',
      ],
      description: 'Experience luxury at its finest in the heart of Bali. Grand Hyatt Bali offers world-class amenities, stunning ocean views, and exceptional service.',
      amenities: [
        { icon: 'wifi', name: 'Free WiFi' },
        { icon: 'swimming-pool', name: 'Pool' },
        { icon: 'spa', name: 'Spa' },
        { icon: 'utensils', name: 'Restaurant' },
        { icon: 'dumbbell', name: 'Gym' },
        { icon: 'parking', name: 'Free Parking' },
        { icon: 'concierge-bell', name: '24/7 Room Service' },
        { icon: 'umbrella-beach', name: 'Beach Access' },
      ],
      rooms: [
        {
          id: 1,
          name: 'Deluxe Room',
          price: 250,
          size: '35 sqm',
          maxGuests: 2,
          beds: '1 King Bed',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
          amenities: ['City View', 'Free WiFi', 'Air Conditioning', 'Mini Bar'],
          available: 5,
          description: 'Spacious room with modern amenities and city views'
        },
        {
          id: 2,
          name: 'Ocean View Suite',
          price: 350,
          size: '50 sqm',
          maxGuests: 3,
          beds: '1 King Bed + 1 Sofa Bed',
          image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
          amenities: ['Ocean View', 'Balcony', 'Free WiFi', 'Bathtub', 'Mini Bar'],
          available: 3,
          description: 'Luxurious suite with breathtaking ocean views and private balcony'
        },
        {
          id: 3,
          name: 'Presidential Suite',
          price: 550,
          size: '85 sqm',
          maxGuests: 4,
          beds: '2 King Beds',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          amenities: ['Panoramic View', 'Living Room', 'Jacuzzi', 'Butler Service', 'Premium Minibar'],
          available: 1,
          description: 'Ultimate luxury with separate living area and premium amenities'
        },
      ],
      policies: {
        checkIn: '2:00 PM',
        checkOut: '12:00 PM',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        children: 'Children of all ages are welcome',
        pets: 'Pets are not allowed',
      }
    },
    2: {
      id: 2,
      name: 'Santorini Sky Resort',
      location: 'Santorini, Greece',
      rating: 4.8,
      reviews: 1834,
      address: 'Oia, Santorini 84702, Greece',
      stars: 5,
      images: [
        'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=1200',
        'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=1200',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      ],
      description: 'Perched on the cliffs of Oia, experience the magic of Santorini with stunning caldera views and world-class hospitality.',
      amenities: [
        { icon: 'wifi', name: 'Free WiFi' },
        { icon: 'swimming-pool', name: 'Infinity Pool' },
        { icon: 'utensils', name: 'Restaurant' },
        { icon: 'wine-glass', name: 'Wine Bar' },
        { icon: 'concierge-bell', name: 'Concierge' },
        { icon: 'spa', name: 'Spa' },
      ],
      rooms: [
        {
          id: 1,
          name: 'Caldera View Room',
          price: 320,
          size: '30 sqm',
          maxGuests: 2,
          beds: '1 Queen Bed',
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          amenities: ['Caldera View', 'Private Terrace', 'Free WiFi', 'Breakfast Included'],
          available: 4,
          description: 'Romantic room with stunning caldera and sunset views'
        },
        {
          id: 2,
          name: 'Cave Suite',
          price: 450,
          size: '45 sqm',
          maxGuests: 2,
          beds: '1 King Bed',
          image: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539ce?w=800',
          amenities: ['Caldera View', 'Private Pool', 'Outdoor Jacuzzi', 'Butler Service'],
          available: 2,
          description: 'Traditional cave suite with private pool and jacuzzi'
        },
      ],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 48 hours before check-in',
        children: 'Adults only (18+)',
        pets: 'Pets are not allowed',
      }
    },
    3: {
      id: 3,
      name: 'Tokyo City Hotel',
      location: 'Tokyo, Japan',
      rating: 4.6,
      reviews: 3201,
      address: '1-1-1 Shinjuku, Shinjuku-ku, Tokyo 160-0022',
      stars: 4,
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
      ],
      description: 'Modern business hotel in the heart of Tokyo, perfect for both business and leisure travelers.',
      amenities: [
        { icon: 'wifi', name: 'Free WiFi' },
        { icon: 'utensils', name: 'Restaurant' },
        { icon: 'briefcase', name: 'Business Center' },
        { icon: 'dumbbell', name: 'Fitness Center' },
      ],
      rooms: [
        {
          id: 1,
          name: 'Standard Room',
          price: 180,
          size: '25 sqm',
          maxGuests: 2,
          beds: '2 Twin Beds',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
          amenities: ['City View', 'Free WiFi', 'Work Desk', 'Air Conditioning'],
          available: 8,
          description: 'Comfortable room with modern amenities in the city center'
        },
      ],
      policies: {
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        children: 'Children welcome',
        pets: 'Pets are not allowed',
      }
    },
  };

  const hotel = hotelData[id] || hotelData[1];

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    navigate('/hotel-review', {
      state: {
        hotelData: hotel,
        roomData: room
      }
    });
  };

  return (
    <div className="hotel-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <i className="fas fa-chevron-right"></i>
            <span onClick={() => navigate('/hotels')} className="breadcrumb-link">Hotels</span>
            <i className="fas fa-chevron-right"></i>
            <span className="breadcrumb-current">{hotel.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hotel-hero">
        <div className="container">
          <div className="hotel-header">
            <div className="hotel-title-section">
              <div className="hotel-stars">{'⭐'.repeat(hotel.stars)}</div>
              <h1>{hotel.name}</h1>
              <div className="hotel-location">
                <i className="fas fa-map-marker-alt"></i>
                <span>{hotel.address}</span>
              </div>
              <div className="hotel-rating-section">
                <div className="rating-badge">
                  <i className="fas fa-star"></i>
                  <span>{hotel.rating}</span>
                </div>
                <span className="reviews-count">({hotel.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="hotel-gallery-section">
        <div className="container">
          <div className="hotel-gallery-grid">
            <div className="gallery-main" onClick={() => { setShowGallery(true); setSelectedImageIndex(0); }}>
              <img src={hotel.images[0]} alt={hotel.name} />
              <div className="image-overlay">
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
            {hotel.images.slice(1, 5).map((img, index) => (
              <div 
                key={index} 
                className="gallery-item"
                onClick={() => { setShowGallery(true); setSelectedImageIndex(index + 1); }}
              >
                <img src={img} alt={`${hotel.name} ${index + 2}`} />
                <div className="image-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ))}
            {hotel.images.length > 5 && (
              <button 
                className="view-all-photos"
                onClick={() => { setShowGallery(true); setSelectedImageIndex(0); }}
              >
                <i className="fas fa-images"></i>
                View All {hotel.images.length} Photos
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gallery-modal" onClick={() => setShowGallery(false)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={() => setShowGallery(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="gallery-main-viewer">
              <button 
                className="gallery-nav gallery-prev"
                onClick={() => setSelectedImageIndex(prev => prev === 0 ? hotel.images.length - 1 : prev - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="gallery-image-container">
                <img src={hotel.images[selectedImageIndex]} alt={`${hotel.name} ${selectedImageIndex + 1}`} />
                <div className="gallery-counter">
                  {selectedImageIndex + 1} / {hotel.images.length}
                </div>
              </div>
              
              <button 
                className="gallery-nav gallery-next"
                onClick={() => setSelectedImageIndex(prev => prev === hotel.images.length - 1 ? 0 : prev + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="gallery-thumbnails">
              {hotel.images.map((img, index) => (
                <div 
                  key={index}
                  className={`gallery-thumb ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="hotel-content">
        <div className="container">
          <div className="content-layout">
            {/* Left Side - Hotel Information */}
            <div className="hotel-info-section">
              {/* Tabs */}
              <div className="hotel-tabs">
                <button 
                  className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rooms')}
                >
                  <i className="fas fa-bed"></i>
                  Rooms
                </button>
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="fas fa-info-circle"></i>
                  Overview
                </button>
                <button 
                  className={`tab-button ${activeTab === 'amenities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('amenities')}
                >
                  <i className="fas fa-check-circle"></i>
                  Amenities
                </button>
                <button 
                  className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('policies')}
                >
                  <i className="fas fa-file-contract"></i>
                  Policies
                </button>
              </div>

              {/* Rooms Tab */}
              {activeTab === 'rooms' && (
                <div className="tab-content">
                  <div className="rooms-header">
                    <h3>Available Rooms</h3>
                    <p className="section-subtitle">Choose from our selection of beautifully designed rooms</p>
                  </div>
                  
                  <div className="rooms-list">
                    {hotel.rooms.map((room) => (
                      <div key={room.id} className="room-card">
                        <div className="room-image">
                          <img src={room.image} alt={room.name} />
                          {room.available <= 3 && (
                            <div className="availability-badge">Only {room.available} left!</div>
                          )}
                        </div>
                        <div className="room-details">
                          <h4>{room.name}</h4>
                          <p className="room-description">{room.description}</p>
                          
                          <div className="room-specs">
                            <div className="spec-item">
                              <i className="fas fa-ruler-combined"></i>
                              <span>{room.size}</span>
                            </div>
                            <div className="spec-item">
                              <i className="fas fa-users"></i>
                              <span>Max {room.maxGuests} guests</span>
                            </div>
                            <div className="spec-item">
                              <i className="fas fa-bed"></i>
                              <span>{room.beds}</span>
                            </div>
                          </div>

                          <div className="room-amenities">
                            {room.amenities.map((amenity, idx) => (
                              <span key={idx} className="amenity-tag">
                                <i className="fas fa-check"></i>
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="room-footer">
                            <div className="room-price">
                              <span className="price-label">From</span>
                              <div className="price-amount">
                                <span className="currency">$</span>{room.price}
                                <span className="per-night">/night</span>
                              </div>
                            </div>
                            <button 
                              className="book-room-btn"
                              onClick={() => handleBookRoom(room)}
                            >
                              <i className="fas fa-check-circle"></i>
                              Book This Room
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <div className="overview-header">
                    <h3>Hotel Overview</h3>
                    <p className="section-subtitle">Everything you need to know about this property</p>
                  </div>
                  <p className="hotel-description">{hotel.description}</p>
                </div>
              )}

              {/* Amenities Tab */}
              {activeTab === 'amenities' && (
                <div className="tab-content">
                  <div className="amenities-header">
                    <h3>Hotel Amenities</h3>
                    <p className="section-subtitle">Facilities and services available at the property</p>
                  </div>
                  <div className="amenities-grid">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-card">
                        <div className="amenity-icon">
                          <i className={`fas fa-${amenity.icon}`}></i>
                        </div>
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === 'policies' && (
                <div className="tab-content">
                  <div className="policies-header">
                    <h3>Hotel Policies</h3>
                    <p className="section-subtitle">Important information about check-in, cancellation and more</p>
                  </div>
                  <div className="policies-list">
                    <div className="policy-item">
                      <div className="policy-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="policy-content">
                        <h4>Check-in / Check-out</h4>
                        <p>Check-in: {hotel.policies.checkIn}</p>
                        <p>Check-out: {hotel.policies.checkOut}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <div className="policy-icon">
                        <i className="fas fa-ban"></i>
                      </div>
                      <div className="policy-content">
                        <h4>Cancellation</h4>
                        <p>{hotel.policies.cancellation}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <div className="policy-icon">
                        <i className="fas fa-child"></i>
                      </div>
                      <div className="policy-content">
                        <h4>Children & Extra Beds</h4>
                        <p>{hotel.policies.children}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <div className="policy-icon">
                        <i className="fas fa-paw"></i>
                      </div>
                      <div className="policy-content">
                        <h4>Pets</h4>
                        <p>{hotel.policies.pets}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Booking Sidebar */}
            <div className="booking-sidebar">
              <div className="booking-card">
                <h3>Book Your Stay</h3>
                <div className="booking-form">
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar-check"></i>
                      Check-in
                    </label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-calendar-times"></i>
                      Check-out
                    </label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fas fa-users"></i>
                      Guests
                    </label>
                    <select>
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>2 Adults + 1 Child</option>
                      <option>2 Adults + 2 Children</option>
                    </select>
                  </div>
                </div>

                <div className="booking-features dark-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Best Price Guarantee</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Free Cancellation</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
