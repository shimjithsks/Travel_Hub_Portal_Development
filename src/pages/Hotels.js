import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/hotels.css';

export default function Hotels() {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    type: '',
    searchTerm: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: '2'
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');
  const dropdownRef = useRef(null);

  // Popular destinations
  const popularDestinations = [
    { id: 'bali', name: 'Bali', icon: '🇮🇩', places: ['Ubud', 'Seminyak', 'Kuta'] },
    { id: 'dubai', name: 'Dubai', icon: '🇦🇪', places: ['Marina', 'Downtown', 'Palm Jumeirah'] },
    { id: 'thailand', name: 'Thailand', icon: '🇹🇭', places: ['Phuket', 'Bangkok', 'Pattaya'] },
    { id: 'maldives', name: 'Maldives', icon: '🇲🇻', places: ['Male', 'Maafushi'] },
    { id: 'greece', name: 'Greece', icon: '🇬🇷', places: ['Santorini', 'Athens', 'Mykonos'] },
    { id: 'japan', name: 'Japan', icon: '🇯🇵', places: ['Tokyo', 'Kyoto', 'Osaka'] },
    { id: 'switzerland', name: 'Switzerland', icon: '🇨🇭', places: ['Zurich', 'Interlaken', 'Geneva'] },
    { id: 'singapore', name: 'Singapore', icon: '🇸🇬', places: ['Marina Bay', 'Sentosa', 'Orchard'] }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter destinations based on search
  const filteredDestinations = popularDestinations.filter(dest =>
    dest.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    dest.places.some(p => p.toLowerCase().includes(destinationSearch.toLowerCase()))
  );

  const handleDestinationSelect = (dest) => {
    setDestinationSearch(dest.icon + ' ' + dest.name);
    setFilters({ ...filters, searchTerm: dest.name });
    setShowDestinationDropdown(false);
  };

  const handleDestinationInputChange = (e) => {
    const value = e.target.value;
    setDestinationSearch(value);
    setFilters({ ...filters, searchTerm: value });
    setShowDestinationDropdown(true);
  };

  const clearDestination = () => {
    setDestinationSearch('');
    setFilters({ ...filters, searchTerm: '' });
  };

  const hotels = [
    {
      id: 1,
      name: 'Grand Hyatt Bali',
      location: 'Bali, Indonesia',
      rating: 4.9,
      reviews: 2456,
      price: 250,
      originalPrice: 320,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Beach Access', 'WiFi', 'Gym'],
      type: 'Luxury',
      stars: 5,
      freeCancellation: true,
      breakfast: true,
      discount: 22
    },
    {
      id: 2,
      name: 'Santorini Sky Resort',
      location: 'Santorini, Greece',
      rating: 4.8,
      reviews: 1834,
      price: 320,
      originalPrice: 400,
      image: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800',
      amenities: ['Infinity Pool', 'Caldera View', 'Breakfast', 'Bar', 'WiFi'],
      type: 'Luxury',
      stars: 5,
      freeCancellation: true,
      breakfast: true,
      discount: 20
    },
    {
      id: 3,
      name: 'Tokyo City Hotel',
      location: 'Tokyo, Japan',
      rating: 4.6,
      reviews: 3201,
      price: 180,
      originalPrice: 220,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      amenities: ['City View', 'Restaurant', 'Bar', 'Gym', 'WiFi'],
      type: 'Business',
      stars: 4,
      freeCancellation: true,
      breakfast: false,
      discount: 18
    },
    {
      id: 4,
      name: 'Swiss Alps Chalet',
      location: 'Interlaken, Switzerland',
      rating: 4.9,
      reviews: 987,
      price: 280,
      originalPrice: 350,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      amenities: ['Mountain View', 'Fireplace', 'Ski Access', 'Spa', 'Restaurant'],
      type: 'Resort',
      stars: 5,
      freeCancellation: true,
      breakfast: true,
      discount: 20
    },
    {
      id: 5,
      name: 'Dubai Marina Hotel',
      location: 'Dubai, UAE',
      rating: 4.7,
      reviews: 2876,
      price: 220,
      originalPrice: 280,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      amenities: ['Marina View', 'Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi'],
      type: 'Luxury',
      stars: 5,
      freeCancellation: true,
      breakfast: true,
      discount: 21
    },
    {
      id: 6,
      name: 'Phuket Beach Resort',
      location: 'Phuket, Thailand',
      rating: 4.5,
      reviews: 1543,
      price: 150,
      originalPrice: 190,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      amenities: ['Beach Front', 'Pool', 'Restaurant', 'Spa', 'WiFi'],
      type: 'Resort',
      stars: 4,
      freeCancellation: false,
      breakfast: true,
      discount: 21
    },
    {
      id: 7,
      name: 'Maldives Paradise Villa',
      location: 'Maldives',
      rating: 5.0,
      reviews: 892,
      price: 450,
      originalPrice: 580,
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      amenities: ['Overwater Villa', 'Private Pool', 'Butler Service', 'Spa', 'Diving'],
      type: 'Luxury',
      stars: 5,
      freeCancellation: true,
      breakfast: true,
      discount: 22
    },
    {
      id: 8,
      name: 'Singapore Marina Bay Hotel',
      location: 'Singapore',
      rating: 4.8,
      reviews: 2145,
      price: 290,
      originalPrice: 360,
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
      amenities: ['City View', 'Rooftop Pool', 'Casino', 'Restaurant', 'Spa'],
      type: 'Luxury',
      stars: 5,
      freeCancellation: true,
      breakfast: false,
      discount: 19
    }
  ];

  const filteredHotels = hotels.filter(hotel => {
    const matchesPrice = !filters.priceRange ||
      (filters.priceRange === 'budget' && hotel.price < 150) ||
      (filters.priceRange === 'moderate' && hotel.price >= 150 && hotel.price < 250) ||
      (filters.priceRange === 'luxury' && hotel.price >= 250);

    const matchesRating = !filters.rating || hotel.rating >= parseFloat(filters.rating);

    const matchesType = !filters.type || hotel.type === filters.type;

    const matchesSearch = !filters.searchTerm ||
      hotel.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return matchesPrice && matchesRating && matchesType && matchesSearch;
  });

  // Sort hotels
  const sortedHotels = [...filteredHotels];
  if (sortBy === 'price-low') {
    sortedHotels.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    sortedHotels.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    sortedHotels.sort((a, b) => b.rating - a.rating);
  }

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Pool': 'swimming-pool',
      'Infinity Pool': 'swimming-pool',
      'Private Pool': 'swimming-pool',
      'Rooftop Pool': 'swimming-pool',
      'Spa': 'spa',
      'Restaurant': 'utensils',
      'Bar': 'glass-martini-alt',
      'Beach Access': 'umbrella-beach',
      'Beach Front': 'umbrella-beach',
      'WiFi': 'wifi',
      'Gym': 'dumbbell',
      'City View': 'city',
      'Mountain View': 'mountain',
      'Marina View': 'water',
      'Caldera View': 'mountain',
      'Fireplace': 'fire',
      'Ski Access': 'skiing',
      'Breakfast': 'coffee',
      'Overwater Villa': 'home',
      'Butler Service': 'concierge-bell',
      'Diving': 'water',
      'Casino': 'dice'
    };
    return iconMap[amenity] || 'check';
  };

  return (
    <div className="hotels-page-new">
      {/* Hero Section */}
      <section className="hotels-hero">
        <div className="container">
          <div className="hotels-hero-content" data-aos="fade-up">
            <span className="hotels-hero-badge">Find Perfect Stay</span>
            <h1>Book Your Dream Hotel</h1>
            <p className="hotels-hero-subtitle">
              Handpicked hotels, best prices guaranteed, 24/7 support
            </p>
          </div>

          {/* Search Bar */}
          <div className="hotels-search-bar" data-aos="fade-up" data-aos-delay="100">
            <div className="search-fields-row">
              {/* Destination Field */}
              <div className="search-field destination-field" ref={dropdownRef}>
                <div className="field-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="field-content">
                  <label>Destination</label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destinationSearch}
                    onChange={handleDestinationInputChange}
                    onFocus={() => setShowDestinationDropdown(true)}
                    className="destination-input"
                  />
                </div>
                {destinationSearch && (
                  <button className="clear-search-btn" onClick={clearDestination}>
                    <i className="fas fa-times"></i>
                  </button>
                )}

                {/* Destination Dropdown */}
                {showDestinationDropdown && (
                  <div className="destination-dropdown">
                    <div className="dropdown-header">
                      <i className="fas fa-globe"></i>
                      <span>Popular Destinations</span>
                    </div>
                    <div className="dropdown-list">
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map(dest => (
                          <div
                            key={dest.id}
                            className="dropdown-item"
                            onClick={() => handleDestinationSelect(dest)}
                          >
                            <span className="item-icon">{dest.icon}</span>
                            <div className="item-content">
                              <span className="item-name">{dest.name}</span>
                              <span className="item-places">{dest.places.join(', ')}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-empty">
                          <i className="fas fa-search"></i>
                          <span>No destinations found</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="field-divider"></div>

              {/* Check-in Date */}
              <div className="search-field">
                <div className="field-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="field-content">
                  <label>Check In</label>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                    className="date-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="field-divider"></div>

              {/* Check-out Date */}
              <div className="search-field">
                <div className="field-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="field-content">
                  <label>Check Out</label>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                    className="date-input"
                    min={filters.checkIn}
                  />
                </div>
              </div>

              <div className="field-divider"></div>

              {/* Guests */}
              <div className="search-field">
                <div className="field-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="field-content">
                  <label>Guests</label>
                  <select
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                    className="filter-select-inline"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button className="search-hotels-btn">
                <i className="fas fa-search"></i>
                <span>Search</span>
              </button>
            </div>

            {/* Active Filters */}
            {(filters.priceRange || filters.type || filters.rating) && (
              <div className="active-filters-bar">
                <span className="filters-label"><i className="fas fa-filter"></i> Active Filters:</span>
                {filters.priceRange && (
                  <span className="filter-tag">
                    <i className="fas fa-dollar-sign"></i>
                    {filters.priceRange === 'budget' ? 'Budget' : filters.priceRange === 'moderate' ? 'Moderate' : 'Luxury'}
                    <button onClick={() => setFilters({ ...filters, priceRange: '' })}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.type && (
                  <span className="filter-tag">
                    <i className="fas fa-hotel"></i> {filters.type}
                    <button onClick={() => setFilters({ ...filters, type: '' })}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.rating && (
                  <span className="filter-tag">
                    <i className="fas fa-star"></i> {filters.rating}+ Stars
                    <button onClick={() => setFilters({ ...filters, rating: '' })}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                <button
                  className="clear-all-btn"
                  onClick={() => setFilters({ ...filters, priceRange: '', type: '', rating: '' })}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="quick-categories">
        <div className="container">
          <div className="categories-scroll" data-aos="fade-up">
            {[
              { icon: 'fa-gem', name: 'Luxury', value: 'Luxury' },
              { icon: 'fa-briefcase', name: 'Business', value: 'Business' },
              { icon: 'fa-umbrella-beach', name: 'Resort', value: 'Resort' },
              { icon: 'fa-home', name: 'Boutique', value: 'Boutique' },
              { icon: 'fa-wallet', name: 'Budget', value: 'budget', priceFilter: true },
              { icon: 'fa-tags', name: 'Moderate', value: 'moderate', priceFilter: true },
              { icon: 'fa-crown', name: 'Premium', value: 'luxury', priceFilter: true }
            ].map((cat, index) => (
              <button
                key={index}
                className={`category-chip ${
                  cat.priceFilter
                    ? filters.priceRange === cat.value ? 'active' : ''
                    : filters.type === cat.value ? 'active' : ''
                }`}
                onClick={() => {
                  if (cat.priceFilter) {
                    setFilters({ ...filters, priceRange: filters.priceRange === cat.value ? '' : cat.value, type: '' });
                  } else {
                    setFilters({ ...filters, type: filters.type === cat.value ? '' : cat.value, priceRange: '' });
                  }
                }}
              >
                <i className={`fas ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="hotels-results">
        <div className="container">
          {/* Results Header */}
          <div className="results-header" data-aos="fade-up">
            <div className="results-info">
              <h2>{sortedHotels.length} Hotel{sortedHotels.length !== 1 ? 's' : ''} Found</h2>
              <p>Best prices guaranteed • Free cancellation • 24/7 support</p>
            </div>
            <div className="results-controls">
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Hotels Grid/List */}
          <div className={`hotels-grid ${viewMode}`}>
            {sortedHotels.map((hotel) => (
              <div key={hotel.id} className="hotel-card-new">
                <div className="hotel-card-image">
                  <img src={hotel.image} alt={hotel.name} />
                  <div className="hotel-card-badges">
                    <span className="stars-badge">{'⭐'.repeat(hotel.stars)}</span>
                    {hotel.discount && (
                      <span className="discount-badge">{hotel.discount}% OFF</span>
                    )}
                    <span className="type-badge">{hotel.type}</span>
                  </div>
                  <button className="wishlist-btn">
                    <i className="far fa-heart"></i>
                  </button>
                  <div className="hotel-card-overlay">
                    <Link to={`/hotel-detail/${hotel.id}`} className="quick-view-btn">
                      Quick View
                    </Link>
                  </div>
                </div>

                <div className="hotel-card-content">
                  <div className="hotel-card-meta">
                    <span className="hotel-location">
                      <i className="fas fa-map-marker-alt"></i> {hotel.location}
                    </span>
                    <span className="hotel-rating">
                      <i className="fas fa-star"></i> {hotel.rating}
                      <span className="reviews">({hotel.reviews})</span>
                    </span>
                  </div>

                  <Link to={`/hotel-detail/${hotel.id}`} className="hotel-card-title">
                    {hotel.name}
                  </Link>

                  <div className="hotel-card-amenities">
                    {hotel.amenities.slice(0, 4).map((amenity, i) => (
                      <span key={i} className="amenity-tag">
                        <i className={`fas fa-${getAmenityIcon(amenity)}`}></i>
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="amenity-tag">+{hotel.amenities.length - 4}</span>
                    )}
                  </div>

                  <div className="hotel-room-info">
                    <div className="room-info-item">
                      <i className="fas fa-bed"></i>
                      <span>King Bed</span>
                    </div>
                    <div className="room-info-item">
                      <i className="fas fa-ruler-combined"></i>
                      <span>45 m²</span>
                    </div>
                    {hotel.breakfast && (
                      <div className="room-info-item">
                        <i className="fas fa-coffee"></i>
                        <span>Breakfast</span>
                      </div>
                    )}
                  </div>

                  <div className="hotel-card-footer">
                    <div className="hotel-price">
                      <span className="original-price">${hotel.originalPrice}</span>
                      <span className="current-price">
                        ${hotel.price}
                        <span className="per-night">/night</span>
                      </span>
                    </div>
                    <Link to={`/hotel-detail/${hotel.id}`} className="book-now-btn">
                      <i className="fas fa-bed"></i> Book Now
                    </Link>
                  </div>

                  {hotel.freeCancellation && (
                    <div className="free-cancel-badge">
                      <i className="fas fa-check-circle"></i>
                      Free cancellation available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedHotels.length === 0 && (
            <div className="no-results-new" data-aos="fade-up">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Hotels Found</h3>
              <p>Try adjusting your filters or search for something else</p>
              <button
                className="reset-btn"
                onClick={() => setFilters({
                  priceRange: '',
                  rating: '',
                  type: '',
                  searchTerm: '',
                  checkIn: new Date().toISOString().split('T')[0],
                  checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  guests: '2'
                })}
              >
                <i className="fas fa-redo"></i> Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="hotels-why-choose">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">Why Travel Axis</span>
            <h2>Book With Confidence</h2>
          </div>
          <div className="benefits-grid" data-aos="fade-up">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Verified Hotels</h4>
              <p>All properties are thoroughly vetted</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h4>Best Price Guarantee</h4>
              <p>We match any lower price you find</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h4>24/7 Support</h4>
              <p>Help available round the clock</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fas fa-undo-alt"></i>
              </div>
              <h4>Free Cancellation</h4>
              <p>Cancel for free on most bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hotels-cta-section">
        <div className="container">
          <div className="hotels-cta-box" data-aos="fade-up">
            <div className="cta-content">
              <h3>Can't Find What You're Looking For?</h3>
              <p>Let our travel experts help you find the perfect accommodation</p>
              <div className="cta-buttons">
                <Link to="/contact" className="cta-btn primary">
                  <i className="fas fa-envelope"></i> Contact Us
                </Link>
                <a href="tel:+919035461093" className="cta-btn secondary">
                  <i className="fas fa-phone-alt"></i> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
