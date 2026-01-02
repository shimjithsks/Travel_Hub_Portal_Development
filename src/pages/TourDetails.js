import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import '../styles/tourDetails.css';

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    AOS.refresh();
    window.scrollTo(0, 0);
  }, []);

  const tourDetails = {
    1: {
      title: 'Beautiful Leh With Pangong Lake (Standard)',
      duration: '4 Nights / 5 Days',
      price: 22290,
      originalPrice: 27000,
      discount: 18,
      rating: 4.8,
      reviews: 234,
      location: 'Leh (4N)',
      operatorName: 'Yatra',
      verified: true,
      eCash: 668,
      destinations: ['Leh', 'Pangong Lake', 'Nubra Valley', 'Khardung La', 'Diskit'],
      mainImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585040488031-7b7f82039e5e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1548678967-f1aec58f6fb2?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1610878180933-123728745d22?w=1200&h=800&fit=crop',
      ],
      description: 'Embark on an unforgettable journey to the mesmerizing landscapes of Ladakh. Experience the raw beauty of the Himalayas, visit ancient monasteries, and witness the stunning Pangong Lake. This carefully crafted itinerary ensures you explore the best of Leh-Ladakh while experiencing the unique culture and breathtaking vistas of this high-altitude desert.',
      highlights: [
        'Visit Leh Palace & Shanti Stupa',
        'Explore Pangong Lake',
        'Experience Nubra Valley',
        'Cross Khardung La Pass',
        'Visit Diskit Monastery',
        'Enjoy Camel Safari',
        'Magnetic Hill Experience',
        'Confluence of Zanskar & Indus'
      ],
      itinerary: [
        { 
          day: 'Day 1', 
          title: 'Arrival in Leh', 
          description: 'Arrive at Leh airport. Transfer to hotel. Rest and acclimatize to the high altitude. In the evening, take a short walk to Leh market. Overnight stay in Leh.'
        },
        { 
          day: 'Day 2', 
          title: 'Leh Local Sightseeing', 
          description: 'After breakfast, visit Shanti Stupa, Leh Palace, and Hall of Fame museum. Visit the ancient monasteries of Hemis, Thiksey, and Shey Palace. Return to hotel for overnight stay.'
        },
        { 
          day: 'Day 3', 
          title: 'Leh to Pangong Lake', 
          description: 'Drive to the famous Pangong Lake via Changla Pass (17,590 ft). Enjoy the stunning blue waters of the lake. Overnight camping near the lake under the starry sky.'
        },
        { 
          day: 'Day 4', 
          title: 'Pangong to Nubra Valley', 
          description: 'Early morning sunrise at Pangong Lake. Drive to Nubra Valley via Khardung La, one of the highest motorable roads. Visit Diskit Monastery and enjoy camel safari in Hunder sand dunes.'
        },
        { 
          day: 'Day 5', 
          title: 'Nubra to Leh & Departure', 
          description: 'After breakfast, drive back to Leh. Visit Magnetic Hill and Gurudwara Pathar Sahib en route. Transfer to airport for departure with wonderful memories.'
        }
      ],
      included: [
        'Accommodation in Hotels/Camps',
        'Daily Breakfast & Dinner',
        'All Sightseeing by Private Vehicle',
        'Airport Transfers',
        'All Inner Line Permits',
        'Experienced Driver',
        'Fuel & Parking Charges',
        'Camel Safari in Nubra'
      ],
      excluded: [
        'Airfare to/from Leh',
        'Lunch & Beverages',
        'Personal Expenses',
        'Monument Entry Fees',
        'Travel Insurance',
        'Tips & Gratuities'
      ]
    },
    2: {
      title: 'Greece Island Hopping Tour',
      duration: '7 Days 6 Nights',
      price: 75000,
      originalPrice: 85000,
      discount: 12,
      rating: 5.0,
      reviews: 234,
      location: 'Greece',
      operatorName: 'Wanderlust Travels',
      verified: true,
      eCash: 2250,
      destinations: ['Athens', 'Mykonos', 'Santorini', 'Oia', 'Acropolis'],
      mainImage: 'https://images.unsplash.com/photo-1503152394-c571994fd383?w=1200',
      images: [
        'https://images.unsplash.com/photo-1503152394-c571994fd383?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=800&fit=crop',
      ],
      description: 'Experience the magic of Greece with our comprehensive tour package. Explore ancient ruins, beautiful islands, and Mediterranean charm.',
      highlights: ['Athens Acropolis', 'Santorini Sunset', 'Mykonos Beaches', 'Traditional Greek Dining', 'Island Hopping', 'Ancient Ruins'],
      itinerary: [
        { day: 'Day 1', title: 'Arrival in Athens', description: 'Welcome to Athens! Check-in at your hotel and explore the city center.' },
        { day: 'Day 2', title: 'Acropolis & Ancient Sites', description: 'Visit the Acropolis, Parthenon, and ancient Greek temples.' },
        { day: 'Day 3', title: 'Ferry to Mykonos', description: 'Take a ferry to beautiful Mykonos and enjoy beach time.' },
        { day: 'Day 4', title: 'Mykonos Exploration', description: 'Explore the charming town of Mykonos with its narrow streets.' },
        { day: 'Day 5', title: 'Santorini Sunset', description: 'Visit Santorini and watch the famous sunset from Oia.' },
        { day: 'Day 6', title: 'Beach & Relaxation', description: 'Enjoy the unique volcanic beaches of Santorini.' },
        { day: 'Day 7', title: 'Return to Athens', description: 'Final shopping and departure.' }
      ],
      included: ['4-Star Hotels', 'Daily Breakfast', 'Guided Tours', 'Ferry Tickets', 'Travel Insurance'],
      excluded: ['International Flights', 'Lunch & Dinner', 'Personal Expenses', 'Optional Activities']
    }
  };

  const tour = tourDetails[id] || tourDetails[1];

  // Sample reviews
  const reviews = [
    { 
      id: 1, 
      name: 'Priya Sharma', 
      rating: 5, 
      date: '2 weeks ago', 
      comment: 'Absolutely amazing experience! The landscapes were breathtaking and the tour was well-organized. Our guide was very knowledgeable and friendly. Highly recommend this tour to anyone visiting Ladakh!' 
    },
    { 
      id: 2, 
      name: 'Rajesh Kumar', 
      rating: 4.5, 
      date: '1 month ago', 
      comment: 'Great tour package! The accommodations were comfortable and the itinerary was perfect. Pangong Lake was the highlight of the trip. Only minor issue was the food could have been better.' 
    },
    { 
      id: 3, 
      name: 'Anjali Reddy', 
      rating: 5, 
      date: '3 weeks ago', 
      comment: 'Best holiday ever! Everything was seamless from start to finish. The operator was very professional and responsive. Will definitely book with them again!' 
    }
  ];

  const handleBooking = () => {
    alert('Booking initiated! You will be redirected to the payment page.');
  };

  const getInclusionIcon = (inclusion) => {
    if (inclusion.toLowerCase().includes('hotel') || inclusion.toLowerCase().includes('accommodation')) return 'hotel';
    if (inclusion.toLowerCase().includes('breakfast') || inclusion.toLowerCase().includes('meal') || inclusion.toLowerCase().includes('dinner')) return 'utensils';
    if (inclusion.toLowerCase().includes('transfer') || inclusion.toLowerCase().includes('vehicle')) return 'bus';
    if (inclusion.toLowerCase().includes('sightseeing') || inclusion.toLowerCase().includes('tour')) return 'binoculars';
    if (inclusion.toLowerCase().includes('permit') || inclusion.toLowerCase().includes('entry')) return 'file-contract';
    if (inclusion.toLowerCase().includes('driver') || inclusion.toLowerCase().includes('guide')) return 'user-tie';
    if (inclusion.toLowerCase().includes('fuel') || inclusion.toLowerCase().includes('parking')) return 'gas-pump';
    if (inclusion.toLowerCase().includes('safari') || inclusion.toLowerCase().includes('camel')) return 'horse';
    if (inclusion.toLowerCase().includes('insurance')) return 'shield-alt';
    return 'check';
  };

  return (
    <div className="tour-details-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <i className="fas fa-chevron-right"></i>
            <span onClick={() => navigate('/tour')} className="breadcrumb-link">Tours</span>
            <i className="fas fa-chevron-right"></i>
            <span className="breadcrumb-current">{tour.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="tour-hero">
        <div className="container">
          <div className="tour-hero-content">
            <div className="tour-title-section">
              <div className="title-wrapper">
                <h1>{tour.title}</h1>
              </div>
              
              <div className="tour-meta">
                <div className="meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{tour.location}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>{tour.duration}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-users"></i>
                  <span>Group Size: Flexible</span>
                </div>
              </div>

              <div className="tour-badges-row">
                <div className="tour-rating-badge">
                  <i className="fas fa-star"></i>
                  <span>{tour.rating} / 5</span>
                  <small>({tour.reviews} reviews)</small>
                </div>
                <div className="tour-operator-info">
                  <i className="fas fa-suitcase"></i>
                  <span>Tour by: {tour.operatorName}</span>
                  {tour.verified && (
                    <span className="verified-operator">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Destinations List */}
              <div className="tour-destinations">
                <div className="destinations-label">
                  <i className="fas fa-map-marked-alt"></i>
                  <span>Destinations Covered:</span>
                </div>
                <div className="destinations-chips">
                  {tour.destinations.map((destination, index) => (
                    <span key={index} className="destination-chip">
                      <i className="fas fa-location-dot"></i>
                      {destination}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="tour-price-section">
              <div className="price-card-premium">
                <div className="price-label">Per Person (Twin Sharing)</div>
                <div className="tour-price-large">
                  <span className="currency">₹</span>{tour.price.toLocaleString('en-IN')}
                </div>
                <div className="price-comparison">
                  <span className="original-price-strike">₹ {tour.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="discount-tag">{tour.discount}% OFF</span>
                </div>
                <p className="price-note">Inclusive of all taxes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="tour-gallery-section">
        <div className="container">
          <div className="gallery-section-header">
            <h2>Tour Gallery</h2>
            <p>Explore the stunning visuals of this destination</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-main" onClick={() => { setShowGallery(true); setSelectedImageIndex(0); }}>
              <img src={tour.images[0]} alt={tour.title} />
              <div className="image-overlay">
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
            {tour.images.slice(1, 5).map((img, index) => (
              <div 
                key={index} 
                className="gallery-item"
                onClick={() => { setShowGallery(true); setSelectedImageIndex(index + 1); }}
              >
                <img src={img} alt={`${tour.title} ${index + 2}`} />
                <div className="image-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ))}
            {tour.images.length > 5 && (
              <button 
                className="view-all-photos"
                onClick={() => { setShowGallery(true); setSelectedImageIndex(0); }}
              >
                <i className="fas fa-images"></i>
                View All {tour.images.length} Photos
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
                onClick={() => setSelectedImageIndex(prev => prev === 0 ? tour.images.length - 1 : prev - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="gallery-image-container">
                <img src={tour.images[selectedImageIndex]} alt={`${tour.title} ${selectedImageIndex + 1}`} />
                <div className="gallery-counter">
                  {selectedImageIndex + 1} / {tour.images.length}
                </div>
              </div>
              
              <button 
                className="gallery-nav gallery-next"
                onClick={() => setSelectedImageIndex(prev => prev === tour.images.length - 1 ? 0 : prev + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="gallery-thumbnails">
              {tour.images.map((img, index) => (
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
      <section className="tour-content">
        <div className="container">
          <div className="content-layout">
            {/* Left Side - Tour Information */}
            <div className="tour-info-section">
              {/* Tabs */}
              <div className="tour-tabs">
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="fas fa-info-circle"></i>
                  Overview
                </button>
                <button 
                  className={`tab-button ${activeTab === 'itinerary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('itinerary')}
                >
                  <i className="fas fa-route"></i>
                  Itinerary
                </button>
                <button 
                  className={`tab-button ${activeTab === 'inclusions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inclusions')}
                >
                  <i className="fas fa-check-double"></i>
                  Inclusions
                </button>
                <button 
                  className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <i className="fas fa-star"></i>
                  Reviews
                </button>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-content" data-aos="fade-up">
                  <div className="overview-header">
                    <h3>Tour Overview</h3>
                    <p className="overview-intro">Get a complete picture of what awaits you</p>
                  </div>
                  <p className="tour-description">{tour.description}</p>

                  <div className="highlights-section">
                    <h3>Tour Highlights</h3>
                    <p className="section-subtitle">The best experiences you'll have on this tour</p>
                  </div>
                  <div className="highlights-grid">
                    {tour.highlights.map((highlight, index) => (
                      <div key={index} className="highlight-card">
                        <div className="highlight-icon">
                          <i className="fas fa-check"></i>
                        </div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === 'itinerary' && (
                <div className="tab-content" data-aos="fade-up">
                  <div className="itinerary-header">
                    <h3>Detailed Itinerary</h3>
                    <p className="section-subtitle">Day-by-day breakdown of your journey</p>
                  </div>
                  <div className="itinerary-timeline">
                    {tour.itinerary.map((item, index) => (
                      <div key={index} className="itinerary-day">
                        <div className="day-marker">{index + 1}</div>
                        <div className="day-title">{item.day}</div>
                        <h4 className="day-heading">{item.title}</h4>
                        <p className="day-description">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions Tab */}
              {activeTab === 'inclusions' && (
                <div className="tab-content" data-aos="fade-up">
                  <div className="inclusions-header">
                    <h3>What's Included</h3>
                    <p className="section-subtitle">Everything covered in your tour package</p>
                  </div>
                  <div className="inclusions-grid">
                    {tour.included.map((item, index) => (
                      <div key={index} className="inclusion-card">
                        <div className="inclusion-icon">
                          <i className={`fas fa-${getInclusionIcon(item)}`}></i>
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {tour.excluded && (
                    <>
                      <div className="exclusions-header">
                        <h3>What's Not Included</h3>
                        <p className="section-subtitle">These items are not part of the tour package</p>
                      </div>
                      <div className="inclusions-grid">
                        {tour.excluded.map((item, index) => (
                          <div key={index} className="inclusion-card" style={{background: '#fef2f2', border: '1px solid #fecaca'}}>
                            <div className="inclusion-icon" style={{background: '#ef4444'}}>
                              <i className="fas fa-times"></i>
                            </div>
                            <span style={{color: '#991b1b'}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="tab-content" data-aos="fade-up">
                  <div className="reviews-header">
                    <h3>Guest Reviews</h3>
                    <p className="section-subtitle">Real experiences from travelers like you</p>
                  </div>
                  
                  {/* Reviews Summary */}
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <div className="rating-number">{tour.rating}</div>
                      <div className="rating-stars">★★★★★</div>
                      <div className="rating-count">{tour.reviews} reviews</div>
                    </div>
                    <div className="rating-breakdown">
                      <div className="rating-bar">
                        <span className="rating-label">Excellent</span>
                        <div className="rating-progress">
                          <div className="rating-fill" style={{width: '85%'}}></div>
                        </div>
                        <span className="rating-percentage">85%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="rating-label">Very Good</span>
                        <div className="rating-progress">
                          <div className="rating-fill" style={{width: '12%'}}></div>
                        </div>
                        <span className="rating-percentage">12%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="rating-label">Average</span>
                        <div className="rating-progress">
                          <div className="rating-fill" style={{width: '2%'}}></div>
                        </div>
                        <span className="rating-percentage">2%</span>
                      </div>
                      <div className="rating-bar">
                        <span className="rating-label">Poor</span>
                        <div className="rating-progress">
                          <div className="rating-fill" style={{width: '1%'}}></div>
                        </div>
                        <span className="rating-percentage">1%</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="reviewer-name">{review.name}</h4>
                              <div className="review-date">{review.date}</div>
                            </div>
                          </div>
                          <div className="review-rating">
                            <i className="fas fa-star"></i>
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Booking Sidebar */}
            <div className="booking-sidebar">
              <div className="booking-card">
                <div className="booking-price">
                  <div className="price-text">Per Person on twin sharing</div>
                  <div className="booking-price-amount">
                    <span className="currency">₹</span>{tour.price.toLocaleString('en-IN')}
                  </div>
                  <div className="price-details">Inclusive of all taxes</div>
                </div>

                <div className="booking-info-display" style={{
                  padding: '20px 0',
                  borderTop: '1px solid #e5e7eb',
                  borderBottom: '1px solid #e5e7eb',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <i className="fas fa-clock" style={{color: '#0A9BA8', fontSize: '18px'}}></i>
                    <div>
                      <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '2px'}}>Duration</div>
                      <div style={{fontSize: '15px', fontWeight: '600', color: '#111827'}}>{tour.duration}</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <i className="fas fa-users" style={{color: '#0A9BA8', fontSize: '18px'}}></i>
                    <div>
                      <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '2px'}}>Group Size</div>
                      <div style={{fontSize: '15px', fontWeight: '600', color: '#111827'}}>Flexible (1-20 people)</div>
                    </div>
                  </div>
                </div>

                <button className="book-now-btn" onClick={handleBooking}>
                  <i className="fas fa-check-circle"></i>
                  Book Now
                </button>

                <button className="customize-btn">
                  <i className="fas fa-edit"></i> Customize Tour
                </button>

                <div className="booking-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Best Price Guaranteed</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>24/7 Customer Support</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Free Cancellation</span>
                  </div>
                </div>

                <div className="ecash-card">
                  <i className="fas fa-coins"></i>
                  <p>Earn eCash <span className="ecash-amount">₹ {tour.eCash}</span> on this booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
