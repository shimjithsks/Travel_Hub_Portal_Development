import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/services.css';

export default function Services() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const mainServices = [
    {
      id: 1,
      icon: 'fa-route',
      name: 'Tour Packages',
      desc: 'Explore handcrafted tour packages designed for unforgettable experiences. From weekend getaways to extended adventures.',
      features: ['Customized Itineraries', 'Expert Guides', 'All-Inclusive Options'],
      color: '#14b8a6',
      link: '/tour'
    },
    {
      id: 2,
      icon: 'fa-hotel',
      name: 'Hotel Booking',
      desc: 'Book from a wide range of hotels - from budget-friendly stays to luxury resorts. Best prices guaranteed.',
      features: ['5000+ Hotels', 'Instant Confirmation', 'Free Cancellation'],
      color: '#f97316',
      link: '/hotels'
    },
    {
      id: 3,
      icon: 'fa-plane-departure',
      name: 'Flight Booking',
      desc: 'Easy and convenient flight booking with competitive fares. Domestic and international flights available.',
      features: ['Best Fare Guarantee', 'Easy Rescheduling', '24/7 Support'],
      color: '#8b5cf6',
      link: '/flights'
    },
    {
      id: 4,
      icon: 'fa-map-marked-alt',
      name: 'Destination Planning',
      desc: 'Let our experts plan your perfect destination. We handle everything from visas to local experiences.',
      features: ['Visa Assistance', 'Local Experiences', 'Travel Insurance'],
      color: '#ec4899',
      link: '/destination'
    }
  ];

  const fleetServices = [
    {
      id: 1,
      icon: 'fa-car',
      name: 'Sedan Cars',
      desc: 'Comfortable sedans for city travel and airport transfers. Perfect for small families and business trips.',
      capacity: '4 Passengers',
      luggage: '2 Bags',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
    },
    {
      id: 2,
      icon: 'fa-shuttle-van',
      name: 'SUVs & MUVs',
      desc: 'Spacious SUVs for group travel and hill station trips. Ideal for families and adventure seekers.',
      capacity: '6-7 Passengers',
      luggage: '4 Bags',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400'
    },
    {
      id: 3,
      icon: 'fa-bus',
      name: 'Tempo Traveller',
      desc: 'Perfect for group tours and pilgrimages. Comfortable seating with ample luggage space.',
      capacity: '12-17 Passengers',
      luggage: '10+ Bags',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
    },
    {
      id: 4,
      icon: 'fa-bus-alt',
      name: 'Luxury Coaches',
      desc: 'Premium coaches for corporate events and large groups. AC, reclining seats, and entertainment systems.',
      capacity: '35-45 Passengers',
      luggage: '40+ Bags',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
    }
  ];

  const whyChooseUs = [
    { icon: 'fa-shield-alt', title: 'Safe & Secure', desc: 'Verified drivers and sanitized vehicles' },
    { icon: 'fa-rupee-sign', title: 'Best Prices', desc: 'Transparent pricing with no hidden charges' },
    { icon: 'fa-clock', title: '24/7 Available', desc: 'Round the clock booking and support' },
    { icon: 'fa-headset', title: 'Dedicated Support', desc: 'Personal travel manager for every trip' }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Travelers' },
    { number: '500+', label: 'Tour Packages' },
    { number: '200+', label: 'Vehicles' },
    { number: '50+', label: 'Destinations' }
  ];

  return (
    <div className="services-page-new">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content" data-aos="fade-up">
            <span className="services-hero-badge">What We Offer</span>
            <h1>Complete Travel Solutions</h1>
            <p className="services-hero-subtitle">
              From planning to execution, we provide end-to-end travel services to make your journey seamless and memorable.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="services-stats-section">
        <div className="container">
          <div className="stats-grid" data-aos="fade-up">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="main-services-section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">Our Services</span>
            <h2>Comprehensive Travel Services</h2>
            <p>Everything you need for a perfect trip, all in one place</p>
          </div>
          <div className="services-grid">
            {mainServices.map((service, index) => (
              <div key={service.id} className="service-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="service-icon" style={{ background: `linear-gradient(135deg, ${service.color}20 0%, ${service.color}10 100%)` }}>
                  <i className={`fas ${service.icon}`} style={{ color: service.color }}></i>
                </div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i}><i className="fas fa-check"></i> {feature}</li>
                  ))}
                </ul>
                <Link to={service.link} className="service-link" style={{ color: service.color }}>
                  Explore <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="fleet-section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">Travel Fleet</span>
            <h2>Our Vehicle Collection</h2>
            <p>Choose from our diverse fleet for comfortable and safe travels</p>
          </div>
          <div className="fleet-grid">
            {fleetServices.map((vehicle, index) => (
              <div key={vehicle.id} className="fleet-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="fleet-image">
                  <img src={vehicle.image} alt={vehicle.name} />
                  <div className="fleet-overlay">
                    <Link to="/fleet-results" className="fleet-book-btn">Book Now</Link>
                  </div>
                </div>
                <div className="fleet-content">
                  <div className="fleet-icon">
                    <i className={`fas ${vehicle.icon}`}></i>
                  </div>
                  <h4>{vehicle.name}</h4>
                  <p>{vehicle.desc}</p>
                  <div className="fleet-specs">
                    <div className="spec">
                      <i className="fas fa-users"></i>
                      <span>{vehicle.capacity}</span>
                    </div>
                    <div className="spec">
                      <i className="fas fa-suitcase"></i>
                      <span>{vehicle.luggage}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="fleet-cta" data-aos="fade-up">
            <Link to="/fleet-results" className="view-fleet-btn">
              <i className="fas fa-car"></i> View Full Fleet
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="why-choose-wrapper">
            <div className="why-choose-content" data-aos="fade-right">
              <span className="section-badge">Why Travel Axis</span>
              <h2>Your Trusted Travel Partner</h2>
              <p>We go above and beyond to ensure your travel experience is nothing short of exceptional.</p>
              <div className="why-choose-grid">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="why-choose-item">
                    <div className="why-icon">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <div className="why-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="why-choose-image" data-aos="fade-left">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600" alt="Travel Experience" />
              <div className="experience-badge">
                <span className="exp-number">10+</span>
                <span className="exp-text">Years of Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta-section">
        <div className="container">
          <div className="services-cta-box" data-aos="fade-up">
            <div className="cta-content">
              <h3>Ready to Start Your Journey?</h3>
              <p>Let us help you plan the perfect trip. Contact us for personalized travel solutions.</p>
              <div className="cta-buttons">
                <Link to="/contact" className="cta-btn primary">
                  <i className="fas fa-envelope"></i> Get Quote
                </Link>
                <a href="tel:+919035461093" className="cta-btn secondary">
                  <i className="fas fa-phone-alt"></i> +91 90354 61093
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
