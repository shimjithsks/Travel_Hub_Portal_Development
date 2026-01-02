import React from 'react';

export default function Services() {
  const services = [
    { id: 1, name: 'Tour Packages', desc: 'Customized tour packages to your favorite destinations' },
    { id: 2, name: 'Hotel Booking', desc: 'Book comfortable hotels at best prices' },
    { id: 3, name: 'Flight Booking', desc: 'Easy and convenient flight booking services' },
    { id: 4, name: 'Tour Guides', desc: 'Professional and experienced tour guides' },
  ];

  return (
    <div className="services-page section">
      <div className="container">
        <div className="section-header">
          <h2>Explore beauty of the whole world</h2>
          <h3>Our Services</h3>
        </div>
        <div className="destinations-grid">
          {services.map(service => (
            <div key={service.id} className="destination-card">
              <div className="destination-info" style={{ padding: '2rem' }}>
                <h4>{service.name}</h4>
                <p>{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
