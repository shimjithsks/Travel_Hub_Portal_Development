import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/tours.css';

export default function Tours() {
  const location = useLocation();
  console.log('Tours page loaded. location.state:', location.state);
  
  const [filters, setFilters] = useState({
    priceRange: '',
    duration: '',
    category: '',
    searchTerm: location.state && location.state.searchTerm ? location.state.searchTerm : ''
  });

  const [sortBy, setSortBy] = useState('recommended');

  // If navigated with a searchTerm, update filter on mount
  useEffect(() => {
    if (location.state && location.state.searchTerm) {
      setFilters(f => ({ ...f, searchTerm: location.state.searchTerm }));
    }
  }, [location.state]);

  const tours = [
    { 
      id: 1, 
      name: 'Beautiful Leh With Pangong Lake (Standard)', 
      price: 22290, 
      originalPrice: 27000,
      duration: '4 Nights / 5 Days', 
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 
      rating: 4.8,
      reviews: 234,
      location: 'Leh (4N)',
      category: 'Nature & Adventure',
      highlights: ['Leh Palace', 'Pangong Lake', 'Nubra Valley', 'Khardung La Pass'],
      destinations: ['Leh', 'Pangong Lake', 'Nubra Valley', 'Khardung La', 'Diskit'],
      included: ['Meals', 'Hotel', 'Transfer', 'Sightseeing'],
      operatorName: 'Yatra',
      verified: true,
      eCash: 668,
      discount: 18
    },
    { 
      id: 2, 
      name: 'Greece Island Hopping Tour', 
      price: 75000, 
      originalPrice: 85000,
      duration: '7 Days 6 Nights', 
      image: 'https://images.unsplash.com/photo-1503152394-c571994fd383?w=800', 
      rating: 5.0,
      reviews: 234,
      location: 'Greece',
      category: 'Beach & Adventure',
      highlights: ['Athens', 'Santorini', 'Mykonos', 'Acropolis'],
      destinations: ['Athens', 'Mykonos', 'Santorini', 'Oia', 'Acropolis'],
      included: ['Hotels', 'Breakfast', 'Transfers', 'Ferry Tickets'],
      operatorName: 'Wanderlust Travels',
      verified: true,
      eCash: 2250,
      discount: 12
    },
    { 
      id: 3, 
      name: 'Italy Cultural Experience', 
      price: 92000, 
      originalPrice: 105000,
      duration: '8 Days 7 Nights', 
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800', 
      rating: 4.8,
      reviews: 189,
      location: 'Italy',
      category: 'Culture & Heritage',
      highlights: ['Rome', 'Florence', 'Venice', 'Vatican City'],
      destinations: ['Rome', 'Florence', 'Venice', 'Vatican City', 'Milan'],
      included: ['Hotels', 'Guided Tours', 'Some Meals', 'Train Passes'],
      operatorName: 'Euro Tours India',
      verified: true,
      eCash: 2760,
      discount: 12
    },
    { 
      id: 4, 
      name: 'Dubai Luxury Escape', 
      price: 45000, 
      originalPrice: 52000,
      duration: '5 Days 4 Nights', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 
      rating: 4.9,
      reviews: 312,
      location: 'Dubai',
      category: 'Luxury & Shopping',
      highlights: ['Burj Khalifa', 'Desert Safari', 'Palm Jumeirah', 'Dubai Mall'],
      destinations: ['Dubai', 'Abu Dhabi', 'Burj Khalifa', 'Palm Jumeirah'],
      included: ['5-Star Hotels', 'All Meals', 'Activities', 'City Tours'],
      operatorName: 'Arabian Nights Travel',
      verified: true,
      eCash: 1350,
      discount: 13
    },
    { 
      id: 5, 
      name: 'Switzerland Alpine Adventure', 
      price: 135000, 
      originalPrice: 155000,
      duration: '10 Days 9 Nights', 
      image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800', 
      rating: 5.0,
      reviews: 156,
      location: 'Switzerland',
      category: 'Nature & Adventure',
      highlights: ['Zurich', 'Interlaken', 'Jungfrau', 'Lucerne'],
      included: ['Hotels', 'Train Passes', 'Excursions', 'Cable Car Rides'],
      destinations: ['Zurich', 'Interlaken', 'Jungfrau', 'Lucerne', 'Geneva', 'Bern'],
      operatorName: 'Alpine Explorers',
      verified: true,
      eCash: 4050,
      discount: 13
    },
    { 
      id: 6, 
      name: 'Japan Cherry Blossom Tour', 
      price: 165000, 
      originalPrice: 190000,
      duration: '12 Days 11 Nights', 
      image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800', 
      rating: 5.0,
      reviews: 278,
      location: 'Japan',
      category: 'Culture & Nature',
      highlights: ['Tokyo', 'Kyoto', 'Mt. Fuji', 'Hiroshima'],
      included: ['Hotels', 'JR Pass', 'Guided Tours', 'Some Meals'],
      destinations: ['Tokyo', 'Kyoto', 'Mt. Fuji', 'Hiroshima', 'Osaka', 'Nara'],
      operatorName: 'Orient Express Tours',
      verified: true,
      eCash: 4950,
      discount: 13
    },
    { 
      id: 7, 
      name: 'Thailand Beach Paradise', 
      price: 32000, 
      originalPrice: 38000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', 
      rating: 4.7,
      reviews: 423,
      location: 'Thailand',
      category: 'Beach & Relaxation',
      highlights: ['Phuket', 'Phi Phi Island', 'Krabi', 'James Bond Island'],
      included: ['Resort Stay', 'Breakfast', 'Island Tours', 'Speed Boat'],
      destinations: ['Phuket', 'Phi Phi Island', 'Krabi', 'James Bond Island', 'Patong Beach'],
      operatorName: 'Thai Paradise Holidays',
      verified: true,
      eCash: 960,
      discount: 16
    },
    { 
      id: 7, 
      name: 'Thailand Beach Paradise', 
      price: 32000, 
      originalPrice: 38000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', 
      rating: 4.7,
      reviews: 423,
      location: 'Thailand',
      category: 'Beach & Relaxation',
      highlights: ['Phuket', 'Phi Phi Island', 'Krabi', 'James Bond Island'],
      included: ['Resort Stay', 'Breakfast', 'Island Tours', 'Speed Boat'],
      operatorName: 'Thai Paradise Holidays',
      verified: true,
      eCash: 960,
      discount: 16
    },
    { 
      id: 8, 
      name: 'Bali Spiritual Retreat', 
      price: 42000, 
      originalPrice: 48000,
      duration: '7 Days 6 Nights', 
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 
      rating: 4.9,
      reviews: 198,
      location: 'Bali',
      category: 'Wellness & Culture',
      highlights: ['Ubud', 'Tanah Lot', 'Rice Terraces', 'Temples'],
      included: ['Villas', 'Spa Sessions', 'Yoga Classes', 'Breakfast'],
      destinations: ['Ubud', 'Tanah Lot', 'Seminyak', 'Uluwatu', 'Kuta'],
      operatorName: 'Bali Bliss Tours',
      verified: true,
      eCash: 1260,
      discount: 13
    },
    { 
      id: 9, 
      name: 'Maldives Honeymoon Special', 
      price: 120000, 
      originalPrice: 145000,
      duration: '5 Days 4 Nights', 
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 
      rating: 5.0,
      reviews: 267,
      location: 'Maldives',
      category: 'Luxury & Romance',
      highlights: ['Overwater Villa', 'Private Beach', 'Water Sports', 'Sunset Cruise'],
      included: ['Luxury Resort', 'All-Inclusive', 'Spa', 'Private Dining'],
      destinations: ['Male', 'Hulhumale', 'Maafushi', 'Baros Island', 'Adaaran Prestige'],
      operatorName: 'Island Dreams Maldives',
      verified: true,
      eCash: 3600,
      discount: 17
    },
    { 
      id: 10, 
      name: 'Kerala Backwaters & Hills', 
      price: 18500, 
      originalPrice: 22000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 
      rating: 4.7,
      reviews: 342,
      location: 'Kerala',
      category: 'Nature & Relaxation',
      highlights: ['Munnar', 'Thekkady', 'Alleppey', 'Houseboat'],
      included: ['Hotels', 'Houseboat Stay', 'Meals', 'Transfers'],
      destinations: ['Munnar', 'Thekkady', 'Alleppey', 'Kochi', 'Kumarakom'],
      operatorName: 'Kerala Holidays',
      verified: true,
      eCash: 555,
      discount: 16
    },
    { 
      id: 11, 
      name: 'Rajasthan Royal Heritage', 
      price: 28500, 
      originalPrice: 34000,
      duration: '8 Days 7 Nights', 
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', 
      rating: 4.8,
      reviews: 456,
      location: 'Rajasthan',
      category: 'Culture & Heritage',
      highlights: ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur'],
      included: ['Heritage Hotels', 'Guided Tours', 'Meals', 'Camel Safari'],
      destinations: ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur', 'Pushkar', 'Mount Abu'],
      operatorName: 'Royal Rajasthan Tours',
      verified: true,
      eCash: 855,
      discount: 16
    },
    { 
      id: 12, 
      name: 'Singapore Malaysia Delight', 
      price: 52000, 
      originalPrice: 62000,
      duration: '7 Days 6 Nights', 
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', 
      rating: 4.6,
      reviews: 289,
      location: 'Singapore & Malaysia',
      category: 'City & Entertainment',
      highlights: ['Singapore', 'Sentosa', 'Kuala Lumpur', 'Genting Highlands'],
      included: ['Hotels', 'Transfers', 'Theme Parks', 'City Tours'],
      destinations: ['Singapore', 'Sentosa Island', 'Kuala Lumpur', 'Genting Highlands', 'Malacca', 'Putrajaya'],
      operatorName: 'Southeast Asia Tours',
      verified: true,
      eCash: 1560,
      discount: 16
    },
  ];

  const filteredTours = tours.filter(tour => {
    const matchesPrice = !filters.priceRange || 
      (filters.priceRange === 'low' && tour.price < 40000) ||
      (filters.priceRange === 'medium' && tour.price >= 40000 && tour.price < 100000) ||
      (filters.priceRange === 'high' && tour.price >= 100000);
    
    const matchesDuration = !filters.duration ||
      (filters.duration === 'short' && (tour.duration.includes('4') || tour.duration.includes('5') || tour.duration.includes('6'))) ||
      (filters.duration === 'medium' && (tour.duration.includes('7') || tour.duration.includes('8'))) ||
      (filters.duration === 'long' && (tour.duration.includes('10') || tour.duration.includes('12')));
    
    const matchesCategory = !filters.category || tour.category.toLowerCase().includes(filters.category.toLowerCase());
    
    const matchesSearch = !filters.searchTerm || 
      tour.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      tour.highlights.some(h => h.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    return matchesPrice && matchesDuration && matchesCategory && matchesSearch;
  });

  // Sort filtered tours
  const sortedTours = [...filteredTours];
  if (sortBy === 'price-low') {
    sortedTours.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    sortedTours.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    sortedTours.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'duration') {
    sortedTours.sort((a, b) => {
      const daysA = parseInt(a.duration.match(/\d+/)[0]);
      const daysB = parseInt(b.duration.match(/\d+/)[0]);
      return daysB - daysA;
    });
  }

  // Icon mapping for inclusions
  const getInclusionIcon = (inclusion) => {
    const lowerInclusion = inclusion.toLowerCase();
    const iconMap = {
      'Meals': 'utensils',
      'Hotel': 'hotel',
      'Hotels': 'hotel',
      'Transfer': 'bus',
      'Transfers': 'bus',
      'Sightseeing': 'binoculars',
      'Breakfast': 'coffee',
      'Guided Tours': 'user-tie',
      'Some Meals': 'utensils',
      '5-Star Hotels': 'star',
      'All Meals': 'utensils',
      'Activities': 'running',
      'Train Passes': 'train',
      'Excursions': 'mountain',
      'JR Pass': 'train',
      'Resort Stay': 'umbrella-beach',
      'Island Tours': 'island-tropical',
      'Villas': 'home',
      'Spa Sessions': 'spa',
      'Yoga Classes': 'person-praying',
      'Luxury Resort': 'gem',
      'All-Inclusive': 'infinity',
      'Spa': 'spa',
      'Houseboat Stay': 'ship',
      'Houseboat': 'ship',
      'Heritage Hotels': 'landmark',
      'Camel Safari': 'horse',
      'Theme Parks': 'ferris-wheel',
      'City Tours': 'city',
      'Ferry Tickets': 'ferry',
      'Cable Car Rides': 'cable-car',
      'Speed Boat': 'sailboat',
      'Private Dining': 'champagne-glasses',
      'Water Sports': 'person-swimming'
    };
    
    // Match by lowercase key
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerInclusion.includes(key.toLowerCase())) {
        return icon;
      }
    }
    return 'check';
  };

  return (
    <div className="tours-page">
      {/* Hero Header Section */}
      <section className="tours-header">
        <div className="container">
          <h1>Explore Our Tour Packages</h1>
          <p>Discover amazing destinations worldwide with our curated tours</p>

          {/* Filter Bar */}
          <div className="tours-filter-bar">
            <div className="filter-bar-fields">
              <div className="field-group">
                <label>Search Tours or Destinations</label>
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search by tour name, location, or highlights..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  />
                </div>
              </div>
              <div className="field-group">
                <label>Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="">All Prices</option>
                  <option value="low">Under ₹40,000</option>
                  <option value="medium">₹40,000 - ₹1,00,000</option>
                  <option value="high">₹1,00,000+</option>
                </select>
              </div>
              <div className="field-group">
                <label>Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({...filters, duration: e.target.value})}
                >
                  <option value="">All Durations</option>
                  <option value="short">4-6 Days</option>
                  <option value="medium">7-8 Days</option>
                  <option value="long">10+ Days</option>
                </select>
              </div>
              <div className="field-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="Beach">Beach & Adventure</option>
                  <option value="Culture">Culture & Heritage</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Nature">Nature & Adventure</option>
                  <option value="Wellness">Wellness</option>
                  <option value="City">City & Entertainment</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="tours-content">
        <div className="container">
          {/* Promotional Banner */}
          <div className="promo-banner">
            <div className="promo-content">
              <i className="fas fa-gift"></i>
              <span><strong>Special Offer:</strong> Get up to 20% OFF on tour packages. Use code: <strong>TOUR20</strong></span>
            </div>
            <button className="promo-cta">View Offers</button>
          </div>

          <div className="listings-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <h3>Filter Options</h3>
              
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search tours..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                />
              </div>

              <div className="filter-group">
                <label>Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="">All Prices</option>
                  <option value="low">Under ₹40,000</option>
                  <option value="medium">₹40,000 - ₹1,00,000</option>
                  <option value="high">₹1,00,000+</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({...filters, duration: e.target.value})}
                >
                  <option value="">All Durations</option>
                  <option value="short">4-6 Days</option>
                  <option value="medium">7-8 Days</option>
                  <option value="long">10+ Days</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="Beach">Beach & Adventure</option>
                  <option value="Culture">Culture & Heritage</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Nature">Nature & Adventure</option>
                  <option value="Wellness">Wellness</option>
                  <option value="City">City & Entertainment</option>
                </select>
              </div>

              <button 
                className="clear-filters-btn"
                onClick={() => setFilters({
                  priceRange: '',
                  duration: '',
                  category: '',
                  searchTerm: ''
                })}
              >
                <i className="fas fa-redo"></i> Clear Filters
              </button>
            </aside>

            {/* Tours List */}
            <div className="tours-main">
              <div className="results-header">
                <div className="results-title-section">
                  <h2>{sortedTours.length} Package{sortedTours.length !== 1 ? 's' : ''} Available</h2>
                  <p className="results-subtitle">Best prices • Verified operators • Instant booking</p>
                </div>
                <div className="sort-controls">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: High to Low</option>
                    <option value="duration">Duration: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="tours-list">
                {sortedTours.map((tour) => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-image">
                      <img src={tour.image} alt={tour.name} />
                      {tour.verified && (
                        <span className="verified-badge">
                          <i className="fas fa-certificate"></i>
                        </span>
                      )}
                    </div>
                    
                    <div className="tour-details">
                      <div className="tour-header">
                        <Link to={`/tour-details/${tour.id}`} className="tour-title">
                          {tour.name}
                        </Link>
                      </div>

                      <div className="tour-duration">
                        <i className="far fa-moon"></i>
                        <span>{tour.duration.split('/')[0]} /</span>
                        <br />
                        <i className="far fa-sun"></i>
                        <span>{tour.duration.split('/')[1]}</span>
                      </div>

                      <div className="tour-seller">
                        Seller : <Link to="#" className="seller-link">{tour.operatorName}</Link>
                        {tour.verified && (
                          <span className="verified-partner-badge">
                            <i className="fas fa-check-circle"></i> Verified Partner
                          </span>
                        )}
                      </div>

                      <div className="tour-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{tour.location}</span>
                      </div>

                      <div className="tour-inclusions">
                        {tour.included.slice(0, 4).map((item, index) => (
                          <div key={index} className="inclusion-item">
                            <i className={`fas fa-${getInclusionIcon(item)}`}></i>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tour-pricing">
                      <div className="price-wrapper">
                        <div className="price-amount">
                          <span className="currency">rs</span>
                          <span className="price">{tour.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="price-info">Per Person on twin sharing</div>
                      </div>
                      <Link 
                        to={`/tour-details/${tour.id}`}
                        className="view-details-btn"
                      >
                        View Details
                      </Link>
                      <div className="ecash-earning">
                        Earn eCash <span className="ecash-amount">rs {tour.eCash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sortedTours.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-plane-slash"></i>
                  <h3>No tour packages found</h3>
                  <p>Try adjusting your search filters or browse all tours</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <h2>Why Book With Us?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <i className="fas fa-shield-check"></i>
              <h3>Verified Operators</h3>
              <p>All tour operators are verified and trusted</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-tags"></i>
              <h3>Best Price Guarantee</h3>
              <p>Get the best deals on tour packages</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-headset"></i>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer assistance</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-undo"></i>
              <h3>Easy Cancellation</h3>
              <p>Flexible cancellation policies</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
