import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';

export default function Destination() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);

  const destinations = [
    { 
      id: 1, 
      name: 'Maldives', 
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 
      listings: 30, 
      type: 'Beach', 
      duration: '7 Days', 
      category: 'Cruises',
      description: 'Pristine beaches, crystal clear waters, and luxury overwater villas',
      attractions: ['Male City', 'Hulhumale', 'Local Islands'],
      bestTime: 'November to April',
      startingPrice: 2800
    },
    { 
      id: 2, 
      name: 'Thailand', 
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', 
      listings: 22, 
      type: 'Adventure', 
      duration: '5 Days', 
      category: 'Hiking',
      description: 'Vibrant culture, exotic beaches, and amazing street food',
      attractions: ['Bangkok', 'Phuket', 'Chiang Mai'],
      bestTime: 'November to February',
      startingPrice: 850
    },
    { 
      id: 3, 
      name: 'Belgium', 
      image: 'https://images.unsplash.com/photo-1559113202-c916b8e44373?w=800', 
      listings: 25, 
      type: 'Culture', 
      duration: '4 Days', 
      category: 'Walking',
      description: 'Medieval towns, chocolate, beer, and stunning architecture',
      attractions: ['Brussels', 'Bruges', 'Ghent'],
      bestTime: 'April to October',
      startingPrice: 1100
    },
    { 
      id: 4, 
      name: 'Iceland', 
      image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800', 
      listings: 28, 
      type: 'Nature', 
      duration: '6 Days', 
      category: 'Wildlife',
      description: 'Northern lights, geysers, and breathtaking landscapes',
      attractions: ['Reykjavik', 'Golden Circle', 'Blue Lagoon'],
      bestTime: 'June to September',
      startingPrice: 1900
    },
    { 
      id: 5, 
      name: 'Japan', 
      image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800', 
      listings: 35, 
      type: 'Culture', 
      duration: '8 Days', 
      category: 'Walking',
      description: 'Ancient temples, modern cities, and cherry blossoms',
      attractions: ['Tokyo', 'Kyoto', 'Osaka'],
      bestTime: 'March to May',
      startingPrice: 2200
    },
    { 
      id: 6, 
      name: 'Switzerland', 
      image: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800', 
      listings: 20, 
      type: 'Adventure', 
      duration: '7 Days', 
      category: 'Hiking',
      description: 'Majestic Alps, scenic trains, and chocolate',
      attractions: ['Zurich', 'Interlaken', 'Lucerne'],
      bestTime: 'June to September',
      startingPrice: 1800
    },
    { 
      id: 7, 
      name: 'Greece', 
      image: 'https://images.unsplash.com/photo-1503152394-c571994fd383?w=800', 
      listings: 32, 
      type: 'Beach', 
      duration: '5 Days', 
      category: 'Cruises',
      description: 'Ancient history, stunning islands, and Mediterranean cuisine',
      attractions: ['Athens', 'Santorini', 'Mykonos'],
      bestTime: 'April to October',
      startingPrice: 980
    },
    { 
      id: 8, 
      name: 'Italy', 
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800', 
      listings: 28, 
      type: 'Culture', 
      duration: '6 Days', 
      category: 'Walking',
      description: 'Art, history, incredible food, and romantic cities',
      attractions: ['Rome', 'Venice', 'Florence'],
      bestTime: 'April to June',
      startingPrice: 1200
    },
    { 
      id: 9, 
      name: 'Bali', 
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 
      listings: 40, 
      type: 'Beach', 
      duration: '7 Days', 
      category: 'Cruises',
      description: 'Spiritual temples, rice terraces, and beach clubs',
      attractions: ['Ubud', 'Seminyak', 'Uluwatu'],
      bestTime: 'April to October',
      startingPrice: 1050
    },
    { 
      id: 10, 
      name: 'Dubai', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 
      listings: 45, 
      type: 'Adventure', 
      duration: '5 Days', 
      category: 'Walking',
      description: 'Luxury shopping, modern architecture, and desert safaris',
      attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
      bestTime: 'November to March',
      startingPrice: 1500
    },
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesType = !selectedType || dest.type === selectedType;
    const matchesDuration = !selectedDuration || dest.duration === selectedDuration;
    const matchesCategory = !selectedCategory || dest.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesDuration && matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundImage: 'linear-gradient(135deg, rgba(26, 168, 203, 0.9), rgba(10, 155, 168, 0.95)), url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '60px 20px',
          maxWidth: '800px'
        }}>
          <h1 style={{ fontSize: '3rem', color: '#fff', fontWeight: '800', marginBottom: '15px' }}>
            Discover Amazing Destinations
          </h1>
          <p style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.95 }}>
            Explore our handpicked destinations around the world
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section style={{ padding: '40px 20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #e1e4e5' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                Search Destinations
              </label>
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="">All Types</option>
                <option value="Beach">Beach</option>
                <option value="Adventure">Adventure</option>
                <option value="Culture">Culture</option>
                <option value="Nature">Nature</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="">All Durations</option>
                <option value="4 Days">4 Days</option>
                <option value="5 Days">5 Days</option>
                <option value="6 Days">6 Days</option>
                <option value="7 Days">7 Days</option>
                <option value="8 Days">8 Days</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="">All Categories</option>
                <option value="Cruises">Cruises</option>
                <option value="Hiking">Hiking</option>
                <option value="Airbirds">Airbirds</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Walking">Walking</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p style={{ color: '#666', fontWeight: '600', fontSize: '0.95rem' }}>
            Showing {filteredDestinations.length} of {destinations.length} destinations
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section style={{ padding: '60px 20px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {filteredDestinations.map((dest) => (
              <div key={dest.id}
                   data-aos="fade-up"
                   style={{
                     backgroundColor: '#fff',
                     borderRadius: '16px',
                     overflow: 'hidden',
                     boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                     transition: 'all 0.3s ease',
                     border: '1px solid #e1e4e5'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
                     e.currentTarget.style.transform = 'translateY(-8px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
                  <img src={dest.image} alt={dest.name} style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    color: '#0A9BA8'
                  }}>
                    ${dest.startingPrice}+
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', color: '#113D48', marginBottom: '12px', fontWeight: '800' }}>
                    {dest.name}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {dest.description}
                  </p>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '700', marginBottom: '8px' }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: '6px', color: '#0A9BA8' }}></i>
                      Best Time: {dest.bestTime}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', marginBottom: '8px' }}>
                      <i className="fa-solid fa-list" style={{ marginRight: '6px', color: '#0A9BA8' }}></i>
                      {dest.listings} Tour Packages Available
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    {dest.attractions.slice(0, 3).map((attr, idx) => (
                      <span key={idx} style={{
                        backgroundColor: '#E9F6F9',
                        color: '#0A9BA8',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        {attr}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #e1e4e5' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#E9F6F9',
                      color: '#0A9BA8',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}>
                      <i className="fa-solid fa-tag"></i>
                      {dest.type}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#f0f0f0',
                      color: '#113D48',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}>
                      <i className="fa-solid fa-calendar"></i>
                      {dest.duration}
                    </span>
                  </div>
                  <Link to={`/tour?destination=${dest.name}`}
                     style={{
                       display: 'block',
                       marginTop: '15px',
                       textAlign: 'center',
                       background: 'linear-gradient(135deg, #1CA8CB 0%, #0A9BA8 100%)',
                       color: '#fff',
                       padding: '12px',
                       borderRadius: '10px',
                       fontWeight: '800',
                       fontSize: '0.95rem',
                       textDecoration: 'none',
                       transition: 'transform 0.2s ease'
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    View All Tours →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
