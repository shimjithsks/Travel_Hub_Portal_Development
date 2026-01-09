import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import '../styles/yatraHome.css';

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if first visit - show login modal only if user is not logged in
  useEffect(() => {
    // Wait for auth loading to complete before deciding to show modal
    if (loading) return;
    
    const hasVisited = sessionStorage.getItem('hasVisitedBefore');
    if (!hasVisited && !user) {
      // Only show modal if first visit AND user is not logged in
      sessionStorage.setItem('hasVisitedBefore', 'true');
      setShowLoginModal(true);
    }
  }, [loading, user]);

  const [activeTab, setActiveTab] = useState('fleet');
  const [tripType, setTripType] = useState('oneWay');
  const [fromCity, setFromCity] = useState({ name: 'New Delhi', code: 'DEL', airport: 'Indira Gandhi International' });
  const [toCity, setToCity] = useState({ name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji International' });
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get tomorrow's date or next day from a given date
  const getNextDay = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Handle pickup date change - auto-update return date if needed
  const handlePickupDateChange = (newPickupDate) => {
    // If return date is before the new pickup date, set it to same as pickup
    if (!fleetSearch.dropoffDate || fleetSearch.dropoffDate < newPickupDate) {
      setFleetSearch({ ...fleetSearch, date: newPickupDate, dropoffDate: newPickupDate });
    } else {
      setFleetSearch({ ...fleetSearch, date: newPickupDate });
    }
  };

  // Handle return date change
  const handleReturnDateChange = (newReturnDate) => {
    // Ensure return date is same as or after pickup date
    if (newReturnDate >= fleetSearch.date) {
      setFleetSearch({ ...fleetSearch, dropoffDate: newReturnDate });
    }
  };
  
  // Fleet search state
  const [fleetSearch, setFleetSearch] = useState({
    location: '',
    vehicleCategory: '',
    date: getTodayDate(),
    dropoffDate: getNextDay()
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

  // Auto-detect location on page load for hero search box
  useEffect(() => {
    if (!fleetSearch.location && navigator.geolocation) {
      setIsGettingLocation(true); // Show loading spinner
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
                setFleetSearch(prev => ({ ...prev, location: placeName }));
              }
            }
          } catch (error) {
            console.error('Auto location detection error for search box:', error);
          } finally {
            setIsGettingLocation(false); // Hide loading spinner
          }
        },
        (error) => {
          console.error('Geolocation permission denied or error:', error);
          setIsGettingLocation(false); // Hide loading spinner on error
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []); // Run once on mount

  // Holiday search state
  const [holidaySearch, setHolidaySearch] = useState({
    destination: '',
    date: getTodayDate(),
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
      
      // Scroll suggestions into view
      setTimeout(() => {
        const suggestionsElement = document.querySelector('.location-suggestions');
        if (suggestionsElement) {
          suggestionsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 0);
    } else {
      setFilteredLocations(popularLocations);
      setShowLocationSuggestions(true);
      
      // Scroll suggestions into view
      setTimeout(() => {
        const suggestionsElement = document.querySelector('.location-suggestions');
        if (suggestionsElement) {
          suggestionsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 0);
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
    // Initialize AOS with enhanced settings
    AOS.init({ 
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 0,
    });

    // Custom scroll reveal using Intersection Observer
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    scrollRevealElements.forEach(el => observer.observe(el));

    // Smooth scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      scrollRevealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // Active deals tab state
  const [activeDealsTab, setActiveDealsTab] = useState('fleet');

  // Deals location picker state
  const [dealsLocation, setDealsLocation] = useState('');
  const [showDealsLocationPicker, setShowDealsLocationPicker] = useState(false);
  const [filteredDealsLocations, setFilteredDealsLocations] = useState(popularLocations);
  const [isDetectingDealsLocation, setIsDetectingDealsLocation] = useState(false);
  const dealsLocationPickerRef = useRef(null);

  // Auto-detect location on page load for deals
  useEffect(() => {
    if (!dealsLocation && navigator.geolocation) {
      setIsDetectingDealsLocation(true); // Show loading spinner
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
                setDealsLocation(placeName);
              }
            }
          } catch (error) {
            console.error('Auto location detection error:', error);
          } finally {
            setIsDetectingDealsLocation(false); // Hide loading spinner
          }
        },
        (error) => {
          console.error('Geolocation permission denied or error:', error);
          setIsDetectingDealsLocation(false); // Hide loading spinner on error
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []); // Run once on mount

  // Detect current location for deals
  const detectDealsLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingDealsLocation(true);
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
              setDealsLocation(placeName);
            }
          }
        } catch (error) {
          console.error('Geocoding Error:', error);
          alert('Could not determine location. Please select manually.');
        }
        
        setIsDetectingDealsLocation(false);
        setShowDealsLocationPicker(false);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        alert('Unable to retrieve your location. Please select manually.');
        setIsDetectingDealsLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Handle deals location input change
  const handleDealsLocationChange = (value) => {
    setDealsLocation(value);
    if (value.trim()) {
      const filtered = popularLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDealsLocations(filtered);
    } else {
      setFilteredDealsLocations(popularLocations);
    }
  };

  // Select deals location
  const selectDealsLocation = (location) => {
    setDealsLocation(location);
    setShowDealsLocationPicker(false);
  };

  // Click outside handler for deals location picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dealsLocationPickerRef.current && !dealsLocationPickerRef.current.contains(event.target)) {
        setShowDealsLocationPicker(false);
      }
    };

    if (showDealsLocationPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDealsLocationPicker]);

  // Fleet Offers Data (with operator and location info)
  const fleetOffers = [
    {
      id: 1,
      type: 'car',
      code: 'CAR20',
      title: 'Car Rentals',
      description: 'Self-drive & chauffeur driven vehicles',
      discount: '20% OFF',
      highlights: ['Sedan, SUV, Luxury', 'Fuel Options', '24/7 Support'],
      oldPrice: '₹1,249',
      newPrice: '₹999',
      unit: '/day',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
      operator: 'Royal Travels',
      operatorRating: 4.8,
      locations: ['Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Kannur']
    },
    {
      id: 2,
      type: 'bus',
      code: 'BUS15',
      title: 'Bus Booking',
      description: 'Comfortable group travel across cities',
      discount: '15% OFF',
      highlights: ['AC & Non-AC', 'Sleeper & Seater', '100+ Routes'],
      oldPrice: '₹599',
      newPrice: '₹499',
      unit: '/seat',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop',
      operator: 'Kerala State RTC',
      operatorRating: 4.5,
      locations: ['Kozhikode', 'Kochi', 'Thiruvananthapuram', 'Bengaluru', 'Chennai']
    },
    {
      id: 3,
      type: 'tempo',
      code: 'TEMPO25',
      title: 'Tempo Traveller',
      description: 'Perfect for family & group outings',
      discount: '25% OFF',
      highlights: ['9 to 26 Seaters', 'Push-back Seats', 'Entertainment'],
      oldPrice: '₹3,299',
      newPrice: '₹2,499',
      unit: '/day',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
      operator: 'Malabar Tours',
      operatorRating: 4.7,
      locations: ['Kozhikode', 'Wayanad', 'Munnar', 'Ooty']
    },
    {
      id: 4,
      type: 'airport',
      code: 'AIRPORT100',
      title: 'Airport Transfer',
      description: 'Hassle-free pickups & drops',
      discount: 'FLAT ₹100 OFF',
      highlights: ['Meet & Greet', 'Flight Tracking', '24/7 Available'],
      oldPrice: '₹899',
      newPrice: '₹799',
      unit: '/trip',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop',
      operator: 'Airport Cabs Kerala',
      operatorRating: 4.9,
      locations: ['Kozhikode', 'Kochi', 'Kannur', 'Thiruvananthapuram']
    },
    {
      id: 5,
      type: 'car',
      code: 'CARBLR25',
      title: 'Premium Sedan',
      description: 'Luxury sedans for corporate travel',
      discount: '25% OFF',
      highlights: ['Swift Dzire, Honda City', 'Professional Drivers', 'Corporate Billing'],
      oldPrice: '₹1,599',
      newPrice: '₹1,199',
      unit: '/day',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop',
      operator: 'Bangalore City Cabs',
      operatorRating: 4.6,
      locations: ['Bengaluru', 'Mysuru', 'Chennai', 'Hyderabad']
    },
    {
      id: 6,
      type: 'tempo',
      code: 'TEMPO30MUM',
      title: 'Luxury Tempo Traveller',
      description: 'AC tempo with premium interiors',
      discount: '30% OFF',
      highlights: ['12 to 20 Seaters', 'Maharaja Seats', 'Entertainment System'],
      oldPrice: '₹4,999',
      newPrice: '₹3,499',
      unit: '/day',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
      operator: 'Mumbai Tours & Travels',
      operatorRating: 4.4,
      locations: ['Mumbai', 'Pune', 'Goa', 'Nashik']
    },
    {
      id: 7,
      type: 'bus',
      code: 'VOLVODEL',
      title: 'Volvo AC Sleeper',
      description: 'Premium overnight bus travel',
      discount: '20% OFF',
      highlights: ['Multi-axle Volvo', 'USB Charging', 'Blankets & Snacks'],
      oldPrice: '₹1,299',
      newPrice: '₹1,039',
      unit: '/seat',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=250&fit=crop',
      operator: 'North India Travels',
      operatorRating: 4.3,
      locations: ['Delhi', 'Jaipur', 'Agra', 'Manali', 'Chandigarh']
    },
    {
      id: 8,
      type: 'car',
      code: 'INNOVA15',
      title: 'Innova Crysta',
      description: 'Spacious family vehicle',
      discount: '15% OFF',
      highlights: ['7+1 Seater', 'Captain Seats', 'Airport Pickup'],
      oldPrice: '₹2,499',
      newPrice: '₹2,124',
      unit: '/day',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
      operator: 'South Kerala Travels',
      operatorRating: 4.7,
      locations: ['Thiruvananthapuram', 'Kochi', 'Alleppey', 'Munnar']
    }
  ];

  // Hotels Offers Data
  const hotelOffers = [
    {
      id: 1,
      type: 'luxury',
      code: 'LUXURY30',
      title: 'Luxury Hotels',
      description: '5-star premium accommodations',
      discount: '30% OFF',
      highlights: ['5-Star Properties', 'Spa & Wellness', 'Fine Dining'],
      oldPrice: '₹12,999',
      newPrice: '₹8,999',
      unit: '/night',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      type: 'business',
      code: 'BIZSTAY25',
      title: 'Business Hotels',
      description: 'Perfect for corporate travelers',
      discount: '25% OFF',
      highlights: ['WiFi & Workspace', 'Meeting Rooms', 'Airport Shuttle'],
      oldPrice: '₹6,499',
      newPrice: '₹4,999',
      unit: '/night',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      type: 'resort',
      code: 'BEACH35',
      title: 'Beach Resorts',
      description: 'Stunning beachfront getaways',
      discount: '35% OFF',
      highlights: ['Ocean View', 'Water Sports', 'All Inclusive'],
      oldPrice: '₹15,999',
      newPrice: '₹9,999',
      unit: '/night',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      type: 'budget',
      code: 'BUDGET500',
      title: 'Budget Stays',
      description: 'Affordable quality accommodations',
      discount: 'FLAT ₹500 OFF',
      highlights: ['Clean Rooms', 'Free Breakfast', 'Great Location'],
      oldPrice: '₹1,999',
      newPrice: '₹1,499',
      unit: '/night',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=250&fit=crop'
    }
  ];

  // Holidays Offers Data
  const holidayOffers = [
    {
      id: 1,
      type: 'domestic',
      code: 'KERALA20',
      title: 'Kerala Backwaters',
      description: 'Explore God\'s Own Country',
      discount: '20% OFF',
      highlights: ['Houseboat Stay', 'Ayurveda Spa', 'Local Cuisine'],
      oldPrice: '₹25,999',
      newPrice: '₹19,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      type: 'adventure',
      code: 'LADAKH15',
      title: 'Ladakh Adventure',
      description: 'Thrilling mountain expedition',
      discount: '15% OFF',
      highlights: ['Bike Tours', 'Camping', 'Monastery Visit'],
      oldPrice: '₹35,999',
      newPrice: '₹29,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      type: 'beach',
      code: 'GOA25',
      title: 'Goa Beach Holiday',
      description: 'Sun, sand and endless fun',
      discount: '25% OFF',
      highlights: ['Beach Resort', 'Water Sports', 'Nightlife'],
      oldPrice: '₹18,999',
      newPrice: '₹13,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      type: 'spiritual',
      code: 'VARANASI2K',
      title: 'Varanasi Spiritual Tour',
      description: 'Experience spiritual India',
      discount: 'FLAT ₹2,000 OFF',
      highlights: ['Ganga Aarti', 'Temple Tours', 'Boat Ride'],
      oldPrice: '₹12,999',
      newPrice: '₹10,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=250&fit=crop'
    }
  ];

  // Flights Offers Data
  const flightOffers = [
    {
      id: 1,
      type: 'domestic',
      code: 'FLYDOM2K',
      title: 'Domestic Flights',
      description: 'Fly across India at best prices',
      discount: 'Up to ₹2,000 OFF',
      highlights: ['All Airlines', 'Flexible Dates', 'Free Meals'],
      oldPrice: '₹5,999',
      newPrice: '₹3,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      type: 'international',
      code: 'FLYINTL5K',
      title: 'International Flights',
      description: 'Explore the world affordably',
      discount: 'Up to ₹5,000 OFF',
      highlights: ['50+ Countries', 'Premium Airlines', 'Lounge Access'],
      oldPrice: '₹45,999',
      newPrice: '₹39,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      type: 'business',
      code: 'FLYBIZ20',
      title: 'Business Class',
      description: 'Fly in ultimate comfort',
      discount: '20% OFF',
      highlights: ['Lie-flat Seats', 'Priority Boarding', 'Premium Dining'],
      oldPrice: '₹85,999',
      newPrice: '₹68,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      type: 'student',
      code: 'STUDENT10',
      title: 'Student Fares',
      description: 'Special discounts for students',
      discount: 'EXTRA 10% OFF',
      highlights: ['Extra Baggage', 'Flexible Booking', 'Easy Cancellation'],
      oldPrice: '₹8,999',
      newPrice: '₹6,999',
      unit: '/person',
      image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=250&fit=crop'
    }
  ];

  // Get current offers based on active tab and location filter
  const getCurrentOffers = () => {
    switch(activeDealsTab) {
      case 'fleet': 
        // Filter fleet offers by location if selected
        if (dealsLocation) {
          const filtered = fleetOffers.filter(offer => 
            offer.locations && offer.locations.some(loc => 
              loc.toLowerCase().includes(dealsLocation.toLowerCase())
            )
          );
          return filtered.length > 0 ? filtered : fleetOffers; // Fallback to all if none match
        }
        return fleetOffers;
      case 'hotels': return hotelOffers;
      case 'holidays': return holidayOffers;
      case 'flights': return flightOffers;
      default: return fleetOffers;
    }
  };

  // Get icon for offer type
  const getOfferIcon = (type) => {
    const icons = {
      car: 'fas fa-car',
      bus: 'fas fa-bus',
      tempo: 'fas fa-shuttle-van',
      airport: 'fas fa-plane-departure',
      luxury: 'fas fa-crown',
      business: 'fas fa-briefcase',
      resort: 'fas fa-umbrella-beach',
      budget: 'fas fa-bed',
      domestic: 'fas fa-mountain',
      adventure: 'fas fa-hiking',
      beach: 'fas fa-water',
      spiritual: 'fas fa-praying-hands',
      international: 'fas fa-globe',
      student: 'fas fa-graduation-cap'
    };
    return icons[type] || 'fas fa-tag';
  };

  // Get link for offer type with offer code
  const getOfferLink = (offer = null) => {
    // For fleet offers, navigate to vehicle details page
    if (activeDealsTab === 'fleet' && offer && offer.id) {
      return `/vehicle-details/${offer.id}?code=${offer.code || ''}`;
    }
    
    const baseLinks = {
      fleet: '/fleet-results',
      hotels: '/hotels',
      holidays: '/tour',
      flights: '/flights'
    };
    const baseLink = baseLinks[activeDealsTab] || '/offers';
    
    // If offer is provided, add query params
    if (offer && offer.type) {
      return `${baseLink}?offer=${offer.type}&code=${offer.code || ''}`;
    }
    return baseLink;
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

  return (
    <div className="yatra-home">
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Promotional Top Banner */}
      <section className="promo-top-banner" data-aos="fade-down" data-aos-duration="600">
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

      {/* Trust Indicators - Premium Glass Cards */}
      <section className="trust-indicators-new" data-aos="fade-up" data-aos-duration="700">
        <div className="container">
          <div className="trust-grid-new">
            <div className="trust-card">
              <div className="trust-card-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="trust-card-content">
                <h4>100% Secure Payments</h4>
                <p>All major credit & debit cards accepted</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div className="trust-card-content">
                <h4>24/7 Customer Support</h4>
                <p>We're always here to help you</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">
                <i className="fas fa-medal"></i>
              </div>
              <div className="trust-card-content">
                <h4>Best Price Guarantee</h4>
                <p>Find a lower price? We'll match it!</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-card-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="trust-card-content">
                <h4>2M+ Happy Customers</h4>
                <p>Trusted by millions worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with Search - Complete Redesign */}
      <section className="hero-section-new" data-aos="fade" data-aos-duration="800">
        <div className="hero-bg-elements">
          <div className="hero-gradient-orb orb-1"></div>
          <div className="hero-gradient-orb orb-2"></div>
          <div className="hero-gradient-orb orb-3"></div>
          <div className="hero-pattern"></div>
          {/* Floating Travel Icons */}
          <div className="hero-floating-icons">
            <i className="fas fa-plane floating-icon f-icon-1"></i>
            <i className="fas fa-globe-americas floating-icon f-icon-2"></i>
            <i className="fas fa-map-marked-alt floating-icon f-icon-3"></i>
            <i className="fas fa-passport floating-icon f-icon-4"></i>
            <i className="fas fa-suitcase-rolling floating-icon f-icon-5"></i>
            <i className="fas fa-laptop floating-icon f-icon-6"></i>
          </div>
        </div>
        
        <div className="container">
          <div className="hero-content-wrapper">
            {/* Hero Text */}
            <div className="hero-headline">
              <span className="hero-tagline">
                <i className="fas fa-compass"></i>
                Your Journey Begins Here
              </span>
              <h1>Discover <span className="gradient-text">Amazing</span> Places</h1>
              <p>Book vehicles, holidays, hotels & flights at the best prices</p>
            </div>

            {/* Search Widget - Glass Morphism Design */}
            <div className="search-widget-new">
              {/* Tab Navigation - Pill Style */}
              <div className="search-tabs-new">
                <button 
                  className={`tab-pill ${activeTab === 'fleet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fleet')}
                >
                  <div className="tab-icon-wrapper">
                    <i className="fas fa-car-side"></i>
                  </div>
                  <span>Travel Fleet</span>
                </button>
                <button 
                  className={`tab-pill ${activeTab === 'holidays' ? 'active' : ''}`}
                  onClick={() => setActiveTab('holidays')}
                >
                  <div className="tab-icon-wrapper">
                    <i className="fas fa-umbrella-beach"></i>
                  </div>
                  <span>Holidays</span>
                </button>
                <button 
                  className={`tab-pill ${activeTab === 'hotels' ? 'active' : ''}`}
                  onClick={() => setActiveTab('hotels')}
                >
                  <div className="tab-icon-wrapper">
                    <i className="fas fa-hotel"></i>
                  </div>
                  <span>Hotels</span>
                  <span className="tab-badge">50% Off</span>
                </button>
                <button 
                  className={`tab-pill ${activeTab === 'flights' ? 'active' : ''}`}
                  onClick={() => setActiveTab('flights')}
                >
                  <div className="tab-icon-wrapper">
                    <i className="fas fa-plane"></i>
                  </div>
                  <span>Flights</span>
                  <span className="tab-badge">19% Off</span>
                </button>
              </div>

              {/* Search Forms */}
              <div className="search-form-new">
                {/* Travel Fleet Form */}
                {activeTab === 'fleet' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="form-grid fleet-grid">
                      <div className="form-field location-field-new">
                        <div className="field-label">
                          <i className="fas fa-location-dot"></i>
                          <span>Pickup Location</span>
                        </div>
                        <div className="field-input-wrapper" id="pickup-location-wrapper">
                          <input 
                            type="text" 
                            placeholder="Search city or area..." 
                            value={fleetSearch.location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onFocus={(e) => {
                              setShowLocationSuggestions(true);
                              // Position the dropdown
                              const wrapper = e.target.parentElement;
                              const rect = wrapper.getBoundingClientRect();
                              const dropdown = document.getElementById('location-dropdown-fleet');
                              if (dropdown) {
                                dropdown.style.top = `${rect.bottom + 8}px`;
                                dropdown.style.left = `${rect.left}px`;
                                dropdown.style.width = `${rect.width}px`;
                              }
                            }}
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                          />
                          <button 
                            type="button"
                            className="gps-btn"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                          >
                            {isGettingLocation ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-crosshairs"></i>
                            )}
                          </button>
                          
                          {showLocationSuggestions && (
                            <div className="suggestions-dropdown-new" id="location-dropdown-fleet">
                              <div className="dropdown-title">
                                <i className="fas fa-map-pin"></i> Popular Locations
                              </div>
                              {filteredLocations.map((location, index) => (
                                <div 
                                  key={index}
                                  className="suggestion-item-new"
                                  onMouseDown={() => selectLocation(location)}
                                >
                                  <i className="fas fa-location-arrow"></i>
                                  <span>{location}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-car"></i>
                          <span>Vehicle Type</span>
                        </div>
                        <div className="field-input-wrapper select-wrapper">
                          <select 
                            value={fleetSearch.vehicleCategory}
                            onChange={(e) => setFleetSearch({...fleetSearch, vehicleCategory: e.target.value})}
                          >
                            <option value="">All Categories</option>
                            <option value="car">🚗 Car</option>
                            <option value="cab">🚕 Cab</option>
                            <option value="tempo-traveller">🚐 Tempo Traveller</option>
                            <option value="van">🚌 Van / Urvan</option>
                            <option value="mini-bus">🚌 Mini Bus</option>
                            <option value="tour-bus">🚎 Tour Bus</option>
                            <option value="luxury">✨ Luxury Vehicle</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-check"></i>
                          <span>Pickup Date</span>
                        </div>
                        <div 
                          className="field-input-wrapper date-wrapper"
                          onClick={() => document.getElementById('pickup-date-new').showPicker()}
                        >
                          <input 
                            id="pickup-date-new"
                            type="date" 
                            value={fleetSearch.date}
                            min={getTodayDate()}
                            onChange={(e) => handlePickupDateChange(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-xmark"></i>
                          <span>Return Date</span>
                        </div>
                        <div 
                          className="field-input-wrapper date-wrapper"
                          onClick={() => document.getElementById('return-date-new').showPicker()}
                        >
                          <input 
                            id="return-date-new"
                            type="date" 
                            value={fleetSearch.dropoffDate}
                            min={fleetSearch.date}
                            onChange={(e) => handleReturnDateChange(e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        className="search-btn-new"
                        onClick={() => navigate('/fleet-results', { state: fleetSearch })}
                      >
                        <i className="fas fa-search"></i>
                        <span>Search Vehicles</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Holidays Form */}
                {activeTab === 'holidays' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="form-grid holidays-grid">
                      <div className="form-field location-field-new">
                        <div className="field-label">
                          <i className="fas fa-map-location-dot"></i>
                          <span>Destination</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input
                            type="text"
                            placeholder="Where do you want to go?"
                            value={holidaySearch.destination}
                            onChange={e => handleDestinationChange(e.target.value)}
                            onFocus={() => setShowDestinationSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          />
                          {showDestinationSuggestions && (
                            <div className="suggestions-dropdown-new">
                              <div className="dropdown-title">
                                <i className="fas fa-fire"></i> Popular Destinations
                              </div>
                              {filteredDestinations.map((destination, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item-new"
                                  onMouseDown={() => selectDestination(destination)}
                                >
                                  <i className="fas fa-location-arrow"></i>
                                  <span>{destination}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-days"></i>
                          <span>Travel Date</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input
                            type="date"
                            value={holidaySearch.date}
                            min={getTodayDate()}
                            onChange={e => setHolidaySearch({ ...holidaySearch, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-clock"></i>
                          <span>Duration</span>
                        </div>
                        <div className="field-input-wrapper select-wrapper">
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
                      </div>

                      <button 
                        className="search-btn-new"
                        onClick={() => navigate('/tour', { state: { searchTerm: holidaySearch.destination } })}
                      >
                        <i className="fas fa-search"></i>
                        <span>Explore Packages</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Hotels Form */}
                {activeTab === 'hotels' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="form-grid hotels-grid">
                      <div className="form-field location-field-new">
                        <div className="field-label">
                          <i className="fas fa-building"></i>
                          <span>City or Hotel</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input type="text" placeholder="Search city, area or property..." />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-check"></i>
                          <span>Check-in</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input type="date" />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-xmark"></i>
                          <span>Check-out</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input type="date" />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-users"></i>
                          <span>Guests</span>
                        </div>
                        <div className="field-input-wrapper select-wrapper">
                          <select>
                            <option>1 Room, 2 Adults</option>
                            <option>2 Rooms, 4 Adults</option>
                            <option>3 Rooms, 6 Adults</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        className="search-btn-new"
                        onClick={() => navigate('/hotels')}
                      >
                        <i className="fas fa-search"></i>
                        <span>Find Hotels</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Flights Form */}
                {activeTab === 'flights' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="flight-trip-types">
                      <label className={tripType === 'oneWay' ? 'active' : ''}>
                        <input 
                          type="radio" 
                          name="tripType" 
                          checked={tripType === 'oneWay'}
                          onChange={() => setTripType('oneWay')}
                        />
                        <span>One Way</span>
                      </label>
                      <label className={tripType === 'roundTrip' ? 'active' : ''}>
                        <input 
                          type="radio" 
                          name="tripType"
                          checked={tripType === 'roundTrip'}
                          onChange={() => setTripType('roundTrip')}
                        />
                        <span>Round Trip</span>
                      </label>
                      <label className={tripType === 'multiCity' ? 'active' : ''}>
                        <input 
                          type="radio" 
                          name="tripType"
                          checked={tripType === 'multiCity'}
                          onChange={() => setTripType('multiCity')}
                        />
                        <span>Multi City</span>
                      </label>
                    </div>
                    <div className="form-grid flights-grid">
                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-plane-departure"></i>
                          <span>From</span>
                        </div>
                        <div className="city-display">
                          <div className="city-code">{fromCity.code}</div>
                          <div className="city-name">{fromCity.name}</div>
                        </div>
                      </div>

                      <button className="swap-btn" onClick={swapCities}>
                        <i className="fas fa-right-left"></i>
                      </button>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-plane-arrival"></i>
                          <span>To</span>
                        </div>
                        <div className="city-display">
                          <div className="city-code">{toCity.code}</div>
                          <div className="city-name">{toCity.name}</div>
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar"></i>
                          <span>Departure</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input 
                            type="date" 
                            value={departDate}
                            onChange={(e) => setDepartDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {tripType === 'roundTrip' && (
                        <div className="form-field">
                          <div className="field-label">
                            <i className="fas fa-calendar"></i>
                            <span>Return</span>
                          </div>
                          <div className="field-input-wrapper date-wrapper">
                            <input 
                              type="date" 
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-user-group"></i>
                          <span>Travellers</span>
                        </div>
                        <div className="field-input-wrapper select-wrapper">
                          <select>
                            <option>1 Adult, Economy</option>
                            <option>2 Adults, Economy</option>
                            <option>1 Adult, Business</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        className="search-btn-new"
                        onClick={() => navigate('/tour', { state: { searchTerm: holidaySearch.destination } })}
                      >
                        <i className="fas fa-search"></i>
                        <span>Search Flights</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Trains Form */}
                {activeTab === 'trains' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="form-grid trains-grid">
                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-train-subway"></i>
                          <span>From Station</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input type="text" placeholder="Enter departure station..." />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-train"></i>
                          <span>To Station</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input type="text" placeholder="Enter arrival station..." />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-days"></i>
                          <span>Travel Date</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input type="date" />
                        </div>
                      </div>

                      <button className="search-btn-new">
                        <i className="fas fa-search"></i>
                        <span>Find Trains</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cabs Form */}
                {activeTab === 'cabs' && (
                  <div className="form-content" data-aos="fade-up" data-aos-duration="400">
                    <div className="form-grid cabs-grid">
                      <div className="form-field location-field-new">
                        <div className="field-label">
                          <i className="fas fa-location-dot"></i>
                          <span>Pickup Location</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input type="text" placeholder="Enter pickup address..." />
                        </div>
                      </div>

                      <div className="form-field location-field-new">
                        <div className="field-label">
                          <i className="fas fa-flag-checkered"></i>
                          <span>Drop Location</span>
                        </div>
                        <div className="field-input-wrapper">
                          <input type="text" placeholder="Enter drop address..." />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label">
                          <i className="fas fa-calendar-check"></i>
                          <span>Pickup Date</span>
                        </div>
                        <div className="field-input-wrapper date-wrapper">
                          <input type="date" />
                        </div>
                      </div>

                      <button className="search-btn-new">
                        <i className="fas fa-search"></i>
                        <span>Find Cabs</span>
                        <div className="btn-shine"></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hero-quick-stats">
              <div className="quick-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Vehicles</span>
              </div>
              <div className="stat-divider"></div>
              <div className="quick-stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Destinations</span>
              </div>
              <div className="stat-divider"></div>
              <div className="quick-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Deals Section with Travel Fleet Priority */}
      <section className="deals-hub-section" data-aos="fade-up" data-aos-duration="800" data-aos-offset="150">
        <div className="deals-hub-bg">
          <div className="deals-gradient-orb orb-1"></div>
          <div className="deals-gradient-orb orb-2"></div>
          <div className="deals-gradient-orb orb-3"></div>
          <div className="deals-floating-icons">
            <i className="fas fa-car floating-icon icon-1"></i>
            <i className="fas fa-plane floating-icon icon-2"></i>
            <i className="fas fa-hotel floating-icon icon-3"></i>
            <i className="fas fa-umbrella-beach floating-icon icon-4"></i>
          </div>
        </div>
        <div className="container">
          <div className="deals-hub-header">
            <div className="deals-hub-title">
              <div className="deals-hub-badge-wrapper">
                <span className="deals-hub-badge">
                  <span className="badge-glow"></span>
                  <i className="fas fa-fire-flame-curved"></i>
                  Exclusive Offers
                </span>
                <span className="deals-live-indicator">
                  <span className="live-dot"></span>
                  LIVE
                </span>
              </div>
              <h2>Book Smarter, <span>Travel Better</span></h2>
              <p className="deals-subtitle">
                <i className="fas fa-route"></i>
                From vehicles to vacations - find the perfect deal for your journey
              </p>
              <div className="deals-stats-mini">
                <div className="stat-pill">
                  <i className="fas fa-tags"></i>
                  <span>50+ Deals</span>
                </div>
                <div className="stat-pill">
                  <i className="fas fa-percent"></i>
                  <span>Up to 30% Off</span>
                </div>
                <div className="stat-pill">
                  <i className="fas fa-clock"></i>
                  <span>Limited Time</span>
                </div>
              </div>
            </div>
            
            {/* Location Picker for Travel Fleet */}
            {activeDealsTab === 'fleet' && (
              <div className="deals-location-picker" ref={dealsLocationPickerRef}>
                <div className="location-picker-card">
                  <div className="location-picker-header">
                    <div className="location-icon-wrapper">
                      <i className="fas fa-location-dot"></i>
                      <span className="location-pulse"></span>
                    </div>
                    <div className="location-label-text">
                      <span className="label-small">Showing offers in</span>
                      <span className="label-city">{dealsLocation || 'All Cities'}</span>
                    </div>
                  </div>
                  <div className="location-picker-controls">
                    <div className="location-picker-input-wrapper">
                      <i className="fas fa-search input-icon"></i>
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={dealsLocation}
                        onChange={(e) => handleDealsLocationChange(e.target.value)}
                        onFocus={() => setShowDealsLocationPicker(true)}
                        className="location-picker-input"
                      />
                      <button 
                        className="detect-location-btn"
                        onClick={detectDealsLocation}
                        disabled={isDetectingDealsLocation}
                        title="Use current location"
                      >
                        {isDetectingDealsLocation ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-location-crosshairs"></i>
                        )}
                      </button>
                      
                      {showDealsLocationPicker && (
                        <div className="location-picker-dropdown">
                          <div className="dropdown-header">
                            <i className="fas fa-map-pin"></i>
                            <span>Popular Cities</span>
                          </div>
                          <div className="dropdown-locations">
                            {filteredDealsLocations.map((loc, index) => (
                              <button
                                key={index}
                                className="location-option"
                                onClick={() => selectDealsLocation(loc)}
                              >
                                <i className="fas fa-city"></i>
                                {loc}
                              </button>
                            ))}
                            {filteredDealsLocations.length === 0 && (
                              <div className="no-locations">No matching cities found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {dealsLocation && (
                      <button 
                        className="clear-location-btn"
                        onClick={() => setDealsLocation('')}
                        title="Show all locations"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="deals-hub-tabs-wrapper">
            <div className="deals-hub-tabs">
              <button 
                className={`hub-tab ${activeDealsTab === 'fleet' ? 'active' : ''}`} 
                onClick={() => setActiveDealsTab('fleet')}
              >
                <div className="tab-icon-circle">
                  <i className="fas fa-car-side"></i>
                </div>
                <div className="tab-info">
                  <span className="tab-name">Travel Fleet</span>
                  <span className="tab-desc">Cars, Buses & More</span>
                </div>
                <div className="tab-arrow"><i className="fas fa-chevron-right"></i></div>
              </button>
              <button 
                className={`hub-tab ${activeDealsTab === 'hotels' ? 'active' : ''}`} 
                onClick={() => setActiveDealsTab('hotels')}
              >
                <div className="tab-icon-circle">
                  <i className="fas fa-hotel"></i>
                </div>
                <div className="tab-info">
                  <span className="tab-name">Hotels</span>
                  <span className="tab-desc">Premium Stays</span>
                </div>
                <div className="tab-arrow"><i className="fas fa-chevron-right"></i></div>
              </button>
              <button 
                className={`hub-tab ${activeDealsTab === 'holidays' ? 'active' : ''}`} 
                onClick={() => setActiveDealsTab('holidays')}
              >
                <div className="tab-icon-circle">
                  <i className="fas fa-umbrella-beach"></i>
                </div>
                <div className="tab-info">
                  <span className="tab-name">Holidays</span>
                  <span className="tab-desc">Tour Packages</span>
                </div>
                <div className="tab-arrow"><i className="fas fa-chevron-right"></i></div>
              </button>
              <button 
                className={`hub-tab ${activeDealsTab === 'flights' ? 'active' : ''}`} 
                onClick={() => setActiveDealsTab('flights')}
              >
                <div className="tab-icon-circle">
                  <i className="fas fa-plane"></i>
                </div>
                <div className="tab-info">
                  <span className="tab-name">Flights</span>
                  <span className="tab-desc">Domestic & International</span>
                </div>
                <div className="tab-arrow"><i className="fas fa-chevron-right"></i></div>
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          <div className="hub-tab-content active">
            <div className="fleet-offers-grid">
              {getCurrentOffers().slice(0, 4).map((offer, index) => (
                <div 
                  key={`${offer.type}-${offer.id}`} 
                  className={`fleet-offer-card ${offer.type}-offer`} 
                  data-aos="fade-up" 
                  data-aos-delay={index * 100}
                >
                  <div className="offer-image-wrapper">
                    <img src={offer.image} alt={offer.title} className="offer-image" />
                    <div className="offer-image-overlay"></div>
                    <div className="offer-icon-badge">
                      <i className={getOfferIcon(offer.type)}></i>
                    </div>
                    <div className="offer-discount-tag">{offer.discount}</div>
                  </div>
                  <div className="offer-content">
                    {/* Show operator info for fleet offers */}
                    {activeDealsTab === 'fleet' && offer.operator && (
                      <div className="offer-operator-info">
                        <div className="operator-badge">
                          <i className="fas fa-building"></i>
                          <span className="operator-name">{offer.operator}</span>
                        </div>
                        <div className="operator-rating">
                          <i className="fas fa-star"></i>
                          <span>{offer.operatorRating}</span>
                        </div>
                      </div>
                    )}
                    <h3>{offer.title}</h3>
                    <p>{offer.description}</p>
                    <div className="offer-highlights">
                      {offer.highlights.map((highlight, idx) => (
                        <span key={idx}><i className="fas fa-check-circle"></i> {highlight}</span>
                      ))}
                    </div>
                    {/* Show service locations for fleet offers */}
                    {activeDealsTab === 'fleet' && offer.locations && (
                      <div className="offer-service-locations">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{offer.locations.slice(0, 3).join(', ')}{offer.locations.length > 3 ? ` +${offer.locations.length - 3} more` : ''}</span>
                      </div>
                    )}
                    <div className="offer-pricing">
                      <div className="price-info">
                        <span className="old-price">{offer.oldPrice}</span>
                        <span className="new-price">{offer.newPrice}<small>{offer.unit}</small></span>
                      </div>
                      <Link to={getOfferLink(offer)} className="book-offer-btn">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {getCurrentOffers().length > 4 && (
              <div className="view-more-offers">
                <Link 
                  to={`/offers?tab=${activeDealsTab}${dealsLocation ? `&location=${encodeURIComponent(dealsLocation)}` : ''}`} 
                  className="view-more-btn"
                >
                  <span>View All {getCurrentOffers().length} Offers</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
                <p className="view-more-hint">
                  {activeDealsTab === 'fleet' && dealsLocation 
                    ? `Showing 4 of ${getCurrentOffers().length} offers in ${dealsLocation}`
                    : `Showing 4 of ${getCurrentOffers().length} ${activeDealsTab} offers`
                  }
                </p>
              </div>
            )}

            <div className="fleet-promo-banner">
              <div className="promo-content">
                <div className="promo-icon"><i className="fas fa-gift"></i></div>
                <div className="promo-text">
                  {activeDealsTab === 'fleet' && (
                    <>
                      <h4>First Ride Bonus!</h4>
                      <p>Use code <strong>FIRSTRIDE</strong> to get extra ₹200 off on your first vehicle booking</p>
                    </>
                  )}
                  {activeDealsTab === 'hotels' && (
                    <>
                      <h4>Stay More, Save More!</h4>
                      <p>Use code <strong>STAYBIG</strong> to get extra 15% off on 3+ night stays</p>
                    </>
                  )}
                  {activeDealsTab === 'holidays' && (
                    <>
                      <h4>Group Travel Bonus!</h4>
                      <p>Use code <strong>GROUPFUN</strong> to get ₹2000 off on bookings for 4+ travelers</p>
                    </>
                  )}
                  {activeDealsTab === 'flights' && (
                    <>
                      <h4>Fly Smart, Save Big!</h4>
                      <p>Use code <strong>FLYNOW</strong> to get flat ₹500 off on domestic flights</p>
                    </>
                  )}
                </div>
              </div>
              <Link to="/offers" className="promo-cta">Claim Offer <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="deals-hub-footer">
            <div className="hub-stats">
              <div className="hub-stat">
                <span className="stat-value">{activeDealsTab === 'fleet' ? '500+' : activeDealsTab === 'hotels' ? '200+' : activeDealsTab === 'holidays' ? '100+' : '50+'}</span>
                <span className="stat-name">{activeDealsTab === 'fleet' ? 'Vehicles' : activeDealsTab === 'hotels' ? 'Hotels' : activeDealsTab === 'holidays' ? 'Packages' : 'Routes'}</span>
              </div>
              <div className="hub-stat">
                <span className="stat-value">50+</span>
                <span className="stat-name">Cities</span>
              </div>
              <div className="hub-stat">
                <span className="stat-value">10K+</span>
                <span className="stat-name">Happy Customers</span>
              </div>
              <div className="hub-stat">
                <span className="stat-value">4.8★</span>
                <span className="stat-name">Rating</span>
              </div>
            </div>
            <Link to="/offers" className="view-all-deals">
              View All Offers <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Hotels Section - Premium Design */}
      <section className="hotels-premium" data-aos="fade-up" data-aos-duration="800" data-aos-offset="150">
        <div className="hotels-premium-bg">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="container">
          <div className="hotels-premium-header">
            <div className="header-left">
              <div className="section-label">
                <span className="label-line"></span>
                <span className="label-text">Curated Collection</span>
              </div>
              <h2>Where Comfort<br/><span>Meets Elegance</span></h2>
            </div>
            <div className="header-right">
              <p>Discover handpicked accommodations that redefine luxury travel experiences across India</p>
              <Link to="/hotels" className="explore-hotels-btn">
                Explore All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="hotels-premium-grid">
            {recommendedHotels.map((hotel, index) => (
              <div key={hotel.id} className={`hotel-premium-card ${index === 0 ? 'featured' : ''}`} data-aos="fade-up" data-aos-delay={index * 80}>
                <div className="card-image-container">
                  <img src={hotel.image} alt={hotel.name} />
                  <div className="card-gradient"></div>
                  <div className="card-top-actions">
                    <div className="star-badge">
                      <i className="fas fa-star"></i>
                      <span>{hotel.rating}.0</span>
                    </div>
                    <button className="save-btn"><i className="far fa-bookmark"></i></button>
                  </div>
                  <div className="card-location-pill">
                    <i className="fas fa-location-dot"></i>
                    <span>{hotel.city}</span>
                  </div>
                </div>
                <div className="card-details">
                  <h3>{hotel.name}</h3>
                  <div className="card-amenities">
                    <span><i className="fas fa-wifi"></i></span>
                    <span><i className="fas fa-utensils"></i></span>
                    <span><i className="fas fa-spa"></i></span>
                    <span><i className="fas fa-swimmer"></i></span>
                  </div>
                  <div className="card-footer">
                    <div className="price-block">
                      <span className="price-from">Starting from</span>
                      <div className="price-main">
                        <span className="currency">₹</span>
                        <span className="amount">{hotel.price.toLocaleString()}</span>
                        <span className="duration">/night</span>
                      </div>
                    </div>
                    <Link to="/hotels" className="reserve-btn">
                      Reserve
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section - Redesigned */}
      <section className="app-section-new" data-aos="fade-up" data-aos-duration="800" data-aos-offset="150">
        <div className="container">
          <div className="app-content-wrap">
            <div className="app-info-side">
              <span className="app-badge"><i className="fas fa-mobile-alt"></i> Mobile App</span>
              <h2>Travel Smarter with Our App</h2>
              <p>Get exclusive deals, instant bookings, and 24/7 support right at your fingertips.</p>
              
              <div className="app-features-list">
                <div className="app-feature">
                  <div className="feature-icon"><i className="fas fa-tag"></i></div>
                  <div>
                    <h4>Exclusive App Deals</h4>
                    <p>Save up to 20% more on app bookings</p>
                  </div>
                </div>
                <div className="app-feature">
                  <div className="feature-icon"><i className="fas fa-bolt"></i></div>
                  <div>
                    <h4>Instant Booking</h4>
                    <p>Book flights, hotels & more in seconds</p>
                  </div>
                </div>
                <div className="app-feature">
                  <div className="feature-icon"><i className="fas fa-bell"></i></div>
                  <div>
                    <h4>Real-time Updates</h4>
                    <p>Price alerts & trip notifications</p>
                  </div>
                </div>
              </div>

              <div className="app-download-wrap">
                <a href="#" className="store-btn google">
                  <i className="fab fa-google-play"></i>
                  <div>
                    <span>GET IT ON</span>
                    <strong>Google Play</strong>
                  </div>
                </a>
                <a href="#" className="store-btn apple">
                  <i className="fab fa-apple"></i>
                  <div>
                    <span>Download on the</span>
                    <strong>App Store</strong>
                  </div>
                </a>
              </div>
            </div>

            <div className="app-visual-side">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="mockup-header">
                    <i className="fas fa-plane"></i>
                    <span>Travel Axis</span>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-search">
                      <span>Where to?</span>
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="mockup-deals">
                      <div className="deal-mini">
                        <span className="deal-tag">-40%</span>
                        <span>Dubai</span>
                      </div>
                      <div className="deal-mini">
                        <span className="deal-tag">-30%</span>
                        <span>Bali</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="qr-float">
                  <i className="fas fa-qrcode"></i>
                  <span>Scan to Download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Redesigned */}
      <section className="why-axis-section" data-aos="fade-up" data-aos-duration="800" data-aos-offset="150">
        <div className="container">
          <div className="why-axis-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Experience Travel Like Never Before</h2>
            <p className="section-subtitle">Trusted by thousands of travelers worldwide for seamless booking experiences</p>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="bento-grid">
            {/* Large Featured Card */}
            <div className="bento-card bento-large" data-aos="fade-up">
              <div className="bento-icon-wrap gradient-blue">
                <i className="fas fa-search"></i>
              </div>
              <div className="bento-content">
                <h3>Best Deals & Offers</h3>
                <p>Search for exclusive deals on flights and hotels. Find unbeatable prices to any destination you love.</p>
              </div>
              <div className="bento-visual">
                <div className="floating-tag tag-1">-40% OFF</div>
                <div className="floating-tag tag-2">Flash Sale</div>
                <div className="floating-tag tag-3">Best Price</div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bento-card bento-stats" data-aos="fade-up" data-aos-delay="100">
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Happy Travelers</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Destinations</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">99%</span>
                  <span className="stat-label">Satisfaction</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bento-card bento-medium" data-aos="fade-up" data-aos-delay="150">
              <div className="bento-icon-wrap gradient-green">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure & Protected</h3>
              <p>Book with complete confidence knowing your transactions are secure and protected.</p>
              <div className="security-badges">
                <span><i className="fas fa-lock"></i> SSL</span>
                <span><i className="fas fa-check-circle"></i> Verified</span>
              </div>
            </div>

            {/* Holiday Card */}
            <div className="bento-card bento-medium" data-aos="fade-up" data-aos-delay="200">
              <div className="bento-icon-wrap gradient-orange">
                <i className="fas fa-sun"></i>
              </div>
              <h3>Perfect Holidays</h3>
              <p>From budget-friendly to luxury experiences that match your style perfectly.</p>
              <div className="holiday-tags">
                <span>Beach</span>
                <span>Adventure</span>
                <span>Luxury</span>
              </div>
            </div>

            {/* Deals Card */}
            <div className="bento-card bento-wide" data-aos="fade-up" data-aos-delay="250">
              <div className="deals-content">
                <div className="bento-icon-wrap gradient-red">
                  <i className="fas fa-gift"></i>
                </div>
                <div className="deals-text">
                  <h3>Seasonal Deals</h3>
                  <p>Enjoy new deals every season with special discounts on flights, hotels, and packages.</p>
                </div>
              </div>
              <div className="deals-cta">
                <span className="deal-badge">New Year Special</span>
                <button className="explore-btn">Explore Deals <i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Winter Travel Fest Banner - Redesigned */}
      <section className="promo-banner-new" data-aos="zoom-in" data-aos-duration="600">
        <div className="container">
          <div className="promo-card">
            <div className="promo-glow"></div>
            <div className="promo-content">
              <div className="promo-icon"><i className="fas fa-snowflake"></i></div>
              <div className="promo-text">
                <h3>Winter Travel Fest</h3>
                <p>Unbeatable deals on snow destinations</p>
              </div>
              <span className="live-indicator"><span className="pulse"></span> LIVE NOW</span>
            </div>
            <Link to="/tour" className="promo-arrow"><i className="fas fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>

      {/* Flight Notice Section - Redesigned */}
      <section className="notices-section-new" data-aos="fade-up" data-aos-duration="700">
        <div className="container">
          <div className="notices-grid">
            <div className="notice-card-new">
              <div className="notice-icon-wrap warning">
                <i className="fas fa-plane-slash"></i>
              </div>
              <div className="notice-info">
                <h4>Check Indigo Flights Cancellations</h4>
                <p>Stay updated with the latest flight status</p>
              </div>
              <Link to="/flights" className="notice-link"><i className="fas fa-chevron-right"></i></Link>
            </div>
            <div className="notice-card-new">
              <div className="notice-icon-wrap success">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <div className="notice-info">
                <h4>Claim Refund for Cancelled Flights</h4>
                <p>Quick and hassle-free refund process</p>
              </div>
              <Link to="/contact" className="notice-link"><i className="fas fa-chevron-right"></i></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Redesigned */}
      <section className="products-section-new" data-aos="fade-up" data-aos-duration="700" data-aos-offset="100">
        <div className="container">
          <h2 className="products-title">Explore Travel Axis</h2>
          <div className="products-grid-new">
            <div className="product-column">
              <h4><i className="fas fa-plane"></i> Flights</h4>
              <ul>
                <li><Link to="/flights">International Airlines</Link></li>
                <li><Link to="/flights">Domestic Airlines</Link></li>
                <li><Link to="/flights">Last Minute Deals</Link></li>
              </ul>
            </div>
            <div className="product-column">
              <h4><i className="fas fa-hotel"></i> Hotels & Stays</h4>
              <ul>
                <li><Link to="/hotels">Premium Hotels</Link></li>
                <li><Link to="/hotels">Budget Stays</Link></li>
                <li><Link to="/hotels">Villas & Resorts</Link></li>
              </ul>
            </div>
            <div className="product-column">
              <h4><i className="fas fa-umbrella-beach"></i> Holidays</h4>
              <ul>
                <li><Link to="/tour">International Packages</Link></li>
                <li><Link to="/tour">India Packages</Link></li>
                <li><Link to="/tour">Weekend Getaways</Link></li>
              </ul>
            </div>
            <div className="product-column">
              <h4><i className="fas fa-car"></i> Transport</h4>
              <ul>
                <li><Link to="/fleet-results">Outstation Cabs</Link></li>
                <li><Link to="/tour">Bus Booking</Link></li>
                <li><Link to="/tour">Train Tickets</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer - Redesigned */}
      <footer className="footer-new" data-aos="fade-up">
        <div className="footer-top">
          <div className="container">
            <div className="footer-grid">
              {/* Brand Column */}
              <div className="footer-brand">
                <div className="brand-logo">
                  <i className="fas fa-globe-americas"></i>
                  <div>
                    <h3>Travel Axis</h3>
                    <span>Plan • Book • Explore</span>
                  </div>
                </div>
                <p className="brand-desc">Your trusted partner for seamless travel experiences across the globe.</p>
                <div className="social-links-new">
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#"><i className="fab fa-youtube"></i></a>
                </div>
              </div>

              {/* Links Columns */}
              <div className="footer-links-column">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/blog">Careers</Link>
                <Link to="/blog">Press Room</Link>
              </div>

              <div className="footer-links-column">
                <h4>Partners</h4>
                <Link to="/contact">Become a Partner</Link>
                <Link to="/service">Affiliate Program</Link>
                <Link to="/contact">Advertise</Link>
                <Link to="/service">Corporate Travel</Link>
              </div>

              <div className="footer-links-column">
                <h4>Support</h4>
                <Link to="/contact">Help Center</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/contact">Cancellations</Link>
                <Link to="/contact">Terms & Conditions</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-new">
          <div className="container">
            <div className="footer-bottom-content">
              <p>&copy; 2026 Travel Axis Online Limited, India. All rights reserved.</p>
              <div className="footer-legal">
                <Link to="/contact">Privacy Policy</Link>
                <span>|</span>
                <Link to="/contact">Terms of Use</Link>
                <span>|</span>
                <Link to="/contact">Disclaimer</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
