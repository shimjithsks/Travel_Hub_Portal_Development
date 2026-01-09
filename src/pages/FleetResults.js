import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/fleetResults.css';

export default function FleetResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const initialSearchParams = location.state || {};

  // Offer code from URL
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [showOfferBanner, setShowOfferBanner] = useState(false);

  // Offer details mapping
  const offerDetails = {
    'CAR20': { type: 'car', discount: '20%', title: 'Car Rentals - 20% OFF' },
    'BUS15': { type: 'bus', discount: '15%', title: 'Bus Booking - 15% OFF' },
    'TEMPO25': { type: 'tempo', discount: '25%', title: 'Tempo Traveller - 25% OFF' },
    'AIRPORT100': { type: 'airport', discount: '₹100', title: 'Airport Transfer - ₹100 OFF' }
  };

  // Check for offer code in URL on mount
  useEffect(() => {
    const offerCode = urlSearchParams.get('code');
    const offerType = urlSearchParams.get('offer');
    
    if (offerCode && offerDetails[offerCode]) {
      setAppliedOffer({
        code: offerCode,
        type: offerType,
        ...offerDetails[offerCode]
      });
      setShowOfferBanner(true);
    }
  }, [urlSearchParams]);

  // Editable search parameters
  const [searchParams, setSearchParams] = useState({
    location: initialSearchParams.location || '',
    vehicleCategory: initialSearchParams.vehicleCategory || '',
    date: initialSearchParams.date || '',
    dropoffDate: initialSearchParams.dropoffDate || ''
  });

  // Location suggestions
  const popularLocations = [
    'Kozhikkode', 'Kochi', 'Thiruvananthapuram', 'Bengaluru', 'Mumbai',
    'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Goa', 'Jaipur', 'Udaipur',
    'Agra', 'Mysuru', 'Coimbatore', 'Madurai', 'Wayanad', 'Munnar', 'Ooty', 'Manali'
  ];
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(popularLocations);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Handle location input change
  const handleLocationChange = (value) => {
    setSearchParams({...searchParams, location: value});
    
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
    setSearchParams({...searchParams, location});
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
        
        try {
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
            let placeName = data.address.town || data.address.village || 
                           data.address.suburb || data.address.neighbourhood || 
                           data.address.city || data.address.state_district;
            
            if (placeName && data.address.city && placeName !== data.address.city) {
              placeName = `${placeName}, ${data.address.city}`;
            }
            
            setSearchParams({...searchParams, location: placeName});
          }
        } catch (error) {
          console.error('Geocoding Error:', error);
          alert('Could not determine location name. Please enter manually.');
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        alert('Unable to retrieve your location.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Filters state
  const [filters, setFilters] = useState({
    seatingCapacity: '',
    acType: '',
    priceRange: '',
    transmission: '',
    driverIncluded: true,
    amenities: [],
    busFeatures: []
  });

  const [sortBy, setSortBy] = useState('recommended');

  // Collapsible filter sections
  const [expandedFilters, setExpandedFilters] = useState({
    busFeatures: false,
    amenities: false
  });

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle search update
  const handleSearchUpdate = () => {
    // The filtering will happen automatically through the existing filter logic
  };

  // Vehicle data with location-based attributes
  const [vehicles] = useState([
    // Cars
    {
      id: 1,
      vehicleId: 'V101',
      name: 'Toyota Innova Crysta',
      category: 'car',
      operatorId: 'OP11',
      operatorName: 'Kerala Tours',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 60,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      seatingCapacity: 7,
      acType: 'AC',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 3500,
      pricePerKm: 15,
      driverIncluded: true,
      features: ['GPS', 'Music System', 'Push Back Seats'],
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      vehicleId: 'V108',
      name: 'Honda City',
      category: 'car',
      operatorId: 'OP16',
      operatorName: 'Elite Cars',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 50,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'AC',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      pricePerDay: 3200,
      pricePerKm: 14,
      driverIncluded: true,
      features: ['GPS', 'Sunroof', 'Premium Interior'],
      rating: 4.6,
      reviews: 134
    },
    {
      id: 3,
      vehicleId: 'V109',
      name: 'Hyundai Creta',
      category: 'car',
      operatorId: 'OP17',
      operatorName: 'Coastal Cabs',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 55,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 2900,
      pricePerKm: 13,
      driverIncluded: true,
      features: ['GPS', 'Bluetooth', 'Rear Camera'],
      rating: 4.4,
      reviews: 98
    },
    
    // Cabs
    {
      id: 4,
      vehicleId: 'V106',
      name: 'Maruti Ertiga',
      category: 'cab',
      operatorId: 'OP15',
      operatorName: 'City Cabs',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 40,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
      seatingCapacity: 7,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Petrol',
      pricePerDay: 2800,
      pricePerKm: 12,
      driverIncluded: true,
      features: ['GPS', 'Music System', 'Clean Interior'],
      rating: 4.3,
      reviews: 156
    },
    {
      id: 5,
      vehicleId: 'V110',
      name: 'Swift Dzire',
      category: 'cab',
      operatorId: 'OP18',
      operatorName: 'Quick Ride',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 45,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'AC',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      pricePerDay: 2500,
      pricePerKm: 11,
      driverIncluded: true,
      features: ['GPS', 'AC', 'Sanitized'],
      rating: 4.2,
      reviews: 203
    },
    {
      id: 6,
      vehicleId: 'V111',
      name: 'Toyota Etios',
      category: 'cab',
      operatorId: 'OP19',
      operatorName: 'Safe Journey Cabs',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 50,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 2600,
      pricePerKm: 11,
      driverIncluded: true,
      features: ['GPS', 'Music', 'First Aid'],
      rating: 4.4,
      reviews: 187
    },
    
    // Tempo Travellers
    {
      id: 7,
      vehicleId: 'V102',
      name: 'Force Urbania',
      category: 'tempo-traveller',
      operatorId: 'OP12',
      operatorName: 'Malabar Travels',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 80,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
      seatingCapacity: 17,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 7500,
      pricePerKm: 22,
      driverIncluded: true,
      features: ['Push Back Seats', 'Music System', 'Luggage Carrier'],
      rating: 4.7,
      reviews: 95
    },
    {
      id: 8,
      vehicleId: 'V112',
      name: 'Tempo Traveller 12 Seater',
      category: 'tempo-traveller',
      operatorId: 'OP20',
      operatorName: 'Group Travel Solutions',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 75,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      seatingCapacity: 12,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 6500,
      pricePerKm: 20,
      driverIncluded: true,
      features: ['Comfortable Seats', 'AC', 'Music System'],
      rating: 4.5,
      reviews: 112
    },
    {
      id: 9,
      vehicleId: 'V113',
      name: 'Tempo Traveller 17 Seater Luxury',
      category: 'tempo-traveller',
      operatorId: 'OP21',
      operatorName: 'Premium Tours Kerala',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 90,
      image: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=400&h=300&fit=crop',
      seatingCapacity: 17,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 8500,
      pricePerKm: 24,
      driverIncluded: true,
      features: ['Reclining Seats', 'LED TV', 'Refrigerator', 'USB Charging'],
      rating: 4.8,
      reviews: 76
    },
    
    // Vans/Urvan
    {
      id: 10,
      vehicleId: 'V104',
      name: 'Toyota Hiace',
      category: 'van',
      operatorId: 'OP11',
      operatorName: 'Kerala Tours',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 60,
      image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=300&fit=crop',
      seatingCapacity: 12,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 6000,
      pricePerKm: 18,
      driverIncluded: true,
      features: ['Spacious', 'Luggage Space', 'USB Charging'],
      rating: 4.4,
      reviews: 112
    },
    {
      id: 11,
      vehicleId: 'V114',
      name: 'Nissan Urvan',
      category: 'van',
      operatorId: 'OP22',
      operatorName: 'Travel Comfort',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 65,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
      seatingCapacity: 14,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 6500,
      pricePerKm: 19,
      driverIncluded: true,
      features: ['AC', 'Music System', 'Large Luggage Space'],
      rating: 4.5,
      reviews: 94
    },
    {
      id: 12,
      vehicleId: 'V115',
      name: 'Mercedes Sprinter',
      category: 'van',
      operatorId: 'OP23',
      operatorName: 'Luxury Vans Kerala',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 70,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400&h=300&fit=crop',
      seatingCapacity: 15,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 9500,
      pricePerKm: 26,
      driverIncluded: true,
      features: ['Leather Seats', 'WiFi', 'Entertainment System', 'Premium Interior'],
      rating: 4.8,
      reviews: 68
    },
    
    // Mini Buses
    {
      id: 13,
      vehicleId: 'V107',
      name: 'Tata Winger',
      category: 'mini-bus',
      operatorId: 'OP12',
      operatorName: 'Malabar Travels',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 70,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      seatingCapacity: 26,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 9500,
      pricePerKm: 25,
      driverIncluded: true,
      features: ['Comfortable Seats', 'Luggage Space', 'First Aid'],
      rating: 4.5,
      reviews: 89
    },
    {
      id: 14,
      vehicleId: 'V116',
      name: 'Ashok Leyland 32 Seater',
      category: 'mini-bus',
      operatorId: 'OP24',
      operatorName: 'Express Tours',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 85,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop',
      seatingCapacity: 32,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 11000,
      pricePerKm: 28,
      driverIncluded: true,
      features: ['Pushback Seats', 'Music System', 'Emergency Exit'],
      rating: 4.6,
      reviews: 102
    },
    {
      id: 15,
      vehicleId: 'V117',
      name: 'Force Traveller 26 Seater',
      category: 'mini-bus',
      operatorId: 'OP25',
      operatorName: 'Safe Travel Bus',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 80,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      seatingCapacity: 26,
      acType: 'AC',
      transmission: 'Manual',
      fuelType: 'Diesel',
      pricePerDay: 9800,
      pricePerKm: 26,
      driverIncluded: true,
      features: ['AC', 'Music', 'Comfortable Seats', 'GPS'],
      rating: 4.4,
      reviews: 91
    },
    
    // Tour Buses
    {
      id: 16,
      vehicleId: 'V105',
      name: 'Volvo Multi-Axle Bus',
      category: 'tour-bus',
      operatorId: 'OP14',
      operatorName: 'Grand Tours',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 100,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop',
      seatingCapacity: 45,
      acType: 'AC',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 18000,
      pricePerKm: 40,
      driverIncluded: true,
      features: ['Reclining Seats', 'Entertainment System', 'Restroom', 'WiFi'],
      rating: 4.6,
      reviews: 78
    },
    {
      id: 17,
      vehicleId: 'V118',
      name: 'Mercedes Luxury Coach',
      category: 'tour-bus',
      operatorId: 'OP26',
      operatorName: 'Platinum Tours',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 120,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      seatingCapacity: 40,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 22000,
      pricePerKm: 45,
      driverIncluded: true,
      features: ['Luxury Seats', 'LED TV', 'Restroom', 'Pantry', 'WiFi', 'Reading Lights'],
      rating: 4.9,
      reviews: 54
    },
    {
      id: 18,
      vehicleId: 'V119',
      name: 'Scania Sleeper Coach',
      category: 'tour-bus',
      operatorId: 'OP27',
      operatorName: 'Royal Travels',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 150,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop',
      seatingCapacity: 40,
      acType: 'AC',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 20000,
      pricePerKm: 42,
      driverIncluded: true,
      features: ['Sleeper Berths', 'Entertainment', 'Charging Points', 'Emergency Exit'],
      rating: 4.7,
      reviews: 63
    },
    
    // Luxury Vehicles
    {
      id: 19,
      vehicleId: 'V103',
      name: 'Mercedes-Benz E-Class',
      category: 'luxury',
      operatorId: 'OP13',
      operatorName: 'Premium Rides',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 50,
      image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400&h=300&fit=crop',
      seatingCapacity: 4,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      pricePerDay: 15000,
      pricePerKm: 35,
      driverIncluded: true,
      features: ['Leather Seats', 'Premium Sound', 'WiFi', 'Chauffeur'],
      rating: 4.9,
      reviews: 67
    },
    {
      id: 20,
      vehicleId: 'V120',
      name: 'BMW 7 Series',
      category: 'luxury',
      operatorId: 'OP28',
      operatorName: 'Elite Luxury Cars',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 60,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      pricePerDay: 18000,
      pricePerKm: 38,
      driverIncluded: true,
      features: ['Massage Seats', 'Premium Audio', 'Sunroof', 'Ambient Lighting', 'Chauffeur'],
      rating: 4.9,
      reviews: 45
    },
    {
      id: 21,
      vehicleId: 'V121',
      name: 'Audi A6',
      category: 'luxury',
      operatorId: 'OP29',
      operatorName: 'Prestige Rides',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 55,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      seatingCapacity: 5,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 16000,
      pricePerKm: 36,
      driverIncluded: true,
      features: ['Leather Interior', 'Advanced Safety', 'Premium Sound', 'Panoramic Sunroof'],
      rating: 4.8,
      reviews: 52
    },
    {
      id: 22,
      vehicleId: 'V122',
      name: 'Toyota Fortuner',
      category: 'luxury',
      operatorId: 'OP30',
      operatorName: 'Luxury SUV Rentals',
      baseCity: 'Kozhikkode',
      lat: 11.2588,
      lng: 75.7804,
      serviceRadiusKm: 70,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
      seatingCapacity: 7,
      acType: 'Climate Control',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 12000,
      pricePerKm: 30,
      driverIncluded: true,
      features: ['4WD', 'Leather Seats', 'Sunroof', 'Premium Audio', 'GPS Navigation'],
      rating: 4.7,
      reviews: 88
    }
  ]);

  // Filter vehicles based on search params and filters
  const getFilteredVehicles = () => {
    let filtered = vehicles;

    // Filter by category (mandatory from search)
    if (searchParams.vehicleCategory) {
      filtered = filtered.filter(v => v.category === searchParams.vehicleCategory);
    }

    // Filter by location (basic check - in production use actual geolocation)
    if (searchParams.location) {
      filtered = filtered.filter(v => 
        v.baseCity.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.seatingCapacity) {
      const capacity = parseInt(filters.seatingCapacity);
      filtered = filtered.filter(v => v.seatingCapacity >= capacity);
    }

    if (filters.acType && filters.acType !== 'all') {
      filtered = filtered.filter(v => 
        v.acType.toLowerCase().includes(filters.acType.toLowerCase())
      );
    }

    if (filters.transmission && filters.transmission !== 'all') {
      filtered = filtered.filter(v => v.transmission === filters.transmission);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(v => v.pricePerDay >= min && v.pricePerDay <= max);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'capacity') {
      filtered.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
    }

    return filtered;
  };

  const filteredVehicles = getFilteredVehicles();

  return (
    <div className={`fleet-results-page ${showOfferBanner && appliedOffer ? 'has-offer-banner' : ''}`}>
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
      {/* Header Section */}
      <section className="fleet-header">
        <div className="container">
          <h1>Available Vehicles in {searchParams.location || 'Your Area'}</h1>
          
          <div className="search-edit-form">
            <div className="edit-form-fields">
                <div className="field-group location-field">
                  <label>Pickup Location</label>
                  <div className="location-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Enter location"
                      value={searchParams.location}
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
                          <>
                            <div className="suggestion-item" style={{ pointerEvents: 'none' }}>
                              <i className="fas fa-map-marker-alt"></i>
                              <span>Select Pickup Location</span>
                            </div>
                            {filteredLocations.map((location, index) => (
                              <div 
                                key={index}
                                className="suggestion-item"
                                onMouseDown={() => selectLocation(location)}
                              >
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{location}</span>
                              </div>
                            ))}
                          </>
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
                  <label>Vehicle Category</label>
                  <select 
                    value={searchParams.vehicleCategory}
                    onChange={(e) => setSearchParams({...searchParams, vehicleCategory: e.target.value})}
                  >
                    <option value="">All Categories</option>
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
                  <label>Pickup Date</label>
                  <input 
                    type="date" 
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  />
                </div>

                <div className="field-group">
                  <label>Return Date</label>
                  <input 
                    type="date" 
                    value={searchParams.dropoffDate}
                    onChange={(e) => setSearchParams({...searchParams, dropoffDate: e.target.value})}
                    min={searchParams.date}
                  />
                </div>

                <div className="edit-form-actions">
                  <button 
                    className="search-update-btn"
                    onClick={handleSearchUpdate}
                    title="Search Vehicles"
                  >
                    <i className="fas fa-search"></i>
                    Search
                  </button>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Filters & Vehicle Listings */}
      <section className="vehicle-listings">
        <div className="container">
          {/* Promotional Banner */}
          <div className="promo-banner">
            <div className="promo-content">
              <i className="fas fa-star-christmas"></i>
              <span><strong>Special Offer:</strong> Get up to 20% OFF on bookings above ₹10,000. Use code: <strong>TRAVEL20</strong></span>
            </div>
            <button className="promo-cta">View Offers</button>
          </div>

          <div className="listings-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              <h3>Filter Options</h3>
              
              <div className="filter-group">
                <label>Seating Capacity</label>
                <select 
                  value={filters.seatingCapacity}
                  onChange={(e) => setFilters({...filters, seatingCapacity: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="5">5+ Seats</option>
                  <option value="7">7+ Seats</option>
                  <option value="12">12+ Seats</option>
                  <option value="17">17+ Seats</option>
                  <option value="26">26+ Seats</option>
                  <option value="40">40+ Seats</option>
                </select>
              </div>

              <div className="filter-group">
                <label>AC Type</label>
                <select 
                  value={filters.acType}
                  onChange={(e) => setFilters({...filters, acType: e.target.value})}
                >
                  <option value="">All</option>
                  <option value="ac">AC</option>
                  <option value="non-ac">Non-AC</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Transmission</label>
                <select 
                  value={filters.transmission}
                  onChange={(e) => setFilters({...filters, transmission: e.target.value})}
                >
                  <option value="">All</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range (Per Day)</label>
                <select 
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="">All Prices</option>
                  <option value="0-3000">Under ₹3,000</option>
                  <option value="3000-6000">₹3,000 - ₹6,000</option>
                  <option value="6000-10000">₹6,000 - ₹10,000</option>
                  <option value="10000-20000">₹10,000 - ₹20,000</option>
                  <option value="20000-100000">Above ₹20,000</option>
                </select>
              </div>

              <div className="filter-group">
                <label 
                  className="filter-section-title collapsible"
                  onClick={() => toggleFilterSection('busFeatures')}
                >
                  <i className="fas fa-star"></i> 
                  <span>Bus Features</span>
                  <i className={`fas fa-chevron-${expandedFilters.busFeatures ? 'up' : 'down'} toggle-icon`}></i>
                </label>
                {expandedFilters.busFeatures && (
                  <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.busFeatures.includes('liveTracking')}
                      onChange={(e) => {
                        const newFeatures = e.target.checked 
                          ? [...filters.busFeatures, 'liveTracking']
                          : filters.busFeatures.filter(f => f !== 'liveTracking');
                        setFilters({...filters, busFeatures: newFeatures});
                      }}
                    />
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Live Tracking</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.busFeatures.includes('highRated')}
                      onChange={(e) => {
                        const newFeatures = e.target.checked 
                          ? [...filters.busFeatures, 'highRated']
                          : filters.busFeatures.filter(f => f !== 'highRated');
                        setFilters({...filters, busFeatures: newFeatures});
                      }}
                    />
                    <i className="fas fa-bus"></i>
                    <span>High Rated Buses</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.busFeatures.includes('deals')}
                      onChange={(e) => {
                        const newFeatures = e.target.checked 
                          ? [...filters.busFeatures, 'deals']
                          : filters.busFeatures.filter(f => f !== 'deals');
                        setFilters({...filters, busFeatures: newFeatures});
                      }}
                    />
                    <i className="fas fa-tag"></i>
                    <span>Deals</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.busFeatures.includes('primoBus')}
                      onChange={(e) => {
                        const newFeatures = e.target.checked 
                          ? [...filters.busFeatures, 'primoBus']
                          : filters.busFeatures.filter(f => f !== 'primoBus');
                        setFilters({...filters, busFeatures: newFeatures});
                      }}
                    />
                    <i className="fas fa-star"></i>
                    <span>Primo Bus</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.busFeatures.includes('freeCancellation')}
                      onChange={(e) => {
                        const newFeatures = e.target.checked 
                          ? [...filters.busFeatures, 'freeCancellation']
                          : filters.busFeatures.filter(f => f !== 'freeCancellation');
                        setFilters({...filters, busFeatures: newFeatures});
                      }}
                    />
                    <i className="fas fa-shield-alt"></i>
                    <span>Free Cancellation</span>
                  </label>
                </div>
                )}
              </div>

              <div className="filter-group">
                <label 
                  className="filter-section-title collapsible"
                  onClick={() => toggleFilterSection('amenities')}
                >
                  <i className="fas fa-list"></i> 
                  <span>Amenities</span>
                  <i className={`fas fa-chevron-${expandedFilters.amenities ? 'up' : 'down'} toggle-icon`}></i>
                </label>
                {expandedFilters.amenities && (
                  <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.amenities.includes('waterBottle')}
                      onChange={(e) => {
                        const newAmenities = e.target.checked 
                          ? [...filters.amenities, 'waterBottle']
                          : filters.amenities.filter(a => a !== 'waterBottle');
                        setFilters({...filters, amenities: newAmenities});
                      }}
                    />
                    <i className="fas fa-bottle-water"></i>
                    <span>Water Bottle</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.amenities.includes('blankets')}
                      onChange={(e) => {
                        const newAmenities = e.target.checked 
                          ? [...filters.amenities, 'blankets']
                          : filters.amenities.filter(a => a !== 'blankets');
                        setFilters({...filters, amenities: newAmenities});
                      }}
                    />
                    <i className="fas fa-blanket"></i>
                    <span>Blankets</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.amenities.includes('chargingPoint')}
                      onChange={(e) => {
                        const newAmenities = e.target.checked 
                          ? [...filters.amenities, 'chargingPoint']
                          : filters.amenities.filter(a => a !== 'chargingPoint');
                        setFilters({...filters, amenities: newAmenities});
                      }}
                    />
                    <i className="fas fa-charging-station"></i>
                    <span>Charging Point</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.amenities.includes('toilet')}
                      onChange={(e) => {
                        const newAmenities = e.target.checked 
                          ? [...filters.amenities, 'toilet']
                          : filters.amenities.filter(a => a !== 'toilet');
                        setFilters({...filters, amenities: newAmenities});
                      }}
                    />
                    <i className="fas fa-restroom"></i>
                    <span>Toilet</span>
                  </label>
                  <label className="checkbox-item">
                    <input 
                      type="checkbox"
                      checked={filters.amenities.includes('bedSheet')}
                      onChange={(e) => {
                        const newAmenities = e.target.checked 
                          ? [...filters.amenities, 'bedSheet']
                          : filters.amenities.filter(a => a !== 'bedSheet');
                        setFilters({...filters, amenities: newAmenities});
                      }}
                    />
                    <i className="fas fa-bed"></i>
                    <span>Bed Sheet</span>
                  </label>
                </div>
                )}
              </div>

              <button 
                className="clear-filters-btn"
                onClick={() => setFilters({
                  seatingCapacity: '',
                  acType: '',
                  priceRange: '',
                  transmission: '',
                  driverIncluded: true,
                  amenities: [],
                  busFeatures: []
                })}
              >
                <i className="fas fa-redo"></i> Clear Filters
              </button>
            </aside>

            {/* Vehicle Results */}
            <div className="vehicles-main">
              <div className="results-header">
                <div className="results-title-section">
                  <h2>{filteredVehicles.length} Vehicle{filteredVehicles.length !== 1 ? 's' : ''} Available</h2>
                  <p className="results-subtitle">Best prices • Verified operators • Instant booking</p>
                </div>
                <div className="sort-controls">
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: High to Low</option>
                    <option value="capacity">Capacity: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="vehicles-list">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-image">
                      <img src={vehicle.image} alt={vehicle.name} />
                      <span className="vehicle-type-badge">{vehicle.category.replace('-', ' ')}</span>
                      {vehicle.rating >= 4.5 && (
                        <span className="top-rated-badge">
                          <i className="fas fa-award"></i> Top Rated
                        </span>
                      )}
                    </div>
                    
                    <div className="vehicle-details">
                      <div className="vehicle-header">
                        <div>
                          <h3>{vehicle.name}</h3>
                          <p className="operator-name">
                            <i className="fas fa-building"></i> {vehicle.operatorName}
                            <span className="verified-partner" style={{marginLeft: '12px', color: '#22c55e', fontWeight: 600}}>
                              <i className="fas fa-check-circle" style={{color: '#22c55e', marginRight: '4px'}}></i> Verified Partner
                            </span>
                          </p>
                        </div>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>{vehicle.rating}</span>
                          <small>({vehicle.reviews})</small>
                        </div>
                      </div>

                      <div className="vehicle-specs">
                        <div className="spec-item">
                          <i className="fas fa-users"></i>
                          <span>{vehicle.seatingCapacity} Seats</span>
                        </div>
                        <div className="spec-item">
                          <i className="fas fa-snowflake"></i>
                          <span>{vehicle.acType}</span>
                        </div>
                        <div className="spec-item">
                          <i className="fas fa-cog"></i>
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="spec-item">
                          <i className="fas fa-gas-pump"></i>
                          <span>{vehicle.fuelType}</span>
                        </div>
                        {vehicle.driverIncluded && (
                          <div className="spec-item highlight-spec">
                            <i className="fas fa-user-check"></i>
                            <span>Driver Included</span>
                          </div>
                        )}
                      </div>

                      <div className="vehicle-features">
                        {vehicle.features.slice(0, 4).map((feature, index) => (
                          <span key={index} className="feature-tag">
                            <i className="fas fa-check"></i> {feature}
                          </span>
                        ))}
                        {vehicle.features.length > 4 && (
                          <span className="feature-tag more-features">
                            +{vehicle.features.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="vehicle-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Based in {vehicle.baseCity} • Service radius: {vehicle.serviceRadiusKm}km</span>
                      </div>
                    </div>

                    <div className="vehicle-pricing">
                      <div className="price-info">
                        <div className="price-row">
                          <span className="price-label">Starting From</span>
                          <div className="price">₹{vehicle.pricePerDay.toLocaleString()}</div>
                          <span className="price-period">per day</span>
                        </div>
                        <div className="price-divider"></div>
                        <div className="price-row">
                          <span className="price-label">Per Kilometer</span>
                          <div className="price-small">₹{vehicle.pricePerKm}</div>
                        </div>
                      </div>
                      <button 
                        className="book-btn"
                        onClick={() => navigate('/complete-booking', { 
                          state: { 
                            vehicle,
                            searchParams,
                            appliedOffer 
                          } 
                        })}
                      >
                        <i className="fas fa-check-circle"></i> Book Now
                      </button>
                      <button 
                        className="details-btn"
                        onClick={() => navigate(`/vehicle-details/${vehicle.id}`, { 
                          state: { 
                            vehicle,
                            searchParams,
                            appliedOffer
                          } 
                        })}
                      >
                        View Details <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVehicles.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-car-side"></i>
                  <h3>No vehicles found</h3>
                  <p>Try adjusting your search filters or location</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <h2>Why Choose Our Fleet?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Insured Vehicles</h3>
              <p>All vehicles are fully insured for your safety</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-user-tie"></i>
              <h3>Professional Drivers</h3>
              <p>Experienced and verified drivers</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-clock"></i>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer assistance</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-tags"></i>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
