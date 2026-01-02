import React, { useState } from 'react';

export default function Flights() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });

  const [results] = useState([
    {
      id: 1,
      airline: 'Emirates',
      flightNo: 'EK524',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '10:30 AM',
      arrival: '08:45 PM',
      duration: '12h 15m',
      price: 850,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    },
    {
      id: 2,
      airline: 'Singapore Airlines',
      flightNo: 'SQ12',
      from: 'London (LHR)',
      to: 'Singapore (SIN)',
      departure: '11:00 PM',
      arrival: '06:30 PM+1',
      duration: '13h 30m',
      price: 920,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    },
    {
      id: 3,
      airline: 'Qatar Airways',
      flightNo: 'QR702',
      from: 'Los Angeles (LAX)',
      to: 'Doha (DOH)',
      departure: '04:15 PM',
      arrival: '07:45 PM+1',
      duration: '15h 30m',
      price: 780,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    },
    {
      id: 4,
      airline: 'Lufthansa',
      flightNo: 'LH400',
      from: 'Frankfurt (FRA)',
      to: 'New York (JFK)',
      departure: '01:45 PM',
      arrival: '05:15 PM',
      duration: '8h 30m',
      price: 650,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    },
    {
      id: 5,
      airline: 'Air France',
      flightNo: 'AF83',
      from: 'Paris (CDG)',
      to: 'Tokyo (NRT)',
      departure: '12:55 PM',
      arrival: '08:35 AM+1',
      duration: '11h 40m',
      price: 890,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    },
    {
      id: 6,
      airline: 'British Airways',
      flightNo: 'BA177',
      from: 'London (LHR)',
      to: 'New York (JFK)',
      departure: '08:20 AM',
      arrival: '11:15 AM',
      duration: '7h 55m',
      price: 720,
      stops: 'Non-stop',
      class: 'Economy',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200'
    }
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundImage: 'linear-gradient(135deg, rgba(26, 168, 203, 0.9), rgba(10, 155, 168, 0.95)), url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px' }}>
          Search Flights Worldwide
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
          Find the best deals on flights to your favorite destinations
        </p>
      </section>

      {/* Search Form */}
      <section style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  From
                </label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  To
                </label>
                <input
                  type="text"
                  placeholder="Arrival city"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  Departure
                </label>
                <input
                  type="date"
                  value={searchParams.departDate}
                  onChange={(e) => setSearchParams({ ...searchParams, departDate: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  Return
                </label>
                <input
                  type="date"
                  value={searchParams.returnDate}
                  onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  Passengers
                </label>
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({ ...searchParams, passengers: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #ddd',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#113D48', fontSize: '0.9rem' }}>
                  Class
                </label>
                <select
                  value={searchParams.class}
                  onChange={(e) => setSearchParams({ ...searchParams, class: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #ddd',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="economy">Economy</option>
                  <option value="premium">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>
            <button style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1CA8CB 0%, #0A9BA8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Search Flights
            </button>
          </div>

          {/* Results */}
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#113D48', marginBottom: '25px' }}>
              Available Flights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {results.map(flight => (
                <div key={flight.id} style={{
                  backgroundColor: '#fff',
                  padding: '25px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e1e4e5',
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr',
                    gap: '30px',
                    alignItems: 'center'
                  }}>
                    {/* Airline Info */}
                    <div>
                      <div style={{
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        color: '#113D48',
                        marginBottom: '5px'
                      }}>
                        {flight.airline}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
                        {flight.flightNo}
                      </div>
                      <div style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#E9F6F9',
                        color: '#0A9BA8',
                        borderRadius: '6px',
                        display: 'inline-block',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        {flight.stops}
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#113D48'
                          }}>
                            {flight.departure}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
                            {flight.from}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                          <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>
                            {flight.duration}
                          </div>
                          <div style={{
                            height: '2px',
                            backgroundColor: '#0A9BA8',
                            position: 'relative'
                          }}>
                            <i className="fa-solid fa-plane" style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: '#0A9BA8',
                              fontSize: '1rem'
                            }}></i>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: '#113D48'
                          }}>
                            {flight.arrival}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
                            {flight.to}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>
                          From
                        </div>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '900',
                          color: '#0A9BA8'
                        }}>
                          ${flight.price}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600' }}>
                          per person
                        </div>
                      </div>
                      <button style={{
                        width: '100%',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #1CA8CB 0%, #0A9BA8 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
