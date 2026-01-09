import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import '../styles/tours.css';

export default function Tours() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);
  
  const [filters, setFilters] = useState({
    priceRange: '',
    duration: '',
    category: '',
    location: '',
    searchTerm: location.state && location.state.searchTerm ? location.state.searchTerm : ''
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('list');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');
  const dropdownRef = useRef(null);

  // Default locations list
  const popularLocations = [
    { id: 'india', name: 'India', icon: '🇮🇳', destinations: ['Leh', 'Kerala', 'Rajasthan', 'Goa', 'Kashmir'] },
    { id: 'dubai', name: 'Dubai', icon: '🇦🇪', destinations: ['Dubai', 'Abu Dhabi'] },
    { id: 'thailand', name: 'Thailand', icon: '🇹🇭', destinations: ['Thailand', 'Phuket', 'Bangkok'] },
    { id: 'bali', name: 'Bali', icon: '🇮🇩', destinations: ['Bali', 'Ubud'] },
    { id: 'maldives', name: 'Maldives', icon: '🇲🇻', destinations: ['Maldives', 'Male'] },
    { id: 'europe', name: 'Europe', icon: '🇪🇺', destinations: ['Greece', 'Italy', 'Switzerland', 'France'] },
    { id: 'singapore', name: 'Singapore', icon: '🇸🇬', destinations: ['Singapore', 'Malaysia'] },
    { id: 'japan', name: 'Japan', icon: '🇯🇵', destinations: ['Japan', 'Tokyo', 'Kyoto'] }
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

  // Filter locations based on search
  const filteredLocations = popularLocations.filter(loc => 
    loc.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    loc.destinations.some(d => d.toLowerCase().includes(destinationSearch.toLowerCase()))
  );

  const handleDestinationSelect = (loc) => {
    setFilters({...filters, location: loc.id, searchTerm: ''});
    setDestinationSearch(loc.icon + ' ' + loc.name);
    setShowDestinationDropdown(false);
  };

  const handleDestinationInputChange = (e) => {
    const value = e.target.value;
    setDestinationSearch(value);
    setFilters({...filters, location: '', searchTerm: value});
    setShowDestinationDropdown(true);
  };

  const clearDestination = () => {
    setDestinationSearch('');
    setFilters({...filters, location: '', searchTerm: ''});
  };

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
    { 
      id: 13, 
      name: 'Goa Beach Carnival', 
      price: 15000, 
      originalPrice: 18000,
      duration: '4 Days 3 Nights', 
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 
      rating: 4.5,
      reviews: 567,
      location: 'Goa',
      category: 'Beach & Party',
      highlights: ['Baga Beach', 'Calangute', 'Old Goa Churches', 'Dudhsagar Falls'],
      included: ['Beach Resort', 'Breakfast', 'Sightseeing', 'Water Sports'],
      destinations: ['Goa', 'Baga Beach', 'Calangute', 'Anjuna', 'Panjim', 'Old Goa'],
      operatorName: 'Goa Holiday Makers',
      verified: true,
      eCash: 450,
      discount: 17
    },
    { 
      id: 14, 
      name: 'Kashmir Paradise Valley', 
      price: 28000, 
      originalPrice: 35000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800', 
      rating: 4.9,
      reviews: 412,
      location: 'Kashmir',
      category: 'Nature & Romance',
      highlights: ['Dal Lake', 'Gulmarg', 'Pahalgam', 'Shikara Ride'],
      included: ['Houseboat Stay', 'Hotels', 'All Meals', 'Sightseeing'],
      destinations: ['Kashmir', 'Srinagar', 'Dal Lake', 'Gulmarg', 'Pahalgam', 'Sonmarg'],
      operatorName: 'Kashmir Valley Tours',
      verified: true,
      eCash: 840,
      discount: 20
    },
    { 
      id: 15, 
      name: 'Paris Romantic Getaway', 
      price: 125000, 
      originalPrice: 145000,
      duration: '7 Days 6 Nights', 
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 
      rating: 4.9,
      reviews: 234,
      location: 'France',
      category: 'Luxury & Romance',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Versailles'],
      included: ['Luxury Hotels', 'Breakfast', 'City Tours', 'Museum Passes'],
      destinations: ['France', 'Paris', 'Versailles', 'Loire Valley', 'Nice'],
      operatorName: 'Euro Dreams Travel',
      verified: true,
      eCash: 3750,
      discount: 14
    },
    { 
      id: 16, 
      name: 'Bangkok Pattaya Fun', 
      price: 28000, 
      originalPrice: 34000,
      duration: '5 Days 4 Nights', 
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', 
      rating: 4.4,
      reviews: 678,
      location: 'Thailand',
      category: 'City & Entertainment',
      highlights: ['Grand Palace', 'Pattaya Beach', 'Coral Island', 'Alcazar Show'],
      included: ['Hotels', 'Breakfast', 'Transfers', 'City Tours'],
      destinations: ['Thailand', 'Bangkok', 'Pattaya', 'Coral Island', 'Floating Market'],
      operatorName: 'Thai Fun Holidays',
      verified: true,
      eCash: 840,
      discount: 18
    },
    { 
      id: 17, 
      name: 'Dubai Abu Dhabi Combo', 
      price: 55000, 
      originalPrice: 65000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800', 
      rating: 4.8,
      reviews: 445,
      location: 'Dubai & Abu Dhabi',
      category: 'Luxury & Adventure',
      highlights: ['Dubai Marina', 'Ferrari World', 'Sheikh Zayed Mosque', 'Desert Camp'],
      included: ['5-Star Hotels', 'Breakfast', 'Desert Safari', 'Theme Parks'],
      destinations: ['Dubai', 'Abu Dhabi', 'Dubai Marina', 'Ferrari World', 'Yas Island'],
      operatorName: 'UAE Premium Tours',
      verified: true,
      eCash: 1650,
      discount: 15
    },
    { 
      id: 18, 
      name: 'Bali Adventure Explorer', 
      price: 48000, 
      originalPrice: 56000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800', 
      rating: 4.7,
      reviews: 321,
      location: 'Bali',
      category: 'Nature & Adventure',
      highlights: ['Mount Batur Sunrise', 'White Water Rafting', 'Monkey Forest', 'Waterfalls'],
      included: ['Resort Stay', 'Breakfast', 'Adventure Activities', 'Transfers'],
      destinations: ['Bali', 'Ubud', 'Mount Batur', 'Tegallalang', 'Kintamani'],
      operatorName: 'Bali Adventure Co',
      verified: true,
      eCash: 1440,
      discount: 14
    },
    { 
      id: 19, 
      name: 'Maldives Family Paradise', 
      price: 95000, 
      originalPrice: 115000,
      duration: '5 Days 4 Nights', 
      image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800', 
      rating: 4.8,
      reviews: 189,
      location: 'Maldives',
      category: 'Beach & Family',
      highlights: ['Beach Villa', 'Snorkeling', 'Dolphin Watching', 'Kids Club'],
      included: ['Beach Resort', 'All-Inclusive', 'Water Sports', 'Kids Activities'],
      destinations: ['Maldives', 'Male', 'Hulhumale', 'Sun Island', 'Paradise Island'],
      operatorName: 'Maldives Family Holidays',
      verified: true,
      eCash: 2850,
      discount: 17
    },
    { 
      id: 20, 
      name: 'Tokyo Osaka Express', 
      price: 145000, 
      originalPrice: 165000,
      duration: '8 Days 7 Nights', 
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 
      rating: 4.9,
      reviews: 298,
      location: 'Japan',
      category: 'Culture & City',
      highlights: ['Tokyo Skytree', 'Osaka Castle', 'Shibuya Crossing', 'Dotonbori'],
      included: ['Hotels', 'JR Pass', 'Guided Tours', 'Airport Transfers'],
      destinations: ['Japan', 'Tokyo', 'Osaka', 'Nara', 'Shibuya', 'Akihabara'],
      operatorName: 'Japan Explorer Tours',
      verified: true,
      eCash: 4350,
      discount: 12
    },
    { 
      id: 21, 
      name: 'Singapore City Break', 
      price: 38000, 
      originalPrice: 45000,
      duration: '4 Days 3 Nights', 
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800', 
      rating: 4.6,
      reviews: 534,
      location: 'Singapore',
      category: 'City & Entertainment',
      highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Universal Studios', 'Sentosa'],
      included: ['Hotels', 'Breakfast', 'Theme Park Tickets', 'City Tour'],
      destinations: ['Singapore', 'Marina Bay', 'Sentosa', 'Orchard Road', 'Chinatown'],
      operatorName: 'Singapore City Tours',
      verified: true,
      eCash: 1140,
      discount: 16
    },
    { 
      id: 22, 
      name: 'Kerala Munnar Thekkady', 
      price: 22000, 
      originalPrice: 26000,
      duration: '5 Days 4 Nights', 
      image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800', 
      rating: 4.7,
      reviews: 387,
      location: 'Kerala',
      category: 'Nature & Wildlife',
      highlights: ['Tea Plantations', 'Periyar Wildlife', 'Spice Garden', 'Elephant Safari'],
      included: ['Resort Stay', 'All Meals', 'Safari', 'Transfers'],
      destinations: ['Kerala', 'Munnar', 'Thekkady', 'Periyar', 'Alleppey'],
      operatorName: 'Kerala Nature Tours',
      verified: true,
      eCash: 660,
      discount: 15
    },
    { 
      id: 23, 
      name: 'Rajasthan Desert Safari', 
      price: 32000, 
      originalPrice: 38000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', 
      rating: 4.6,
      reviews: 276,
      location: 'Rajasthan',
      category: 'Culture & Adventure',
      highlights: ['Jaisalmer Fort', 'Sam Sand Dunes', 'Camel Safari', 'Desert Camp'],
      included: ['Heritage Hotels', 'All Meals', 'Camel Safari', 'Cultural Show'],
      destinations: ['Rajasthan', 'Jaisalmer', 'Jodhpur', 'Sam Sand Dunes', 'Thar Desert'],
      operatorName: 'Royal Rajasthan Tours',
      verified: true,
      eCash: 960,
      discount: 16
    },
    { 
      id: 24, 
      name: 'Greece Santorini Special', 
      price: 89000, 
      originalPrice: 102000,
      duration: '6 Days 5 Nights', 
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', 
      rating: 5.0,
      reviews: 198,
      location: 'Greece',
      category: 'Luxury & Romance',
      highlights: ['Santorini Sunset', 'Oia Village', 'Wine Tasting', 'Caldera Cruise'],
      included: ['Cave Hotels', 'Breakfast', 'Wine Tour', 'Sunset Cruise'],
      destinations: ['Greece', 'Santorini', 'Oia', 'Fira', 'Caldera'],
      operatorName: 'Greek Island Dreams',
      verified: true,
      eCash: 2670,
      discount: 13
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
    
    // Location filter - check if tour location matches selected location destinations
    const matchesLocation = !filters.location || (() => {
      const selectedLoc = popularLocations.find(loc => loc.id === filters.location);
      if (!selectedLoc) return true;
      return selectedLoc.destinations.some(dest => 
        tour.location.toLowerCase().includes(dest.toLowerCase()) ||
        tour.destinations?.some(d => d.toLowerCase().includes(dest.toLowerCase()))
      );
    })();
    
    // Search term filter - matches name, location, highlights, or destinations
    const matchesSearch = !filters.searchTerm || 
      tour.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      tour.highlights.some(h => h.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      tour.destinations?.some(d => d.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    return matchesPrice && matchesDuration && matchesCategory && matchesLocation && matchesSearch;
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
    <div className="tours-page-new">
      {/* Hero Section */}
      <section className="tours-hero">
        <div className="container">
          <div className="tours-hero-content" data-aos="fade-up">
            <span className="tours-hero-badge">Explore the World</span>
            <h1>Discover Amazing Tour Packages</h1>
            <p className="tours-hero-subtitle">
              Handpicked destinations, verified operators, and unforgettable experiences
            </p>
          </div>

          {/* Search Bar */}
          <div className="tours-search-bar" data-aos="fade-up" data-aos-delay="100">
            <div className="search-wrapper" ref={dropdownRef}>
              <i className="fas fa-map-marker-alt"></i>
              <input
                type="text"
                placeholder="Search destination..."
                value={destinationSearch}
                onChange={handleDestinationInputChange}
                onFocus={() => setShowDestinationDropdown(true)}
                className="destination-input"
              />
              {destinationSearch && (
                <button className="clear-search-btn" onClick={clearDestination}>
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className="fas fa-chevron-down dropdown-arrow"></i>
              
              {/* Destination Dropdown */}
              {showDestinationDropdown && (
                <div className="destination-dropdown">
                  <div className="dropdown-header">
                    <i className="fas fa-globe"></i>
                    <span>Popular Destinations</span>
                  </div>
                  <div className="dropdown-list">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map(loc => (
                        <div 
                          key={loc.id} 
                          className={`dropdown-item ${filters.location === loc.id ? 'active' : ''}`}
                          onClick={() => handleDestinationSelect(loc)}
                        >
                          <span className="item-icon">{loc.icon}</span>
                          <div className="item-content">
                            <span className="item-name">{loc.name}</span>
                            <span className="item-places">{loc.destinations.slice(0, 3).join(', ')}</span>
                          </div>
                          {filters.location === loc.id && <i className="fas fa-check"></i>}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        <i className="fas fa-search"></i>
                        <span>No destinations found. Searching for "{destinationSearch}"</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="filter-chips">
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="filter-select"
              >
                <option value="">All Prices</option>
                <option value="low">Under ₹40,000</option>
                <option value="medium">₹40K - ₹1 Lakh</option>
                <option value="high">₹1 Lakh+</option>
              </select>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({...filters, duration: e.target.value})}
                className="filter-select"
              >
                <option value="">All Durations</option>
                <option value="short">4-6 Days</option>
                <option value="medium">7-8 Days</option>
                <option value="long">10+ Days</option>
              </select>
              {(filters.priceRange || filters.duration || filters.category || filters.location || filters.searchTerm) && (
                <button 
                  className="clear-btn"
                  onClick={() => setFilters({ priceRange: '', duration: '', category: '', location: '', searchTerm: '' })}
                >
                  <i className="fas fa-times"></i> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="quick-categories">
        <div className="container">
          <div className="categories-scroll" data-aos="fade-up">
            {[
              { icon: 'fa-umbrella-beach', name: 'Beach', value: 'Beach' },
              { icon: 'fa-mountain', name: 'Nature', value: 'Nature' },
              { icon: 'fa-landmark', name: 'Culture', value: 'Culture' },
              { icon: 'fa-gem', name: 'Luxury', value: 'Luxury' },
              { icon: 'fa-spa', name: 'Wellness', value: 'Wellness' },
              { icon: 'fa-city', name: 'City', value: 'City' }
            ].map((cat, index) => (
              <button
                key={index}
                className={`category-chip ${filters.category === cat.value ? 'active' : ''}`}
                onClick={() => setFilters({...filters, category: filters.category === cat.value ? '' : cat.value})}
              >
                <i className={`fas ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="tours-results">
        <div className="container">
          {/* Results Header */}
          <div className="results-header" data-aos="fade-up">
            <div className="results-info">
              <h2>{sortedTours.length} Tour Package{sortedTours.length !== 1 ? 's' : ''} Found</h2>
              <p>Best prices guaranteed • Verified operators • 24/7 support</p>
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
                <option value="duration">Longest First</option>
              </select>
            </div>
          </div>

          {/* Tours Grid/List */}
          <div className={`tours-grid ${viewMode}`}>
            {sortedTours.map((tour, index) => (
              <div 
                key={tour.id} 
                className="tour-card-new"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="tour-card-image">
                  <img src={tour.image} alt={tour.name} />
                  <div className="tour-card-badges">
                    {tour.discount && (
                      <span className="discount-badge">{tour.discount}% OFF</span>
                    )}
                    {tour.verified && (
                      <span className="verified-badge">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    )}
                  </div>
                  <button className="wishlist-btn">
                    <i className="far fa-heart"></i>
                  </button>
                  <div className="tour-card-overlay">
                    <Link to={`/tour-details/${tour.id}`} className="quick-view-btn">
                      Quick View
                    </Link>
                  </div>
                </div>
                
                <div className="tour-card-content">
                  <div className="tour-card-meta">
                    <span className="tour-location">
                      <i className="fas fa-map-marker-alt"></i> {tour.location}
                    </span>
                    <span className="tour-rating">
                      <i className="fas fa-star"></i> {tour.rating}
                      <span className="reviews">({tour.reviews})</span>
                    </span>
                  </div>
                  
                  <div className="tour-operator-info">
                    <span className="operator-name">
                      <i className="fas fa-building"></i> {tour.operatorName}
                    </span>
                    {tour.verified && (
                      <span className="verified-partner">
                        <i className="fas fa-check-circle"></i> Verified Partner
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/tour-details/${tour.id}`} className="tour-card-title">
                    {tour.name}
                  </Link>
                  
                  <div className="tour-card-duration">
                    <i className="far fa-clock"></i> {tour.duration}
                  </div>
                  
                  <div className="tour-card-highlights">
                    {tour.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="highlight-tag">{h}</span>
                    ))}
                    {tour.highlights.length > 3 && (
                      <span className="highlight-more">+{tour.highlights.length - 3}</span>
                    )}
                  </div>
                  
                  <div className="tour-card-inclusions">
                    {tour.included.slice(0, 4).map((item, i) => (
                      <span key={i} className="inclusion-icon" title={item}>
                        <i className={`fas fa-${getInclusionIcon(item)}`}></i>
                      </span>
                    ))}
                  </div>
                  
                  <div className="tour-card-footer">
                    <div className="tour-price">
                      <span className="original-price">₹{tour.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="current-price">₹{tour.price.toLocaleString('en-IN')}</span>
                      <span className="per-person">per person</span>
                    </div>
                    <Link to={`/tour-details/${tour.id}`} className="book-now-btn">
                      View Details
                    </Link>
                  </div>
                  
                  {tour.eCash && (
                    <div className="ecash-badge">
                      <i className="fas fa-coins"></i> Earn ₹{tour.eCash} eCash
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sortedTours.length === 0 && (
            <div className="no-results-new" data-aos="fade-up">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Tours Found</h3>
              <p>Try adjusting your filters or search for something else</p>
              <button 
                className="reset-btn"
                onClick={() => setFilters({ priceRange: '', duration: '', category: '', searchTerm: '' })}
              >
                <i className="fas fa-redo"></i> Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="tours-why-choose">
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
              <h4>Verified Operators</h4>
              <p>All partners are thoroughly vetted</p>
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
              <h4>Easy Cancellation</h4>
              <p>Flexible policies for peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="tours-cta-section">
        <div className="container">
          <div className="tours-cta-box" data-aos="fade-up">
            <div className="cta-content">
              <h3>Can't Find What You're Looking For?</h3>
              <p>Let our travel experts create a customized tour package just for you</p>
              <div className="cta-buttons">
                <Link to="/contact" className="cta-btn primary">
                  <i className="fas fa-envelope"></i> Request Custom Tour
                </Link>
                <a href="tel:+919035461093" className="cta-btn secondary">
                  <i className="fas fa-phone-alt"></i> Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
