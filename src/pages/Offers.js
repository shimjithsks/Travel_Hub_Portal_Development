import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/offers.css';

const Offers = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'fleet';
  const initialLocation = searchParams.get('location') || '';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Location picker state
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const popularLocations = [
    'Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Kannur', 'Wayanad',
    'Bengaluru', 'Mysuru', 'Chennai', 'Hyderabad', 'Mumbai',
    'Pune', 'Goa', 'Delhi', 'Jaipur', 'Agra', 'Manali'
  ];

  const [filteredLocations, setFilteredLocations] = useState(popularLocations);

  // Handle location input change
  const handleLocationInputChange = (value) => {
    setSelectedLocation(value);
    if (value.trim()) {
      const filtered = popularLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(popularLocations);
    }
  };

  // Detect current location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

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
              setSelectedLocation(placeName);
            }
          }
        } catch (error) {
          console.error('Geocoding Error:', error);
          alert('Could not determine location. Please select manually.');
        }
        
        setIsDetectingLocation(false);
        setShowLocationPicker(false);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        alert('Unable to retrieve your location. Please select manually.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fleet Offers Data - 9 offers with operator and location info
  const fleetOffers = [
    {
      id: 1,
      type: 'car',
      title: 'Car Rentals',
      description: 'Self-drive & chauffeur driven vehicles',
      discount: '20% OFF',
      highlights: ['Sedan, SUV, Luxury', 'Fuel Options', '24/7 Support'],
      oldPrice: '₹1,249',
      newPrice: '₹999',
      unit: 'day',
      code: 'CAR20',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
      operator: 'Royal Travels',
      operatorRating: 4.8,
      locations: ['Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Kannur']
    },
    {
      id: 2,
      type: 'bus',
      title: 'Bus Booking',
      description: 'Comfortable group travel across cities',
      discount: '15% OFF',
      highlights: ['AC & Non-AC', 'Sleeper & Seater', '100+ Routes'],
      oldPrice: '₹599',
      newPrice: '₹499',
      unit: 'seat',
      code: 'BUS15',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&h=300&fit=crop',
      operator: 'Kerala State RTC',
      operatorRating: 4.5,
      locations: ['Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Bengaluru', 'Chennai']
    },
    {
      id: 3,
      type: 'tempo',
      title: 'Tempo Traveller',
      description: 'Perfect for family & group outings',
      discount: '25% OFF',
      highlights: ['9 to 26 Seaters', 'Push-back Seats', 'Entertainment'],
      oldPrice: '₹3,299',
      newPrice: '₹2,499',
      unit: 'day',
      code: 'TEMPO25',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=300&fit=crop',
      operator: 'Malabar Tours',
      operatorRating: 4.7,
      locations: ['Kozhikode', 'Wayanad', 'Kannur', 'Mysuru']
    },
    {
      id: 4,
      type: 'airport',
      title: 'Airport Transfer',
      description: 'Hassle-free pickups & drops',
      discount: 'FLAT ₹100 OFF',
      highlights: ['Meet & Greet', 'Flight Tracking', '24/7 Available'],
      oldPrice: '₹899',
      newPrice: '₹799',
      unit: 'trip',
      code: 'AIRPORT100',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&h=300&fit=crop',
      operator: 'Airport Cabs Kerala',
      operatorRating: 4.9,
      locations: ['Kozhikode', 'Kochi', 'Kannur', 'Thiruvananthapuram']
    },
    {
      id: 5,
      type: 'suv',
      title: 'SUV Premium',
      description: 'Luxury SUVs for comfortable journeys',
      discount: '30% OFF',
      highlights: ['Toyota, Mahindra, Hyundai', 'All Inclusive', 'GPS Equipped'],
      oldPrice: '₹2,499',
      newPrice: '₹1,749',
      unit: 'day',
      code: 'SUV30',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=300&fit=crop',
      operator: 'Bangalore City Cabs',
      operatorRating: 4.6,
      locations: ['Bengaluru', 'Mysuru', 'Chennai', 'Hyderabad']
    },
    {
      id: 6,
      type: 'minibus',
      title: 'Mini Bus',
      description: 'Ideal for medium group travels',
      discount: '20% OFF',
      highlights: ['20-30 Seaters', 'AC Available', 'Luggage Space'],
      oldPrice: '₹4,999',
      newPrice: '₹3,999',
      unit: 'day',
      code: 'MINI20',
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=500&h=300&fit=crop',
      operator: 'Mumbai Tours & Travels',
      operatorRating: 4.4,
      locations: ['Mumbai', 'Pune', 'Goa', 'Nashik']
    },
    {
      id: 7,
      type: 'sedan',
      title: 'Sedan Special',
      description: 'Premium sedans for city travel',
      discount: '18% OFF',
      highlights: ['Honda, Hyundai, Toyota', 'Leather Seats', 'Music System'],
      oldPrice: '₹1,599',
      newPrice: '₹1,299',
      unit: 'day',
      code: 'SEDAN18',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop',
      operator: 'South Kerala Travels',
      operatorRating: 4.7,
      locations: ['Thiruvananthapuram', 'Kochi', 'Alleppey']
    },
    {
      id: 8,
      type: 'luxury-car',
      title: 'Luxury Cars',
      description: 'Premium cars for special occasions',
      discount: '15% OFF',
      highlights: ['Mercedes, BMW, Audi', 'Chauffeur Driven', 'VIP Treatment'],
      oldPrice: '₹8,999',
      newPrice: '₹7,649',
      unit: 'day',
      code: 'LUXCAR15',
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500&h=300&fit=crop',
      operator: 'Elite Car Rentals',
      operatorRating: 4.9,
      locations: ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad']
    },
    {
      id: 9,
      type: 'wedding',
      title: 'Wedding Cars',
      description: 'Decorated cars for your special day',
      discount: 'FLAT ₹2000 OFF',
      highlights: ['Decorated Vehicle', 'Multiple Options', 'Photo Ready'],
      oldPrice: '₹12,999',
      newPrice: '₹10,999',
      unit: 'day',
      code: 'WEDDING2K',
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop',
      operator: 'Wedding Wheels',
      operatorRating: 4.8,
      locations: ['Kozhikode', 'Kochi', 'Bengaluru', 'Mumbai', 'Delhi']
    }
  ];

  // Hotel Offers Data - 9 offers
  const hotelOffers = [
    {
      type: 'luxury',
      title: 'Luxury Hotels',
      description: '5-star premium accommodations',
      discount: '35% OFF',
      highlights: ['5-Star Properties', 'Spa & Wellness', 'Fine Dining'],
      oldPrice: '₹12,999',
      newPrice: '₹8,449',
      unit: 'night',
      code: 'LUXURY35',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop'
    },
    {
      type: 'business',
      title: 'Business Hotels',
      description: 'Corporate stays with premium amenities',
      discount: '25% OFF',
      highlights: ['Conference Rooms', 'High-Speed WiFi', 'Airport Shuttle'],
      oldPrice: '₹5,999',
      newPrice: '₹4,499',
      unit: 'night',
      code: 'BIZ25',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&h=300&fit=crop'
    },
    {
      type: 'resort',
      title: 'Beach Resorts',
      description: 'Tropical paradise getaways',
      discount: '40% OFF',
      highlights: ['Beach Access', 'All-Inclusive', 'Water Sports'],
      oldPrice: '₹15,999',
      newPrice: '₹9,599',
      unit: 'night',
      code: 'RESORT40',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&h=300&fit=crop'
    },
    {
      type: 'budget',
      title: 'Budget Stays',
      description: 'Quality accommodations at best prices',
      discount: '50% OFF',
      highlights: ['Clean Rooms', 'Free Breakfast', 'Central Location'],
      oldPrice: '₹1,999',
      newPrice: '₹999',
      unit: 'night',
      code: 'BUDGET50',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&h=300&fit=crop'
    },
    {
      type: 'boutique',
      title: 'Boutique Hotels',
      description: 'Unique stays with character',
      discount: '30% OFF',
      highlights: ['Heritage Properties', 'Personalized Service', 'Local Experience'],
      oldPrice: '₹7,999',
      newPrice: '₹5,599',
      unit: 'night',
      code: 'BOUTIQUE30',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop'
    },
    {
      type: 'villa',
      title: 'Private Villas',
      description: 'Exclusive stays with complete privacy',
      discount: '20% OFF',
      highlights: ['Private Pool', 'Full Kitchen', 'Butler Service'],
      oldPrice: '₹25,999',
      newPrice: '₹20,799',
      unit: 'night',
      code: 'VILLA20',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=300&fit=crop'
    },
    {
      type: 'heritage',
      title: 'Heritage Stays',
      description: 'Experience royal Indian hospitality',
      discount: '25% OFF',
      highlights: ['Palace Hotels', 'Cultural Tours', 'Traditional Cuisine'],
      oldPrice: '₹18,999',
      newPrice: '₹14,249',
      unit: 'night',
      code: 'HERITAGE25',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&h=300&fit=crop'
    },
    {
      type: 'homestay',
      title: 'Homestays',
      description: 'Authentic local living experience',
      discount: '35% OFF',
      highlights: ['Home Cooked Food', 'Local Hosts', 'Cultural Immersion'],
      oldPrice: '₹2,499',
      newPrice: '₹1,624',
      unit: 'night',
      code: 'HOME35',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop'
    },
    {
      type: 'treehouse',
      title: 'Treehouse Stays',
      description: 'Unique elevated nature experience',
      discount: '20% OFF',
      highlights: ['Nature Views', 'Eco-Friendly', 'Wildlife Sighting'],
      oldPrice: '₹8,999',
      newPrice: '₹7,199',
      unit: 'night',
      code: 'TREE20',
      image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500&h=300&fit=crop'
    }
  ];

  // Holiday Offers Data - 9 offers
  const holidayOffers = [
    {
      type: 'domestic',
      title: 'Kerala Backwaters',
      description: 'Explore God\'s Own Country',
      discount: '30% OFF',
      highlights: ['Houseboat Stay', 'Ayurveda Spa', 'Local Cuisine'],
      oldPrice: '₹25,999',
      newPrice: '₹18,199',
      unit: 'person',
      code: 'KERALA30',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&h=300&fit=crop'
    },
    {
      type: 'adventure',
      title: 'Ladakh Adventure',
      description: 'Thrilling mountain expedition',
      discount: '20% OFF',
      highlights: ['Bike Tours', 'Camping', 'Monastery Visit'],
      oldPrice: '₹35,999',
      newPrice: '₹28,799',
      unit: 'person',
      code: 'LADAKH20',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      type: 'beach',
      title: 'Goa Beach Holiday',
      description: 'Sun, sand and endless fun',
      discount: '25% OFF',
      highlights: ['Beach Resort', 'Water Sports', 'Nightlife'],
      oldPrice: '₹18,999',
      newPrice: '₹14,249',
      unit: 'person',
      code: 'GOA25',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&h=300&fit=crop'
    },
    {
      type: 'spiritual',
      title: 'Varanasi Spiritual',
      description: 'Sacred journey to holy destinations',
      discount: '15% OFF',
      highlights: ['Ganga Aarti', 'Temple Tours', 'Boat Ride'],
      oldPrice: '₹12,999',
      newPrice: '₹11,049',
      unit: 'person',
      code: 'DIVINE15',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=500&h=300&fit=crop'
    },
    {
      type: 'honeymoon',
      title: 'Honeymoon Packages',
      description: 'Romantic getaways for couples',
      discount: '35% OFF',
      highlights: ['Private Experiences', 'Candle-lit Dinners', 'Couple Spa'],
      oldPrice: '₹45,999',
      newPrice: '₹29,899',
      unit: 'couple',
      code: 'LOVE35',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&h=300&fit=crop'
    },
    {
      type: 'international',
      title: 'Dubai Delights',
      description: 'Experience luxury in the desert city',
      discount: '20% OFF',
      highlights: ['Burj Khalifa', 'Desert Safari', 'Shopping'],
      oldPrice: '₹75,999',
      newPrice: '₹60,799',
      unit: 'person',
      code: 'DUBAI20',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=300&fit=crop'
    },
    {
      type: 'kashmir',
      title: 'Kashmir Paradise',
      description: 'Heaven on Earth experience',
      discount: '25% OFF',
      highlights: ['Shikara Ride', 'Houseboat Stay', 'Mughal Gardens'],
      oldPrice: '₹32,999',
      newPrice: '₹24,749',
      unit: 'person',
      code: 'KASHMIR25',
      image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=500&h=300&fit=crop'
    },
    {
      type: 'thailand',
      title: 'Thailand Explorer',
      description: 'Beaches, temples and nightlife',
      discount: '30% OFF',
      highlights: ['Phuket', 'Bangkok', 'Pattaya'],
      oldPrice: '₹55,999',
      newPrice: '₹39,199',
      unit: 'person',
      code: 'THAI30',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&h=300&fit=crop'
    },
    {
      type: 'rajasthan',
      title: 'Royal Rajasthan',
      description: 'Explore the land of kings',
      discount: '22% OFF',
      highlights: ['Palace Tours', 'Desert Safari', 'Cultural Shows'],
      oldPrice: '₹28,999',
      newPrice: '₹22,619',
      unit: 'person',
      code: 'ROYAL22',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=500&h=300&fit=crop'
    }
  ];

  // Flight Offers Data - 9 offers
  const flightOffers = [
    {
      type: 'domestic-flight',
      title: 'Domestic Flights',
      description: 'Best deals on domestic routes',
      discount: 'UP TO ₹2000 OFF',
      highlights: ['All Airlines', 'Instant Confirmation', 'Free Cancellation'],
      oldPrice: '₹4,999',
      newPrice: '₹2,999',
      unit: 'person',
      code: 'FLYINDIA',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&h=300&fit=crop'
    },
    {
      type: 'international-flight',
      title: 'International Flights',
      description: 'Fly abroad at unbeatable prices',
      discount: 'UP TO ₹5000 OFF',
      highlights: ['Global Destinations', 'Multiple Airlines', 'Baggage Included'],
      oldPrice: '₹35,999',
      newPrice: '₹30,999',
      unit: 'person',
      code: 'FLYWORLD',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=500&h=300&fit=crop'
    },
    {
      type: 'business-flight',
      title: 'Business Class',
      description: 'Premium travel with luxury amenities',
      discount: '15% OFF',
      highlights: ['Lounge Access', 'Priority Boarding', 'Extra Baggage'],
      oldPrice: '₹55,999',
      newPrice: '₹47,599',
      unit: 'person',
      code: 'BIZCLASS15',
      image: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=500&h=300&fit=crop'
    },
    {
      type: 'student',
      title: 'Student Discounts',
      description: 'Special fares for students',
      discount: 'FLAT ₹1500 OFF',
      highlights: ['Valid Student ID', 'Extra Baggage', 'Flexible Dates'],
      oldPrice: '₹6,999',
      newPrice: '₹5,499',
      unit: 'person',
      code: 'STUDENT1500',
      image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&h=300&fit=crop'
    },
    {
      type: 'group-flight',
      title: 'Group Bookings',
      description: 'Special rates for group travel',
      discount: '25% OFF',
      highlights: ['10+ Passengers', 'Same Itinerary', 'Group Check-in'],
      oldPrice: '₹5,999',
      newPrice: '₹4,499',
      unit: 'person',
      code: 'GROUP25',
      image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=500&h=300&fit=crop'
    },
    {
      type: 'lastminute',
      title: 'Last Minute Deals',
      description: 'Urgent travel at discounted rates',
      discount: 'UP TO 40% OFF',
      highlights: ['Same Day Travel', 'Limited Seats', 'Quick Booking'],
      oldPrice: '₹7,999',
      newPrice: '₹4,799',
      unit: 'person',
      code: 'LASTNOW40',
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=500&h=300&fit=crop'
    },
    {
      type: 'firstclass',
      title: 'First Class',
      description: 'Ultimate luxury in the skies',
      discount: '10% OFF',
      highlights: ['Private Suite', 'Gourmet Dining', 'Spa Services'],
      oldPrice: '₹1,25,999',
      newPrice: '₹1,13,399',
      unit: 'person',
      code: 'FIRST10',
      image: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?w=500&h=300&fit=crop'
    },
    {
      type: 'weekend',
      title: 'Weekend Getaway',
      description: 'Quick weekend escapes',
      discount: 'FLAT ₹800 OFF',
      highlights: ['Fri-Sun Flights', 'Short Trips', 'Best Routes'],
      oldPrice: '₹3,999',
      newPrice: '₹3,199',
      unit: 'person',
      code: 'WEEKEND800',
      image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=500&h=300&fit=crop'
    },
    {
      type: 'senior',
      title: 'Senior Citizen',
      description: 'Special fares for 60+ travelers',
      discount: '12% OFF',
      highlights: ['Wheelchair Assistance', 'Priority Boarding', 'Meal Included'],
      oldPrice: '₹5,499',
      newPrice: '₹4,839',
      unit: 'person',
      code: 'SENIOR12',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&h=300&fit=crop'
    }
  ];

  const getCurrentOffers = () => {
    switch(activeTab) {
      case 'fleet': 
        // Filter fleet offers by location if selected
        if (selectedLocation) {
          const filtered = fleetOffers.filter(offer => 
            offer.locations && offer.locations.some(loc => 
              loc.toLowerCase().includes(selectedLocation.toLowerCase())
            )
          );
          return filtered.length > 0 ? filtered : fleetOffers;
        }
        return fleetOffers;
      case 'hotels': return hotelOffers;
      case 'holidays': return holidayOffers;
      case 'flights': return flightOffers;
      default: return fleetOffers;
    }
  };

  const getOfferIcon = (type) => {
    const icons = {
      car: 'fas fa-car',
      bus: 'fas fa-bus',
      tempo: 'fas fa-shuttle-van',
      airport: 'fas fa-plane-departure',
      suv: 'fas fa-car-side',
      minibus: 'fas fa-bus-alt',
      sedan: 'fas fa-car',
      'luxury-car': 'fas fa-gem',
      wedding: 'fas fa-heart',
      luxury: 'fas fa-star',
      business: 'fas fa-briefcase',
      resort: 'fas fa-umbrella-beach',
      budget: 'fas fa-wallet',
      boutique: 'fas fa-crown',
      villa: 'fas fa-home',
      heritage: 'fas fa-landmark',
      homestay: 'fas fa-house-user',
      treehouse: 'fas fa-tree',
      domestic: 'fas fa-map-marked-alt',
      adventure: 'fas fa-hiking',
      beach: 'fas fa-water',
      spiritual: 'fas fa-praying-hands',
      honeymoon: 'fas fa-heart',
      international: 'fas fa-globe-americas',
      kashmir: 'fas fa-mountain',
      thailand: 'fas fa-sun',
      rajasthan: 'fas fa-gopuram',
      'domestic-flight': 'fas fa-plane',
      'international-flight': 'fas fa-globe',
      'business-flight': 'fas fa-crown',
      student: 'fas fa-graduation-cap',
      'group-flight': 'fas fa-users',
      lastminute: 'fas fa-bolt',
      firstclass: 'fas fa-gem',
      weekend: 'fas fa-calendar-week',
      senior: 'fas fa-user-tie'
    };
    return icons[type] || 'fas fa-tag';
  };

  // Get booking link with offer code for discount application
  const getBookingLink = (offer) => {
    // For fleet offers, navigate to vehicle details page
    if (activeTab === 'fleet' && offer && offer.id) {
      return `/vehicle-details/${offer.id}?code=${offer.code || ''}`;
    }
    
    const baseLinks = {
      fleet: '/fleet-results',
      hotels: '/hotels',
      holidays: '/tour',
      flights: '/flights'
    };
    const baseLink = baseLinks[activeTab] || '/';
    // Pass offer code and type as query params
    return `${baseLink}?offer=${offer.type}&code=${offer.code}`;
  };

  const getPromoInfo = () => {
    switch(activeTab) {
      case 'fleet':
        return { title: 'First Ride Bonus!', desc: 'Use code FIRSTRIDE to get extra ₹200 off on your first vehicle booking', code: 'FIRSTRIDE' };
      case 'hotels':
        return { title: 'Stay More, Save More!', desc: 'Use code STAYBIG to get extra 15% off on 3+ night stays', code: 'STAYBIG' };
      case 'holidays':
        return { title: 'Group Travel Bonus!', desc: 'Use code GROUPFUN to get ₹2000 off on bookings for 4+ travelers', code: 'GROUPFUN' };
      case 'flights':
        return { title: 'Fly Smart, Save Big!', desc: 'Use code FLYNOW to get flat ₹500 off on domestic flights', code: 'FLYNOW' };
      default:
        return { title: 'Special Offer!', desc: 'Check out our exclusive deals', code: 'SPECIAL' };
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Show a brief toast notification
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.innerHTML = '<i class="fas fa-check"></i> Code copied!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  return (
    <div className="offers-page">
      {/* Hero Section */}
      <section className="offers-hero">
        <div className="offers-hero-bg">
          <div className="hero-gradient"></div>
          <div className="floating-icon icon-1"><i className="fas fa-percent"></i></div>
          <div className="floating-icon icon-2"><i className="fas fa-tag"></i></div>
          <div className="floating-icon icon-3"><i className="fas fa-gift"></i></div>
          <div className="floating-icon icon-4"><i className="fas fa-star"></i></div>
        </div>
        <div className="container">
          <div className="offers-hero-content">
            <span className="hero-label">
              <i className="fas fa-fire"></i> Limited Time Offers
            </span>
            <h1>Exclusive <span>Offers</span> & Deals</h1>
            <p>Unlock incredible savings on Travel Fleet, Hotels, Holiday Packages, and Flights. Book now and save up to 40%!</p>
            <div className="offers-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Active Deals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">40%</span>
                <span className="stat-label">Max Savings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers-main">
        <div className="container">
          {/* Tabs */}
          <div className="offers-tabs-wrapper">
            <div className="offers-tabs">
              <button 
                className={`offers-tab ${activeTab === 'fleet' ? 'active' : ''}`} 
                onClick={() => setActiveTab('fleet')}
              >
                <div className="tab-icon"><i className="fas fa-car-side"></i></div>
                <span>Travel Fleet</span>
              </button>
              <button 
                className={`offers-tab ${activeTab === 'hotels' ? 'active' : ''}`} 
                onClick={() => setActiveTab('hotels')}
              >
                <div className="tab-icon"><i className="fas fa-hotel"></i></div>
                <span>Hotels</span>
              </button>
              <button 
                className={`offers-tab ${activeTab === 'holidays' ? 'active' : ''}`} 
                onClick={() => setActiveTab('holidays')}
              >
                <div className="tab-icon"><i className="fas fa-umbrella-beach"></i></div>
                <span>Holidays</span>
              </button>
              <button 
                className={`offers-tab ${activeTab === 'flights' ? 'active' : ''}`} 
                onClick={() => setActiveTab('flights')}
              >
                <div className="tab-icon"><i className="fas fa-plane"></i></div>
                <span>Flights</span>
              </button>
            </div>
            
            {/* Location Picker for Fleet */}
            {activeTab === 'fleet' && (
              <div className="offers-location-picker">
                <div className="location-label">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Showing offers in:</span>
                </div>
                <div className="location-input-container">
                  <input
                    type="text"
                    placeholder="Select your city"
                    value={selectedLocation}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onFocus={() => setShowLocationPicker(true)}
                    className="location-input"
                  />
                  <button 
                    className="detect-btn"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    title="Use current location"
                  >
                    {isDetectingLocation ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-location-crosshairs"></i>
                    )}
                  </button>
                  
                  {showLocationPicker && (
                    <div className="location-dropdown">
                      <div className="dropdown-title">
                        <i className="fas fa-map-pin"></i> Popular Cities
                      </div>
                      <div className="dropdown-list">
                        {filteredLocations.map((loc, idx) => (
                          <button
                            key={idx}
                            className="location-item"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setShowLocationPicker(false);
                            }}
                          >
                            <i className="fas fa-city"></i> {loc}
                          </button>
                        ))}
                        {filteredLocations.length === 0 && (
                          <div className="no-results">No matching cities</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedLocation && (
                  <button 
                    className="clear-btn"
                    onClick={() => setSelectedLocation('')}
                  >
                    <i className="fas fa-times"></i> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Promo Banner */}
          <div className="offers-promo-banner">
            <div className="promo-icon"><i className="fas fa-gift"></i></div>
            <div className="promo-content">
              <h3>{getPromoInfo().title}</h3>
              <p>{getPromoInfo().desc}</p>
            </div>
            <div className="promo-code">
              <span className="code-text">{getPromoInfo().code}</span>
              <button className="copy-btn" onClick={() => copyCode(getPromoInfo().code)}>
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="offers-grid">
            {getCurrentOffers().map((offer, index) => (
              <div 
                key={`${offer.type}-${index}`} 
                className={`offer-card ${offer.type}`}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="offer-card-image">
                  <img src={offer.image} alt={offer.title} loading="lazy" />
                  <div className="image-overlay"></div>
                  <div className="offer-icon">
                    <i className={getOfferIcon(offer.type)}></i>
                  </div>
                  <div className="offer-discount">{offer.discount}</div>
                </div>
                <div className="offer-card-body">
                  {/* Operator info for fleet offers */}
                  {activeTab === 'fleet' && offer.operator && (
                    <div className="operator-info">
                      <div className="operator-name-badge">
                        <i className="fas fa-building"></i>
                        <span>{offer.operator}</span>
                      </div>
                      <div className="operator-rating-badge">
                        <i className="fas fa-star"></i>
                        <span>{offer.operatorRating}</span>
                      </div>
                    </div>
                  )}
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <ul className="offer-highlights">
                    {offer.highlights.map((highlight, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check-circle"></i>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  {/* Service locations for fleet offers */}
                  {activeTab === 'fleet' && offer.locations && (
                    <div className="service-locations">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{offer.locations.slice(0, 3).join(', ')}{offer.locations.length > 3 ? ` +${offer.locations.length - 3} more` : ''}</span>
                    </div>
                  )}
                  <div className="offer-code-section">
                    <span className="code-label">Use Code:</span>
                    <div className="code-wrapper">
                      <span className="code">{offer.code}</span>
                      <button className="copy-small" onClick={() => copyCode(offer.code)}>
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="offer-card-footer">
                  <div className="offer-pricing">
                    <span className="old-price">{offer.oldPrice}</span>
                    <span className="new-price">{offer.newPrice}<small>/{offer.unit}</small></span>
                  </div>
                  <Link to={getBookingLink(offer)} className="book-btn">
                    Book Now <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="offers-bottom-cta">
            <div className="cta-content">
              <h3>Can't find what you're looking for?</h3>
              <p>Contact our travel experts for customized deals and packages</p>
            </div>
            <Link to="/contact" className="cta-btn">
              <i className="fas fa-headset"></i> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
