import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import LoginModal from '../components/LoginModal';
import '../styles/yatraHome.css';

export default function Home() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if first visit - show login modal
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      sessionStorage.setItem('hasVisitedBefore', 'true');
      setShowLoginModal(true);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('fleet');
  const [tripType, setTripType] = useState('oneWay');
  const [fromCity, setFromCity] = useState({ name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International' });
  const [toCity, setToCity] = useState({ name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji International' });
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  
  // Fleet search state
  const [fleetSearch, setFleetSearch] = useState({
    location: '',
    vehicleCategory: '',
    date: '',
    dropoffDate: ''
  });

  // Popular pickup locations
  const popularLocations = [
    'Kozhikkode',
    'Kochi',
    'Thiruvananthapuram',
    'Bengaluru',
    'Mumbai',
    'Delhi',
    'Chennai',
    'Hyderabad',
    'Pune',
    'Goa',
    'Jaipur',
    'Udaipur',
    'Agra',
    'Mysuru',
    'Coimbatore',
    'Madurai',
    'Wayanad',
    'Munnar',
    'Ooty',
    'Manali'
  ];

  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(popularLocations);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Holiday search state
  const [holidaySearch, setHolidaySearch] = useState({
    destination: '',
    date: '',
    duration: '3-5 Days',
  });
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(popularLocations);
  // Handle destination input change for holidays
  const handleDestinationChange = (value) => {
    setHolidaySearch({ ...holidaySearch, destination: value });
    if (value.trim()) {
      const filtered = popularLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setFilteredDestinations(popularLocations);
      setShowDestinationSuggestions(true);
    }
  };

  // Select destination from suggestions
  const selectDestination = (destination) => {
    setHolidaySearch({ ...holidaySearch, destination });
    setShowDestinationSuggestions(false);
  };

  // Handle location input change
  const handleLocationChange = (value) => {
    setFleetSearch({...fleetSearch, location: value});
    
    if (value.trim()) {
      const filtered = popularLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationSuggestions(true);
    } else {
      setFilteredLocations(popularLocations);
      setShowLocationSuggestions(true);
    }
  };

  // Select location from suggestions
  const selectLocation = (location) => {
    setFleetSearch({...fleetSearch, location});
    setShowLocationSuggestions(false);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS Coordinates:', latitude, longitude);
        
        try {
          // Use Nominatim reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'TravelFleetApp/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log('Full Geocoding Response:', data);
            
            let placeName = '';
            
            if (data.address) {
              // Try different address components in order of specificity
              placeName = data.address.town ||
                         data.address.village ||
                         data.address.suburb ||
                         data.address.neighbourhood ||
                         data.address.hamlet ||
                         data.address.city ||
                         data.address.county ||
                         data.address.state_district;
              
              // If we found a place, optionally add city for context
              if (placeName && data.address.city && placeName !== data.address.city) {
                placeName = `${placeName}, ${data.address.city}`;
              } else if (placeName && data.address.state_district && placeName !== data.address.state_district) {
                placeName = `${placeName}, ${data.address.state_district}`;
              }
              
              // Last resort: use display name
              if (!placeName) {
                placeName = data.display_name.split(',')[0].trim();
              }
              
              console.log('Extracted Place Name:', placeName);
              setFleetSearch({...fleetSearch, location: placeName});
            } else {
              throw new Error('No address data in response');
            }
          } else {
            throw new Error('Geocoding API request failed');
          }
        } catch (error) {
          console.error('Geocoding Error:', error);
          // Show a more user-friendly message
          alert('Could not determine location name. Please enter manually or try again.');
          setIsGettingLocation(false);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        alert('Unable to retrieve your location. Please ensure location permission is granted and try again.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const specialOffers = [
    {
      id: 1,
      title: 'Up to Rs. 15,000 OFF',
      subtitle: 'On Domestic Flights',
      description: 'Offer Valid on American Express® Cards Transactions Only.',
      code: 'AMEXFEST',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400'
    },
    {
      id: 2,
      title: 'Up to Rs. 17,500 OFF',
      subtitle: 'On Domestic Flights',
      description: 'Offer Valid on American Express® Credit Cards EMI Transactions',
      code: 'AMEXFESTEMI',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400'
    },
    {
      id: 3,
      title: 'Up to Rs. 2,400 OFF',
      subtitle: 'On Domestic Flights',
      description: 'Offer Valid on RBL Bank Credit Card Transactions only',
      code: 'TRAVELRBL',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
    },
    {
      id: 4,
      title: 'Up to Rs. 2,025 OFF',
      subtitle: 'On Domestic Flights',
      description: 'Offer Valid on HSBC Bank Credit Cards transaction only.',
      code: 'TRAVELHSBC',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'
    },
    {
      id: 5,
      title: 'Singapore Airlines Flights',
      subtitle: 'Save Up to Rs. 12,000',
      description: 'Special offers on Singapore Airlines',
      code: 'TASQ',
      image: 'https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=400'
    },
    {
      id: 6,
      title: 'Up to Rs. 2,500 OFF',
      subtitle: 'On Domestic Flights',
      description: 'Offer Valid on HDFC Bank EASYEMI Transactions on Credit Cards',
      code: 'TAHDFCCCEMI6',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'
    }
  ];

  const recommendedHotels = [
    {
      id: 1,
      name: 'The Chancery Pavilion',
      city: 'Bangalore',
      rating: 5.0,
      price: 4988,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    },
    {
      id: 2,
      name: 'Pride Plaza Hotel',
      city: 'Kolkata',
      rating: 5.0,
      price: 5413,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'
    },
    {
      id: 3,
      name: 'The Oberoi Grand',
      city: 'Mumbai',
      rating: 5.0,
      price: 8500,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'
    },
    {
      id: 4,
      name: 'Taj Palace',
      city: 'New Delhi',
      rating: 5.0,
      price: 12000,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
    }
  ];

  const domesticDestinations = [
    { name: 'Mumbai', price: 9401, image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=300' },
    { name: 'Bangalore', price: 11198, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300' },
    { name: 'Pune', price: 9998, image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=300' },
    { name: 'Kolkata', price: 7997, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=300' },
    { name: 'Hyderabad', price: 8199, image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300' },
    { name: 'Chennai', price: 10500, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300' }
  ];

  const internationalDestinations = [
    { name: 'Dubai', region: 'Middle East', price: 20831, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300' },
    { name: 'Singapore', region: 'Asia', price: 11782, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=300' },
    { name: 'London', region: 'Europe', price: 23630, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300' },
    { name: 'Paris', region: 'Europe', price: 25000, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300' },
    { name: 'New York', region: 'North America', price: 35000, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300' },
    { name: 'Bali', region: 'Asia', price: 15000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300' }
  ];

  const whyTravelAxisFeatures = [
    {
      icon: '✈️',
      title: 'Search Flights and Hotels with Exclusive Deals',
      description: 'Search for exclusive deals on flights and hotels. Find cheap air tickets to any destination you like.'
    },
    {
      icon: '🛡️',
      title: 'Enjoy Secure Flight Bookings with Protection',
      description: 'Book with confidence knowing your transactions are secure and protected.'
    },
    {
      icon: '🏖️',
      title: 'Holiday Options for Every Budget and Interest',
      description: 'From budget to luxury, find holidays that match your style and budget.'
    },
    {
      icon: '🎯',
      title: 'Customize Your Trip with Best Combinations',
      description: 'Mix and match flights, hotels, and activities to create your perfect trip.'
    },
    {
      icon: '🎫',
      title: 'Skip the Ticket Queue for Monument Visits',
      description: 'Book tickets online and skip the long queues at popular attractions.'
    },
    {
      icon: '🎁',
      title: 'Get New Deals Every Season for Flights and Hotels',
      description: 'Enjoy seasonal offers and discounts throughout the year.'
    },
    {
      icon: '💬',
      title: 'Customer Support Backed by Millions of Satisfied Travelers',
      description: '24/7 customer support to help you with all your travel needs.'
    }
  ];

  return (
    <div className="yatra-home">
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Promotional Top Banner */}
      <section className="promo-top-banner">
        <div className="container">
          <div className="promo-content">
            <i className="fas fa-fire promo-icon"></i>
            <div className="promo-text">
              <span className="promo-highlight">FLAT 15% OFF</span>
              <span className="promo-description">on Domestic & International Travel • Use Code: TRAVEL2025</span>
            </div>
            <Link to="/tour" className="promo-cta">
              GRAB DEAL <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-indicators">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="trust-content">
                <h4>100% Secure Payments</h4>
                <p>All major credit & debit cards accepted</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div className="trust-content">
                <h4>24/7 Customer Support</h4>
                <p>We're always here to help you</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <i className="fas fa-award"></i>
              </div>
              <div className="trust-content">
                <h4>Best Price Guarantee</h4>
                <p>Find a lower price? We'll match it!</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="trust-content">
                <h4>2M+ Happy Customers</h4>
                <p>Trusted by millions worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with Search */}
      <section className="hero-search-section">
        <div className="hero-overlay">
          <div className="container">
            <div className="search-widget-wrapper">
              {/* Tab Navigation */}
              <div className="search-tabs">
                <button 
                  className={`search-tab ${activeTab === 'fleet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fleet')}
                >
                  <i className="fas fa-shuttle-van"></i> Travel Fleet
                </button>
                <button 
                  className={`search-tab ${activeTab === 'holidays' ? 'active' : ''}`}
                  onClick={() => setActiveTab('holidays')}
                >
                  <i className="fas fa-umbrella-beach"></i> Holidays
                </button>
                <button 
                  className={`search-tab ${activeTab === 'hotels' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hotels')}
                >
                  <i className="fas fa-hotel"></i> Hotels
                  <span className="offer-badge">Upto 50% Off</span>
                </button>
                <button 
                  className={`search-tab ${activeTab === 'flights' ? 'active' : ''}`}
                  onClick={() => setActiveTab('flights')}
                >
                  <i className="fas fa-plane"></i> Flights
                  <span className="offer-badge">Upto 19% Off</span>
                </button>
                <button 
                  className={`search-tab ${activeTab === 'trains' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trains')}
                >
                  <i className="fas fa-train"></i> Trains
                </button>
                <button 
                  className={`search-tab ${activeTab === 'cabs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cabs')}
                >
                  <i className="fas fa-car"></i> Cabs
                </button>
              </div>

              {/* Flight Search Form */}
              {activeTab === 'flights' && (
                <div className="search-form-container" data-aos="fade-up">
                  <div className="trip-type-selector">
                    <label className={tripType === 'oneWay' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="tripType" 
                        checked={tripType === 'oneWay'}
                        onChange={() => setTripType('oneWay')}
                      />
                      One Way
                    </label>
                    <label className={tripType === 'roundTrip' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="tripType"
                        checked={tripType === 'roundTrip'}
                        onChange={() => setTripType('roundTrip')}
                      />
                      Round Trip
                    </label>
                    <label className={tripType === 'multiCity' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="tripType"
                        checked={tripType === 'multiCity'}
                        onChange={() => setTripType('multiCity')}
                      />
                      Multi City
                    </label>
                  </div>

                  <div className="search-fields">
                    <div className="field-group city-selector">
                      <label>Departure From</label>
                      <div className="city-input">
                        <div className="city-name">{fromCity.name}</div>
                        <div className="city-code">{fromCity.code}, {fromCity.airport}</div>
                      </div>
                    </div>

                    <button className="swap-button" onClick={swapCities}>
                      <i className="fas fa-exchange-alt"></i>
                    </button>

                    <div className="field-group city-selector">
                      <label>Going To</label>
                      <div className="city-input">
                        <div className="city-name">{toCity.name}</div>
                        <div className="city-code">{toCity.code}, {toCity.airport}</div>
                      </div>
                    </div>

                    <div className="field-group date-selector">
                      <label>Departure Date</label>
                      <input 
                        type="date" 
                        value={departDate}
                        onChange={(e) => setDepartDate(e.target.value)}
                      />
                    </div>

                    {tripType === 'roundTrip' && (
                      <div className="field-group date-selector">
                        <label>Return Date</label>
                        <input 
                          type="date" 
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="field-group traveller-selector">
                      <label>Travellers & Class</label>
                      <div className="traveller-input">
                        <div>{travellers} Traveller</div>
                        <div className="class-type">{travelClass}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="search-btn"
                      onClick={() => {
                        // Navigate to Tours page with destination as search filter
                        navigate('/tour', { state: { searchTerm: holidaySearch.destination } });
                      }}
                    >
                      <i className="fas fa-search"></i> Search
                    </button>
                  </div>

                  <div className="search-options">
                    <div className="fare-options">
                      <label className="active">
                        <input type="radio" name="fareType" defaultChecked /> 
                        <span className="radio-custom"></span>
                        Regular
                        <small>Regular Fares</small>
                      </label>
                      <label>
                        <input type="radio" name="fareType" /> 
                        <span className="radio-custom"></span>
                        Student
                        <small>Extra Baggage</small>
                      </label>
                      <label>
                        <input type="radio" name="fareType" /> 
                        <span className="radio-custom"></span>
                        Armed Forces
                        <small>Extra Discount</small>
                      </label>
                      <label>
                        <input type="radio" name="fareType" /> 
                        <span className="radio-custom"></span>
                        Senior Citizen
                        <small>Extra Discount</small>
                      </label>
                    </div>
                    <div className="additional-options">
                      <label className="checkbox-option">
                        <input type="checkbox" />
                        <span className="checkbox-custom"></span>
                        Non-Stop Flights
                      </label>
                      <Link to="/contact" className="covid-refund-link">
                        <i className="fas fa-hand-holding-usd"></i>
                        Claim your Covid Refund
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Hotel Search Form */}
              {activeTab === 'hotels' && (
                <div className="search-form-container" data-aos="fade-up">
                  <div className="search-fields hotel-search">
                    <div className="field-group">
                      <label>City, Area or Property</label>
                      <input type="text" placeholder="Enter city, area or hotel name" />
                    </div>

                    <div className="field-group">
                      <label>Check-in</label>
                      <input type="date" />
                    </div>

                    <div className="field-group">
                      <label>Check-out</label>
                      <input type="date" />
                    </div>

                    <div className="field-group">
                      <label>Rooms & Guests</label>
                      <select>
                        <option>1 Room, 2 Adults</option>
                        <option>2 Rooms, 4 Adults</option>
                        <option>3 Rooms, 6 Adults</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="search-btn"
                      onClick={() => {
                        navigate('/hotels');
                      }}
                    >
                      <i className="fas fa-search"></i> Search
                    </button>
                  </div>
                </div>
              )}

              {/* Holidays Search Form */}
              {activeTab === 'holidays' && (
                <div className="search-form-container" data-aos="fade-up">
                  <div className="search-fields">
                    <div className="field-group location-field">
                      <label>Destination</label>
                      <div className="location-input-wrapper">
                        <input
                          type="text"
                          placeholder="Where do you want to go?"
                          value={holidaySearch.destination}
                          onChange={e => handleDestinationChange(e.target.value)}
                          onFocus={() => setShowDestinationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                        />
                        {showDestinationSuggestions && (
                          <div className="location-suggestions">
                            {filteredDestinations.length > 0 ? (
                              filteredDestinations.map((destination, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onMouseDown={() => selectDestination(destination)}
                                >
                                  <i className="fas fa-map-marker-alt"></i>
                                  <span>{destination}</span>
                                </div>
                              ))
                            ) : (
                              <div className="no-suggestions">
                                <i className="fas fa-info-circle"></i>
                                <span>No matching destinations</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Travel Date</label>
                      <input
                        type="date"
                        value={holidaySearch.date}
                        onChange={e => setHolidaySearch({ ...holidaySearch, date: e.target.value })}
                      />
                    </div>

                    <div className="field-group">
                      <label>Duration</label>
                      <select
                        value={holidaySearch.duration}
                        onChange={e => setHolidaySearch({ ...holidaySearch, duration: e.target.value })}
                      >
                        <option>3-5 Days</option>
                        <option>6-8 Days</option>
                        <option>9-12 Days</option>
                        <option>13+ Days</option>
                      </select>
                    </div>

                    <button 
                      className="search-btn"
                      onClick={() => {
                        navigate('/tour', { state: { searchTerm: holidaySearch.destination } });
                      }}
                    >
                      <i className="fas fa-search"></i> Search
                    </button>
                  </div>
                </div>
              )}

              {/* Travel Fleet Search Form */}
              {activeTab === 'fleet' && (
                <div className="search-form-container" data-aos="fade-up">
                  <div className="search-fields fleet-search">
                    <div className="field-group location-field">
                      <label>Pickup Location *</label>
                      <div className="location-input-wrapper">
                        <input 
                          type="text" 
                          placeholder="Enter city or area (e.g., Kozhikkode)" 
                          value={fleetSearch.location}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          onFocus={() => setShowLocationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                        />
                        <button 
                          type="button"
                          className="current-location-btn"
                          onClick={getCurrentLocation}
                          disabled={isGettingLocation}
                          title="Use current location"
                        >
                          {isGettingLocation ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-location-crosshairs"></i>
                          )}
                        </button>
                        
                        {showLocationSuggestions && (
                          <div className="location-suggestions">
                            {filteredLocations.length > 0 ? (
                              filteredLocations.map((location, index) => (
                                <div 
                                  key={index}
                                  className="suggestion-item"
                                  onMouseDown={() => selectLocation(location)}
                                >
                                  <i className="fas fa-map-marker-alt"></i>
                                  <span>{location}</span>
                                </div>
                              ))
                            ) : (
                              <div className="no-suggestions">
                                <i className="fas fa-info-circle"></i>
                                <span>No matching locations</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Vehicle Category *</label>
                      <select 
                        value={fleetSearch.vehicleCategory}
                        onChange={(e) => setFleetSearch({...fleetSearch, vehicleCategory: e.target.value})}
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="car">Car</option>
                        <option value="cab">Cab</option>
                        <option value="tempo-traveller">Tempo Traveller</option>
                        <option value="van">Van / Urvan</option>
                        <option value="mini-bus">Mini Bus</option>
                        <option value="tour-bus">Tour Bus</option>
                        <option value="luxury">Luxury Vehicle</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Pickup Date *</label>
                      <div 
                        className="date-input-wrapper"
                        onClick={() => document.getElementById('pickup-date-input').showPicker()}
                      >
                        <input 
                          id="pickup-date-input"
                          type="date" 
                          value={fleetSearch.date}
                          onChange={(e) => setFleetSearch({...fleetSearch, date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Drop-off Date *</label>
                      <div 
                        className="date-input-wrapper"
                        onClick={() => document.getElementById('dropoff-date-input').showPicker()}
                      >
                        <input 
                          id="dropoff-date-input"
                          type="date" 
                          value={fleetSearch.dropoffDate}
                          onChange={(e) => setFleetSearch({...fleetSearch, dropoffDate: e.target.value})}
                          min={fleetSearch.date}
                        />
                      </div>
                    </div>

                    <button 
                      className="search-btn"
                      onClick={() => navigate('/fleet-results', { state: fleetSearch })}
                    >
                      <i className="fas fa-search"></i> Search Vehicles
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="special-offers-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <h2>Special Offers</h2>
            <div className="offer-filters">
              <button className="active">All</button>
              <button>Flights</button>
              <button>Hotels</button>
              <button>Holidays</button>
              <button>Buses</button>
            </div>
          </div>

          <div className="offers-grid">
            {specialOffers.map(offer => (
              <div key={offer.id} className="offer-card" data-aos="zoom-in" data-aos-delay={offer.id * 50}>
                <img src={offer.image} alt={offer.title} />
                <div className="offer-content">
                  <h3>{offer.title}</h3>
                  <p className="offer-subtitle">{offer.subtitle}</p>
                  <p className="offer-description">{offer.description}</p>
                  <div className="offer-footer">
                    <span className="offer-code">{offer.code}</span>
                    <Link to="/flights" className="view-details">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-offers">
            <Link to="/flights">View all offers <i className="fas fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>

      {/* Recommended Hotels Section */}
      <section className="recommended-hotels-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Recommended Hotels</h2>
          <div className="hotels-grid">
            {recommendedHotels.map(hotel => (
              <div key={hotel.id} className="hotel-card" data-aos="fade-up" data-aos-delay={hotel.id * 100}>
                <img src={hotel.image} alt={hotel.name} />
                <div className="hotel-info">
                  <h3>{hotel.name}</h3>
                  <p className="hotel-city"><i className="fas fa-map-marker-alt"></i> {hotel.city}</p>
                  <div className="hotel-footer">
                    <div className="rating">
                      <i className="fas fa-star"></i> {hotel.rating}
                    </div>
                    <div className="price">₹{hotel.price.toLocaleString()}</div>
                  </div>
                  <Link to="/hotels" className="book-now-btn">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Domestic Destinations */}
      <section className="destinations-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Flights to Popular Domestic Destinations from Delhi</h2>
          <div className="destinations-grid">
            {domesticDestinations.map((dest, index) => (
              <div key={index} className="destination-card" data-aos="flip-left" data-aos-delay={index * 50}>
                <img src={dest.image} alt={dest.name} />
                <div className="destination-overlay">
                  <h3>{dest.name}</h3>
                  <p className="starting-price">Starting from ₹{dest.price.toLocaleString()}</p>
                  <Link to="/flights" className="explore-btn">Explore <i className="fas fa-arrow-right"></i></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular International Destinations */}
      <section className="destinations-section international" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Flights to Popular International Destinations from Delhi</h2>
          <div className="destinations-grid">
            {internationalDestinations.map((dest, index) => (
              <div key={index} className="destination-card" data-aos="flip-left" data-aos-delay={index * 50}>
                <img src={dest.image} alt={dest.name} />
                <div className="destination-overlay">
                  <h3>{dest.name}</h3>
                  <p className="region-name">{dest.region}</p>
                  <p className="starting-price">Starting from ₹{dest.price.toLocaleString()}</p>
                  <Link to="/flights" className="explore-btn">Explore <i className="fas fa-arrow-right"></i></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try on Mobile Section */}
      <section className="mobile-app-section" data-aos="fade-up">
        <div className="container">
          <div className="mobile-app-content">
            <div className="app-info">
              <h2>TRY ON MOBILE</h2>
              <p className="app-tagline">Download our app for unbeatable perks!</p>
              <div className="app-features">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Exclusive mobile-only deals</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Easy booking on the go</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Get instant notifications</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>24/7 customer support</span>
                </div>
              </div>
              <div className="download-buttons">
                <a href="#" className="download-btn">
                  <i className="fab fa-google-play"></i>
                  <div>
                    <small>GET IT ON</small>
                    <strong>Google Play</strong>
                  </div>
                </a>
                <a href="#" className="download-btn">
                  <i className="fab fa-apple"></i>
                  <div>
                    <small>Download on the</small>
                    <strong>App Store</strong>
                  </div>
                </a>
              </div>
            </div>
            <div className="app-qr">
              <div className="qr-code">
                <div className="qr-placeholder">
                  <i className="fas fa-qrcode"></i>
                </div>
                <p>Scan to Download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-yatra-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Why Travel Axis?</h2>
          <div className="features-grid">
            {whyTravelAxisFeatures.map((feature, index) => (
              <div key={index} className="feature-card" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="other-services-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Travel Axis's Other Services</h2>
          <div className="services-grid">
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-hiking"></i>
              <h3>Adventure</h3>
              <p>Explore thrilling adventure activities</p>
              <Link to="/tour">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-users"></i>
              <h3>MICE</h3>
              <p>Meetings, Incentives, Conferences & Events</p>
              <Link to="/contact">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-ship"></i>
              <h3>Cruise</h3>
              <p>Book a cruise holiday</p>
              <Link to="/tour">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-home"></i>
              <h3>Villas & Stays</h3>
              <p>Premium villas and homestays</p>
              <Link to="/hotels">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-train"></i>
              <h3>Luxury Trains</h3>
              <p>Experience luxury train journeys</p>
              <Link to="/tour">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-landmark"></i>
              <h3>Monuments</h3>
              <p>Explore historical monuments</p>
              <Link to="/destination">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-ticket-alt"></i>
              <h3>Activities</h3>
              <p>Shopping, heritage walks & more</p>
              <Link to="/tour">Plan my Trip</Link>
            </div>
            <div className="service-card" data-aos="zoom-in">
              <i className="fas fa-gift"></i>
              <h3>Gift Voucher</h3>
              <p>Perfect gift for travelers</p>
              <Link to="/contact">Plan my Trip</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Winter Travel Fest Banner */}
      <section className="promo-banner-section" data-aos="fade-up">
        <div className="container">
          <div className="winter-fest-banner">
            <div className="banner-content">
              <i className="fas fa-snowflake"></i>
              <h3>Winter Travel Fest</h3>
              <span className="live-badge">NOW LIVE</span>
            </div>
            <i className="fas fa-arrow-right banner-arrow"></i>
          </div>
        </div>
      </section>

      {/* Indigo Flights Cancellation Notice */}
      <section className="flight-notice-section" data-aos="fade-up">
        <div className="container">
          <div className="notice-cards">
            <div className="notice-card">
              <div className="notice-icon">
                <i className="fas fa-plane-slash"></i>
              </div>
              <div className="notice-content">
                <h4>Check Indigo Flights Cancellations</h4>
                <p>Stay updated with the latest flight status</p>
              </div>
              <i className="fas fa-arrow-right"></i>
            </div>
            <div className="notice-card">
              <div className="notice-icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <div className="notice-content">
                <h4>Claim Refund for Cancelled Indigo Flights</h4>
                <p>Quick and easy refund process</p>
              </div>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Flight Routes */}
      <section className="flight-routes-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Popular Flight Routes</h2>
          <div className="routes-grid">
            <Link to="/flights" className="route-link">Delhi to Mumbai</Link>
            <Link to="/flights" className="route-link">Delhi to Chennai</Link>
            <Link to="/flights" className="route-link">Delhi to Goa</Link>
            <Link to="/flights" className="route-link">Delhi to Bangalore</Link>
            <Link to="/flights" className="route-link">Delhi to Kolkata</Link>
            <Link to="/flights" className="route-link">Mumbai to Chennai</Link>
            <Link to="/flights" className="route-link">Delhi to Hyderabad</Link>
            <Link to="/flights" className="route-link">Bangalore to Hyderabad</Link>
            <Link to="/flights" className="route-link">Mumbai to Kolkata</Link>
            <Link to="/flights" className="route-link">Chennai to Bangalore</Link>
            <Link to="/flights" className="route-link">Pune to Bangalore</Link>
            <Link to="/flights" className="route-link">Delhi to Pune</Link>
          </div>
        </div>
      </section>

      {/* Popular Domestic Flight Routes */}
      <section className="flight-routes-section domestic" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Popular Domestic Flight Routes</h2>
          <div className="routes-grid">
            <Link to="/flights" className="route-link">Delhi to Vadodara Flight</Link>
            <Link to="/flights" className="route-link">Chennai to Bangalore Flight</Link>
            <Link to="/flights" className="route-link">Visakhapatnam to Chennai Flight</Link>
            <Link to="/flights" className="route-link">Lucknow to Kolkata Flight</Link>
            <Link to="/flights" className="route-link">Jammu to Delhi Flight</Link>
            <Link to="/flights" className="route-link">Kolkata to Varanasi Flight</Link>
            <Link to="/flights" className="route-link">Chennai to Madurai Flight</Link>
            <Link to="/flights" className="route-link">Kochi to Mangalore Flight</Link>
            <Link to="/flights" className="route-link">Surat to Mumbai Flight</Link>
            <Link to="/flights" className="route-link">Delhi to Chandigarh Flight</Link>
            <Link to="/flights" className="route-link">Mumbai to Jaipur Flight</Link>
            <Link to="/flights" className="route-link">Ahmedabad to Surat Flight</Link>
          </div>
        </div>
      </section>

      {/* Popular International Flight Routes */}
      <section className="flight-routes-section international" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Popular International Flight Routes</h2>
          <div className="routes-grid">
            <Link to="/flights" className="route-link">Surat to Dubai Flight</Link>
            <Link to="/flights" className="route-link">Kolkata to Bangkok Flight</Link>
            <Link to="/flights" className="route-link">Delhi to Mauritius Flight</Link>
            <Link to="/flights" className="route-link">Ahmedabad to Toronto Flight</Link>
            <Link to="/flights" className="route-link">Mumbai to Toronto Flight</Link>
            <Link to="/flights" className="route-link">Chennai to Colombo Flight</Link>
            <Link to="/flights" className="route-link">Chennai to Bangkok Flight</Link>
            <Link to="/flights" className="route-link">Bangalore to London Flight</Link>
            <Link to="/flights" className="route-link">Mumbai to Singapore Flight</Link>
            <Link to="/flights" className="route-link">Dubai to Amritsar Flight</Link>
            <Link to="/flights" className="route-link">Kathmandu to Delhi Flight</Link>
            <Link to="/flights" className="route-link">Kuwait to Chennai Flight</Link>
          </div>
        </div>
      </section>

      {/* Travel Axis Products */}
      <section className="products-section" data-aos="fade-up">
        <div className="container">
          <h2 className="section-title">Travel Axis Products</h2>
          <div className="products-grid">
            <div className="product-category">
              <Link to="/flights">Flights</Link>
              <Link to="/flights">International Airlines</Link>
              <Link to="/flights">Domestic Airlines</Link>
            </div>
            <div className="product-category">
              <Link to="/hotels">Hotels</Link>
              <Link to="/tour">Trains</Link>
              <Link to="/tour">Bus Booking</Link>
            </div>
            <div className="product-category">
              <Link to="/tour">Holidays</Link>
              <Link to="/tour">International Holiday Packages</Link>
              <Link to="/tour">India Holiday Packages</Link>
            </div>
            <div className="product-category">
              <Link to="/tour">Outstation Cabs</Link>
              <Link to="/destination">Indian Monuments</Link>
              <Link to="/contact">MICE</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="home-footer" data-aos="fade-up">
        <div className="container">
          <div className="footer-sections">
            <div className="footer-column">
              <h3>Company Information</h3>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/blog">Careers</Link>
              <Link to="/faq">Press Room</Link>
            </div>
            <div className="footer-column">
              <h3>Partner With Travel Axis</h3>
              <Link to="/contact">Become a Partner</Link>
              <Link to="/service">Affiliate Program</Link>
              <Link to="/contact">Advertise with Us</Link>
            </div>
            <div className="footer-column">
              <h3>Travel Axis for Business</h3>
              <Link to="/service">Corporate Travel</Link>
              <Link to="/contact">Group Bookings</Link>
              <Link to="/service">Business Solutions</Link>
            </div>
            <div className="footer-column">
              <h3>Customer Care</h3>
              <Link to="/contact">Help & Support</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Cancellation Policy</Link>
              <Link to="/contact">Terms & Conditions</Link>
            </div>
          </div>

          <div className="social-payment-section">
            <div className="social-media">
              <h4>Our Social Media Handles:</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              </div>
            </div>

            <div className="payment-methods">
              <h4>Security & Payments</h4>
              <div className="payment-icons">
                <i className="fas fa-lock"></i>
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-amex"></i>
                <i className="fas fa-university"></i>
                <i className="fas fa-mobile-alt"></i>
              </div>
            </div>
          </div>

          <div className="copyright">
            <p>Copyright © 2025 Travel Axis Online Limited, India. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
