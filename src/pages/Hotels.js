import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hotels() {
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: '',
    amenities: '',
    searchTerm: ''
  });

  const hotels = [
    {
      id: 1,
      name: 'Grand Hyatt Bali',
      location: 'Bali, Indonesia',
      rating: 4.9,
      reviews: 2456,
      price: 250,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Beach Access'],
      type: 'Luxury',
      stars: 5
    },
    {
      id: 2,
      name: 'Santorini Sky Resort',
      location: 'Santorini, Greece',
      rating: 4.8,
      reviews: 1834,
      price: 320,
      image: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800',
      amenities: ['Infinity Pool', 'Caldera View', 'Breakfast'],
      type: 'Luxury',
      stars: 5
    },
    {
      id: 3,
      name: 'Tokyo City Hotel',
      location: 'Tokyo, Japan',
      rating: 4.6,
      reviews: 3201,
      price: 180,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      amenities: ['City View', 'Restaurant', 'Bar', 'Gym'],
      type: 'Business',
      stars: 4
    },
    {
      id: 4,
      name: 'Swiss Alps Chalet',
      location: 'Interlaken, Switzerland',
      rating: 4.9,
      reviews: 987,
      price: 280,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      amenities: ['Mountain View', 'Fireplace', 'Ski Access'],
      type: 'Resort',
      stars: 5
    },
    {
      id: 5,
      name: 'Dubai Marina Hotel',
      location: 'Dubai, UAE',
      rating: 4.7,
      reviews: 2876,
      price: 220,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      amenities: ['Marina View', 'Pool', 'Spa', 'Restaurant'],
      type: 'Luxury',
      stars: 5
    },
    {
      id: 6,
      name: 'Phuket Beach Resort',
      location: 'Phuket, Thailand',
      rating: 4.5,
      reviews: 1543,
      price: 150,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      amenities: ['Beach Front', 'Pool', 'Restaurant', 'Spa'],
      type: 'Resort',
      stars: 4
    }
  ];

  const filteredHotels = hotels.filter(hotel => {
    const matchesPrice = !filters.priceRange ||
      (filters.priceRange === 'budget' && hotel.price < 150) ||
      (filters.priceRange === 'moderate' && hotel.price >= 150 && hotel.price < 250) ||
      (filters.priceRange === 'luxury' && hotel.price >= 250);

    const matchesRating = !filters.rating || hotel.rating >= parseFloat(filters.rating);

    const matchesSearch = !filters.searchTerm ||
      hotel.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return matchesPrice && matchesRating && matchesSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundImage: 'linear-gradient(135deg, rgba(26, 168, 203, 0.9), rgba(10, 155, 168, 0.95)), url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px' }}>
          Find Your Perfect Stay
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
          Choose from thousands of hotels worldwide
        </p>
      </section>

      {/* Search & Filters */}
      <section style={{ padding: '40px 20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #e1e4e5' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <input
              type="text"
              placeholder="Search hotels or locations..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              style={{
                padding: '12px 16px',
                border: '1.5px solid #ddd',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            />
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              style={{
                padding: '12px 16px',
                border: '1.5px solid #ddd',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="">All Prices</option>
              <option value="budget">Budget (Under $150)</option>
              <option value="moderate">Moderate ($150-$250)</option>
              <option value="luxury">Luxury ($250+)</option>
            </select>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              style={{
                padding: '12px 16px',
                border: '1.5px solid #ddd',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
          <p style={{ color: '#666', fontWeight: '600', fontSize: '0.95rem' }}>
            Showing {filteredHotels.length} of {hotels.length} hotels
          </p>
        </div>
      </section>

      {/* Hotels Grid */}
      <section style={{ padding: '60px 20px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {filteredHotels.map(hotel => (
              <div key={hotel.id} style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                border: '1px solid #e1e4e5'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                }}>
                <div style={{
                  height: '250px',
                  backgroundImage: `url(${hotel.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    color: '#0A9BA8'
                  }}>
                    {'⭐'.repeat(hotel.stars)}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color: '#113D48',
                    marginBottom: '8px'
                  }}>
                    {hotel.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    <i className="fa-solid fa-location-dot" style={{ color: '#0A9BA8', fontSize: '0.9rem' }}></i>
                    <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: '600' }}>{hotel.location}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      backgroundColor: '#E9F6F9',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      color: '#0A9BA8'
                    }}>
                      {hotel.rating} ★
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      ({hotel.reviews} reviews)
                    </span>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', marginBottom: '8px' }}>
                      Amenities:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {hotel.amenities.map((amenity, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#E9F6F9',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#0A9BA8'
                        }}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid #e1e4e5'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>
                        Starting from
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0A9BA8' }}>
                        ${hotel.price}
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>/night</span>
                      </div>
                    </div>
                    <Link
                      to={`/hotel-detail/${hotel.id}`}
                      style={{
                        background: 'linear-gradient(135deg, #1CA8CB 0%, #0A9BA8 100%)',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <i className="fas fa-bed"></i>
                      Choose Room
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
