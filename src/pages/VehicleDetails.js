import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/vehicleDetails.css';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const offerCode = urlSearchParams.get('code') || '';
  const { user, profile } = useAuth();

  // Vehicles database for direct navigation (when not coming from fleet results)
  const vehiclesDatabase = useMemo(() => [
    {
      id: 1,
      name: 'Swift Dzire',
      category: 'Sedan',
      type: 'car',
      seatingCapacity: '4+1',
      fuelType: 'Petrol/Diesel',
      transmission: 'Manual',
      pricePerDay: 999,
      originalPrice: 1249,
      rating: 4.8,
      totalTrips: 1250,
      operatorName: 'Royal Travels',
      operatorRating: 4.8,
      features: ['AC', 'Music System', 'GPS', 'First Aid Kit', 'USB Charging'],
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      description: 'Perfect for city travel and short trips. Fuel-efficient and comfortable sedan with professional driver.'
    },
    {
      id: 2,
      name: 'Volvo AC Sleeper',
      category: 'Bus',
      type: 'bus',
      seatingCapacity: '40+2',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      pricePerDay: 499,
      originalPrice: 599,
      rating: 4.5,
      totalTrips: 890,
      operatorName: 'Kerala State RTC',
      operatorRating: 4.5,
      features: ['AC', 'Sleeper Berths', 'Blankets', 'USB Charging', 'Reading Light'],
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
      description: 'Comfortable overnight travel with sleeper berths. Multi-axle Volvo bus with all amenities.'
    },
    {
      id: 3,
      name: 'Force Tempo Traveller',
      category: 'Tempo Traveller',
      type: 'tempo',
      seatingCapacity: '12+1',
      fuelType: 'Diesel',
      transmission: 'Manual',
      pricePerDay: 2499,
      originalPrice: 3299,
      rating: 4.7,
      totalTrips: 650,
      operatorName: 'Malabar Tours',
      operatorRating: 4.7,
      features: ['AC', 'Push-back Seats', 'Music System', 'LCD TV', 'Mic System'],
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      description: 'Perfect for family trips and group outings. Spacious tempo traveller with entertainment system.'
    },
    {
      id: 4,
      name: 'Toyota Innova',
      category: 'Airport Transfer',
      type: 'airport',
      seatingCapacity: '6+1',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      pricePerDay: 799,
      originalPrice: 899,
      rating: 4.9,
      totalTrips: 2100,
      operatorName: 'Airport Cabs Kerala',
      operatorRating: 4.9,
      features: ['AC', 'Flight Tracking', 'Meet & Greet', 'Luggage Assist', 'WiFi'],
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
      description: 'Hassle-free airport pickups and drops with flight tracking. Premium SUV service.'
    },
    {
      id: 5,
      name: 'Honda City',
      category: 'Premium Sedan',
      type: 'car',
      seatingCapacity: '4+1',
      fuelType: 'Petrol',
      transmission: 'CVT',
      pricePerDay: 1199,
      originalPrice: 1599,
      rating: 4.6,
      totalTrips: 780,
      operatorName: 'Bangalore City Cabs',
      operatorRating: 4.6,
      features: ['AC', 'Sunroof', 'Leather Seats', 'GPS', 'Premium Sound'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      description: 'Luxury sedan for corporate travel. Professional drivers with excellent city knowledge.'
    },
    {
      id: 6,
      name: 'Luxury Tempo Traveller',
      category: 'Tempo Traveller',
      type: 'tempo',
      seatingCapacity: '17+1',
      fuelType: 'Diesel',
      transmission: 'Manual',
      pricePerDay: 3499,
      originalPrice: 4999,
      rating: 4.4,
      totalTrips: 320,
      operatorName: 'Mumbai Tours & Travels',
      operatorRating: 4.4,
      features: ['AC', 'Maharaja Seats', 'LED TV', 'Refrigerator', 'Premium Sound'],
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      description: 'Premium tempo traveller with luxury interiors. Ideal for weddings and VIP tours.'
    },
    {
      id: 7,
      name: 'Multi-axle Volvo',
      category: 'AC Sleeper Bus',
      type: 'bus',
      seatingCapacity: '36+2',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      pricePerDay: 1039,
      originalPrice: 1299,
      rating: 4.3,
      totalTrips: 540,
      operatorName: 'North India Travels',
      operatorRating: 4.3,
      features: ['AC', 'Sleeper Berths', 'Blankets', 'Snacks', 'USB Charging'],
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
      description: 'Premium overnight bus travel across North India. Comfortable sleeper berths with amenities.'
    },
    {
      id: 8,
      name: 'Toyota Innova Crysta',
      category: 'SUV',
      type: 'car',
      seatingCapacity: '6+1',
      fuelType: 'Diesel',
      transmission: 'Automatic',
      pricePerDay: 1499,
      originalPrice: 1899,
      rating: 4.7,
      totalTrips: 920,
      operatorName: 'South Kerala Travels',
      operatorRating: 4.7,
      features: ['AC', 'Captain Seats', 'Ambient Lighting', 'Premium Sound', 'Rear AC'],
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
      description: 'Premium SUV for family trips. Spacious interiors with captain seats and entertainment.'
    },
    {
      id: 9,
      name: 'Mercedes E-Class',
      category: 'Luxury',
      type: 'luxury-car',
      seatingCapacity: '4+1',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      pricePerDay: 7649,
      originalPrice: 8999,
      rating: 4.9,
      totalTrips: 180,
      operatorName: 'Elite Car Rentals',
      operatorRating: 4.9,
      features: ['AC', 'Leather Seats', 'Panoramic Roof', 'Premium Sound', 'Chauffeur'],
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop',
      description: 'Ultimate luxury travel experience. Chauffeur-driven Mercedes with VIP treatment.'
    }
  ], []);

  // Get vehicle data from state or lookup by ID
  const stateVehicleData = location.state?.vehicle;
  const vehicleData = stateVehicleData || vehiclesDatabase.find(v => v.id === parseInt(id));
  
  const searchParams = location.state?.searchParams || {};
  
  // Get offer details from URL code parameter
  const offerDetails = useMemo(() => {
    const offers = {
      'CAR20': { title: 'Car Rentals - 20% OFF', discount: '20%', code: 'CAR20' },
      'BUS15': { title: 'Bus Booking - 15% OFF', discount: '15%', code: 'BUS15' },
      'TEMPO25': { title: 'Tempo Traveller - 25% OFF', discount: '25%', code: 'TEMPO25' },
      'AIRPORT100': { title: 'Airport Transfer - ₹100 OFF', discount: '₹100', code: 'AIRPORT100' },
      'CARBLR25': { title: 'Premium Sedan - 25% OFF', discount: '25%', code: 'CARBLR25' },
      'TEMPO30MUM': { title: 'Luxury Tempo - 30% OFF', discount: '30%', code: 'TEMPO30MUM' },
      'VOLVODEL': { title: 'Volvo Sleeper - 20% OFF', discount: '20%', code: 'VOLVODEL' },
      'INNOVA15': { title: 'Innova Crysta - 15% OFF', discount: '15%', code: 'INNOVA15' },
      'SUV30': { title: 'SUV Premium - 30% OFF', discount: '30%', code: 'SUV30' },
      'MINI20': { title: 'Mini Bus - 20% OFF', discount: '20%', code: 'MINI20' },
      'SEDAN18': { title: 'Sedan Special - 18% OFF', discount: '18%', code: 'SEDAN18' },
      'LUXCAR15': { title: 'Luxury Cars - 15% OFF', discount: '15%', code: 'LUXCAR15' },
      'WEDDING2K': { title: 'Wedding Cars - ₹2000 OFF', discount: '₹2000', code: 'WEDDING2K' }
    };
    return offers[offerCode] || null;
  }, [offerCode]);

  const appliedOffer = location.state?.appliedOffer || offerDetails;

  const [activeTab, setActiveTab] = useState('overview');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOfferBanner, setShowOfferBanner] = useState(!!appliedOffer);
  
  // Enquiry Modal States
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    numberOfPersons: 1,
    pickupTime: '09:00',
    dropoffTime: '18:00',
    tripType: 'round-trip',
    pickupAddress: '',
    dropoffAddress: '',
    specialRequirements: []
  });
  
  // Enquiry modal editable dates
  const [modalPickupDate, setModalPickupDate] = useState('');
  const [modalReturnDate, setModalReturnDate] = useState('');
  const [modalPickupLocation, setModalPickupLocation] = useState('');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Editable booking fields - default to today's date
  const [pickupDate, setPickupDate] = useState(searchParams.date || today);
  const [returnDate, setReturnDate] = useState(searchParams.dropoffDate || today);
  const [pickupLocation, setPickupLocation] = useState(searchParams.location || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Auto-detect current location on mount
  React.useEffect(() => {
    if (!pickupLocation && navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'TravelAxisApp/1.0'
                }
              }
            );
            if (response.ok) {
              const data = await response.json();
              let placeName = data.address.city || data.address.town || 
                             data.address.state_district || data.address.state;
              if (placeName) {
                setPickupLocation(placeName);
              }
            }
          } catch (error) {
            console.error('Location detection error:', error);
          }
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  // Sample reviews data
  const sampleReviews = [
    { id: 1, name: 'Rajesh Kumar', rating: 5, date: '2 weeks ago', comment: 'Excellent service! The vehicle was clean and the driver was very professional.' },
    { id: 2, name: 'Priya Singh', rating: 4, date: '1 month ago', comment: 'Good experience overall. Would recommend for family trips.' },
    { id: 3, name: 'Mohammed Ali', rating: 5, date: '3 weeks ago', comment: 'Best rental experience. Great value for money!' }
  ];

  // Navigate to send enquiry page
  const goToEnquiryPage = () => {
    navigate(`/send-enquiry/vehicle/${vehicleData.id}`, {
      state: {
        vehicleData: vehicleData,
        searchParams: {
          date: pickupDate,
          dropoffDate: returnDate,
          location: pickupLocation
        },
        appliedOffer: appliedOffer
      }
    });
  };

  // Open enquiry modal (kept for backward compatibility)
  const openEnquiryModal = () => {
    // Pre-fill form with user data if logged in
    if (user && profile) {
      setEnquiryForm({
        name: profile.name || profile.fullName || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        message: additionalRequirements || '',
        numberOfPersons: 1,
        pickupTime: '09:00',
        dropoffTime: '18:00',
        tripType: 'round-trip',
        pickupAddress: '',
        dropoffAddress: '',
        specialRequirements: []
      });
    } else {
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        message: additionalRequirements || '',
        numberOfPersons: 1,
        pickupTime: '09:00',
        dropoffTime: '18:00',
        tripType: 'round-trip',
        pickupAddress: '',
        dropoffAddress: '',
        specialRequirements: []
      });
    }
    // Initialize modal dates from main form
    setModalPickupDate(pickupDate);
    setModalReturnDate(returnDate);
    setModalPickupLocation(pickupLocation);
    setEnquirySuccess(false);
    setEnquiryError('');
    setShowEnquiryModal(true);
  };

  // Handle special requirements toggle
  const toggleSpecialRequirement = (requirement) => {
    setEnquiryForm(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter(r => r !== requirement)
        : [...prev.specialRequirements, requirement]
    }));
  };

  // Handle enquiry form submission
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySubmitting(true);

    // Validate required fields
    if (!enquiryForm.name.trim()) {
      setEnquiryError('Please enter your name');
      setEnquirySubmitting(false);
      return;
    }
    if (!enquiryForm.email.trim()) {
      setEnquiryError('Please enter your email');
      setEnquirySubmitting(false);
      return;
    }
    if (!enquiryForm.phone.trim()) {
      setEnquiryError('Please enter your phone number');
      setEnquirySubmitting(false);
      return;
    }
    if (!pickupLocation) {
      setEnquiryError('Please enter a pickup location');
      setEnquirySubmitting(false);
      return;
    }

    try {
      // Calculate number of days using modal dates
      const start = new Date(modalPickupDate);
      const end = new Date(modalReturnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      // Calculate estimated price
      const basePrice = vehicleData.pricePerDay * diffDays;
      let discount = 0;
      if (appliedOffer) {
        if (appliedOffer.discount.includes('%')) {
          discount = (basePrice * parseInt(appliedOffer.discount)) / 100;
        } else if (appliedOffer.discount.includes('₹')) {
          discount = parseInt(appliedOffer.discount.replace('₹', ''));
        }
      }
      const estimatedTotal = basePrice - discount;

      // Create enquiry data
      const enquiryData = {
        // Customer Details
        customerName: enquiryForm.name.trim(),
        customerEmail: enquiryForm.email.trim(),
        customerPhone: enquiryForm.phone.trim(),
        customerId: user?.uid || null,
        
        // Vehicle Details
        vehicleId: vehicleData.id,
        vehicleName: vehicleData.name,
        vehicleCategory: vehicleData.category,
        vehicleType: vehicleData.type,
        operatorName: vehicleData.operatorName,
        vehicleImage: vehicleData.image,
        seatingCapacity: vehicleData.seatingCapacity,
        
        // Booking Details
        pickupLocation: modalPickupLocation,
        pickupAddress: enquiryForm.pickupAddress.trim(),
        dropoffAddress: enquiryForm.dropoffAddress.trim(),
        pickupDate: modalPickupDate,
        returnDate: modalReturnDate,
        pickupTime: enquiryForm.pickupTime,
        dropoffTime: enquiryForm.dropoffTime,
        numberOfDays: diffDays,
        numberOfPersons: enquiryForm.numberOfPersons,
        tripType: enquiryForm.tripType,
        
        // Pricing
        pricePerDay: vehicleData.pricePerDay,
        basePrice: basePrice,
        appliedOfferCode: appliedOffer?.code || null,
        discount: discount,
        estimatedTotal: estimatedTotal,
        
        // Additional Info
        message: enquiryForm.message.trim() || additionalRequirements || '',
        specialRequirements: enquiryForm.specialRequirements,
        
        // Meta
        enquiryType: 'vehicle',
        status: 'pending',
        createdAt: serverTimestamp(),
        source: 'website'
      };

      // Save to Firestore
      if (db) {
        await addDoc(collection(db, 'enquiries'), enquiryData);
      }

      setEnquirySuccess(true);
      setEnquirySubmitting(false);
    } catch (error) {
      console.error('Enquiry submission error:', error);
      setEnquiryError('Failed to submit enquiry. Please try again.');
      setEnquirySubmitting(false);
    }
  };

  const handleEnquiry = () => {
    // Navigate to booking page with vehicle data
    navigate(`/book-vehicle/vehicle/${vehicleData.id}`, {
      state: {
        vehicleData: vehicleData,
        searchParams: {
          date: pickupDate,
          dropoffDate: returnDate,
          location: pickupLocation
        },
        appliedOffer: appliedOffer
      }
    });
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
    <div className={`vehicle-details-page ${showOfferBanner && appliedOffer ? 'has-offer-banner' : ''}`}>
      {/* Offer Applied Banner */}
      {showOfferBanner && appliedOffer && (
        <div className="offer-applied-banner">
          <div className="container">
            <div className="offer-banner-content">
              <i className="fas fa-tag"></i>
              <span className="offer-text">
                <strong>{appliedOffer.title}</strong> - Code <strong>{appliedOffer.code}</strong> applied! Discount will be reflected at checkout.
              </span>
              <button className="close-banner" onClick={() => setShowOfferBanner(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="info-item editable">
                    <label className="info-label" htmlFor="pickupDate">Pickup Date</label>
                    <div className="info-input-wrapper clickable" onClick={() => document.getElementById('pickupDate').showPicker()}>
                      <i className="fas fa-calendar"></i>
                      <input
                        type="date"
                        id="pickupDate"
                        className="info-input"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="info-item editable">
                    <label className="info-label" htmlFor="returnDate">Return Date</label>
                    <div className="info-input-wrapper clickable" onClick={() => document.getElementById('returnDate').showPicker()}>
                      <i className="fas fa-calendar-check"></i>
                      <input
                        type="date"
                        id="returnDate"
                        className="info-input"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Pickup Location</span>
                    <div className="info-value">
                      {isDetectingLocation ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-map-marker-alt"></i>
                      )}
                      {isDetectingLocation ? 'Detecting...' : (pickupLocation || 'Not specified')}
                    </div>
                  </div>

                  <button onClick={handleEnquiry} className="book-now-btn">
                    <i className="fas fa-check-circle"></i> Book Now
                  </button>

                  <button onClick={goToEnquiryPage} className="contact-btn">
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

      {/* Send Enquiry Modal */}
      {showEnquiryModal && (
        <div className="enquiry-modal-overlay" onClick={() => setShowEnquiryModal(false)}>
          <div className="enquiry-modal enquiry-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="enquiry-modal-close" onClick={() => setShowEnquiryModal(false)}>
              <i className="fas fa-times"></i>
            </button>

            {!enquirySuccess ? (
              <div className="enquiry-modal-content">
                <div className="enquiry-modal-header">
                  <div className="enquiry-icon">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <h2>Send Enquiry</h2>
                  <p>Fill in the details and our team will get back to you shortly</p>
                </div>

                <div className="enquiry-modal-body">
                  {/* Left Column - Vehicle & Trip Details */}
                  <div className="enquiry-left-column">
                    {/* Vehicle Summary */}
                    <div className="enquiry-vehicle-summary">
                      <img src={vehicleData.image} alt={vehicleData.name} />
                      <div className="vehicle-summary-info">
                        <h4>{vehicleData.name}</h4>
                        <p><i className="fas fa-building"></i> {vehicleData.operatorName}</p>
                        <div className="summary-details">
                          <span><i className="fas fa-users"></i> {vehicleData.seatingCapacity} Seats</span>
                          <span><i className="fas fa-star"></i> {vehicleData.rating}</span>
                        </div>
                        <div className="price-tag">
                          <span className="price">₹{vehicleData.pricePerDay}</span>
                          <span className="per-day">/ day</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Type Selection */}
                    <div className="enquiry-section">
                      <h5><i className="fas fa-route"></i> Trip Type</h5>
                      <div className="trip-type-options">
                        <label className={`trip-option ${enquiryForm.tripType === 'one-way' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="tripType"
                            value="one-way"
                            checked={enquiryForm.tripType === 'one-way'}
                            onChange={(e) => setEnquiryForm({...enquiryForm, tripType: e.target.value})}
                          />
                          <i className="fas fa-arrow-right"></i>
                          <span>One Way</span>
                        </label>
                        <label className={`trip-option ${enquiryForm.tripType === 'round-trip' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="tripType"
                            value="round-trip"
                            checked={enquiryForm.tripType === 'round-trip'}
                            onChange={(e) => setEnquiryForm({...enquiryForm, tripType: e.target.value})}
                          />
                          <i className="fas fa-exchange-alt"></i>
                          <span>Round Trip</span>
                        </label>
                        <label className={`trip-option ${enquiryForm.tripType === 'multi-city' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="tripType"
                            value="multi-city"
                            checked={enquiryForm.tripType === 'multi-city'}
                            onChange={(e) => setEnquiryForm({...enquiryForm, tripType: e.target.value})}
                          />
                          <i className="fas fa-map-marked-alt"></i>
                          <span>Multi City</span>
                        </label>
                      </div>
                    </div>

                    {/* Date & Time Selection */}
                    <div className="enquiry-section">
                      <h5><i className="fas fa-calendar-alt"></i> Schedule</h5>
                      <div className="date-time-grid">
                        <div className="form-group">
                          <label>Pickup Date *</label>
                          <input
                            type="date"
                            value={modalPickupDate}
                            min={today}
                            onChange={(e) => {
                              setModalPickupDate(e.target.value);
                              if (e.target.value > modalReturnDate) {
                                setModalReturnDate(e.target.value);
                              }
                            }}
                            className="date-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Pickup Time *</label>
                          <input
                            type="time"
                            value={enquiryForm.pickupTime}
                            onChange={(e) => setEnquiryForm({...enquiryForm, pickupTime: e.target.value})}
                            className="time-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Return Date *</label>
                          <input
                            type="date"
                            value={modalReturnDate}
                            min={modalPickupDate || today}
                            onChange={(e) => setModalReturnDate(e.target.value)}
                            className="date-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Drop-off Time *</label>
                          <input
                            type="time"
                            value={enquiryForm.dropoffTime}
                            onChange={(e) => setEnquiryForm({...enquiryForm, dropoffTime: e.target.value})}
                            className="time-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="enquiry-section">
                      <h5><i className="fas fa-map-marker-alt"></i> Location Details</h5>
                      <div className="form-group">
                        <label>Pickup City *</label>
                        <input
                          type="text"
                          placeholder="Enter pickup city"
                          value={modalPickupLocation}
                          onChange={(e) => setModalPickupLocation(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pickup Address (Optional)</label>
                        <input
                          type="text"
                          placeholder="Enter detailed pickup address"
                          value={enquiryForm.pickupAddress}
                          onChange={(e) => setEnquiryForm({...enquiryForm, pickupAddress: e.target.value})}
                        />
                      </div>
                      {enquiryForm.tripType !== 'one-way' && (
                        <div className="form-group">
                          <label>Drop-off Address (Optional)</label>
                          <input
                            type="text"
                            placeholder="Enter drop-off address"
                            value={enquiryForm.dropoffAddress}
                            onChange={(e) => setEnquiryForm({...enquiryForm, dropoffAddress: e.target.value})}
                          />
                        </div>
                      )}
                    </div>

                    {/* Number of Persons */}
                    <div className="enquiry-section">
                      <h5><i className="fas fa-users"></i> Passengers</h5>
                      <div className="persons-selector">
                        <button
                          type="button"
                          className="persons-btn"
                          onClick={() => setEnquiryForm({...enquiryForm, numberOfPersons: Math.max(1, enquiryForm.numberOfPersons - 1)})}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <div className="persons-display">
                          <span className="persons-count">{enquiryForm.numberOfPersons}</span>
                          <span className="persons-label">Person{enquiryForm.numberOfPersons > 1 ? 's' : ''}</span>
                        </div>
                        <button
                          type="button"
                          className="persons-btn"
                          onClick={() => setEnquiryForm({...enquiryForm, numberOfPersons: Math.min(parseInt(vehicleData.seatingCapacity) || 50, enquiryForm.numberOfPersons + 1)})}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <p className="capacity-note">
                        <i className="fas fa-info-circle"></i>
                        Maximum capacity: {vehicleData.seatingCapacity} passengers
                      </p>
                    </div>

                    {/* Special Requirements */}
                    <div className="enquiry-section">
                      <h5><i className="fas fa-cog"></i> Special Requirements</h5>
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
                            className={`requirement-option ${enquiryForm.specialRequirements.includes(req.id) ? 'active' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={enquiryForm.specialRequirements.includes(req.id)}
                              onChange={() => toggleSpecialRequirement(req.id)}
                            />
                            <i className={`fas ${req.icon}`}></i>
                            <span>{req.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Contact & Submit */}
                  <div className="enquiry-right-column">
                    {/* Price Summary */}
                    <div className="enquiry-price-summary">
                      <h5>Estimated Price</h5>
                      <div className="price-breakdown">
                        <div className="price-row">
                          <span>Base Price</span>
                          <span>₹{vehicleData.pricePerDay} × {Math.max(1, Math.ceil(Math.abs(new Date(modalReturnDate) - new Date(modalPickupDate)) / (1000 * 60 * 60 * 24))) || 1} days</span>
                        </div>
                        <div className="price-row">
                          <span>Subtotal</span>
                          <span>₹{vehicleData.pricePerDay * (Math.max(1, Math.ceil(Math.abs(new Date(modalReturnDate) - new Date(modalPickupDate)) / (1000 * 60 * 60 * 24))) || 1)}</span>
                        </div>
                        {appliedOffer && (
                          <div className="price-row discount">
                            <span><i className="fas fa-tag"></i> {appliedOffer.code}</span>
                            <span>-{appliedOffer.discount}</span>
                          </div>
                        )}
                        <div className="price-row total">
                          <span>Estimated Total</span>
                          <span>₹{vehicleData.pricePerDay * (Math.max(1, Math.ceil(Math.abs(new Date(modalReturnDate) - new Date(modalPickupDate)) / (1000 * 60 * 60 * 24))) || 1)}</span>
                        </div>
                      </div>
                      <p className="price-note">* Final price may vary based on actual usage</p>
                    </div>

                    {enquiryError && (
                      <div className="enquiry-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {enquiryError}
                      </div>
                    )}

                    <form onSubmit={handleEnquirySubmit} className="enquiry-form">
                      <h5><i className="fas fa-user-circle"></i> Contact Information</h5>
                      
                      <div className="form-group">
                        <label><i className="fas fa-user"></i> Full Name *</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm({...enquiryForm, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label><i className="fas fa-envelope"></i> Email *</label>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={enquiryForm.email}
                            onChange={(e) => setEnquiryForm({...enquiryForm, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label><i className="fas fa-phone"></i> Phone *</label>
                          <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={enquiryForm.phone}
                            onChange={(e) => setEnquiryForm({...enquiryForm, phone: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label><i className="fas fa-comment-alt"></i> Additional Message (Optional)</label>
                        <textarea
                          rows="3"
                          placeholder="Any specific requirements, questions, or special instructions..."
                          value={enquiryForm.message}
                          onChange={(e) => setEnquiryForm({...enquiryForm, message: e.target.value})}
                        ></textarea>
                      </div>

                      <button type="submit" className="enquiry-submit-btn" disabled={enquirySubmitting}>
                        {enquirySubmitting ? (
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

                    <div className="enquiry-trust-badges">
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
            ) : (
              <div className="enquiry-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>Enquiry Sent Successfully!</h2>
                <p>Thank you for your interest in <strong>{vehicleData.name}</strong></p>
                
                <div className="success-summary">
                  <div className="summary-row">
                    <i className="fas fa-calendar"></i>
                    <span>{new Date(modalPickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(modalReturnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="summary-row">
                    <i className="fas fa-clock"></i>
                    <span>{enquiryForm.pickupTime} - {enquiryForm.dropoffTime}</span>
                  </div>
                  <div className="summary-row">
                    <i className="fas fa-users"></i>
                    <span>{enquiryForm.numberOfPersons} Passenger{enquiryForm.numberOfPersons > 1 ? 's' : ''}</span>
                  </div>
                  <div className="summary-row">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{modalPickupLocation}</span>
                  </div>
                </div>
                
                <div className="success-details">
                  <p><i className="fas fa-envelope"></i> Confirmation sent to <strong>{enquiryForm.email}</strong></p>
                  <p><i className="fas fa-phone"></i> We'll call you at <strong>{enquiryForm.phone}</strong></p>
                </div>
                <div className="success-info">
                  <i className="fas fa-clock"></i>
                  <span>Our team will contact you within 2 hours during business hours (9 AM - 8 PM)</span>
                </div>
                <button className="enquiry-close-btn" onClick={() => setShowEnquiryModal(false)}>
                  <i className="fas fa-check"></i> Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
