import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/about.css';

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const stats = [
    { icon: 'fa-user-tie', value: '50+', label: 'Expert Agents' },
    { icon: 'fa-globe-americas', value: '100+', label: 'Destinations' },
    { icon: 'fa-route', value: '500+', label: 'Tour Packages' },
    { icon: 'fa-star', value: '24/7', label: 'Support Available' }
  ];

  const values = [
    {
      icon: 'fa-heart',
      title: 'Customer First',
      description: 'Your satisfaction is our top priority. We go above and beyond to make your travel dreams come true.'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Trust & Safety',
      description: 'Travel with confidence knowing that your safety and security are always our primary concern.'
    },
    {
      icon: 'fa-lightbulb',
      title: 'Innovation',
      description: 'We continuously evolve our services with cutting-edge technology for seamless travel experiences.'
    },
    {
      icon: 'fa-handshake',
      title: 'Integrity',
      description: 'Transparent pricing, honest recommendations, and ethical business practices guide everything we do.'
    }
  ];

  const team = [
    { name: 'CEO Name', role: 'Founder & CEO', initials: 'CEO' },
    { name: 'Operations Head Name', role: 'Head of Operations', initials: 'OH' },
    { name: 'Tour Director Name', role: 'Senior Tour Director', initials: 'TD' },
    { name: 'Customer Lead Name', role: 'Customer Success Lead', initials: 'CL' }
  ];

  return (
    <div className="about-page-new">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content" data-aos="fade-up">
              <span className="hero-badge">About Us</span>
              <h1>Fresh Vision, Seasoned Expertise</h1>
              <p className="hero-subtitle">
                We're a new travel company powered by industry veterans — experienced tour operators, seasoned travel agents, and expert package designers who bring decades of collective knowledge to every journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-image" data-aos="fade-right">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600" alt="Travel Adventure" />
              <div className="experience-badge">
                <span className="years">50+</span>
                <span className="text">Expert Professionals</span>
              </div>
            </div>
            <div className="story-content" data-aos="fade-left">
              <span className="section-badge">Our Story</span>
              <h2>New Company, Proven Expertise</h2>
              <p>
                Travel Axis is a fresh venture founded by passionate travel professionals who have spent years mastering the art of travel. Our team includes experienced tour operators who have organized thousands of trips, seasoned travel agents who know every destination inside out, and expert package designers who craft perfect itineraries.
              </p>
              <p>
                While our company is new, our expertise is not. We've brought together the best minds in the travel industry to create a platform that combines fresh innovation with time-tested knowledge. Our mission is simple: to make world-class travel accessible, affordable, and unforgettable.
              </p>
              <div className="story-features">
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Experienced Tour Operators</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Seasoned Travel Agents</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Expert Package Designers</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Verified Partner Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Values</span>
            <h2>What Drives Us Forward</h2>
            <p>The principles that guide every journey we create</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="value-icon">
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Team</span>
            <h2>Meet the Experts</h2>
            <p>Passionate professionals with years of industry experience</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="team-image placeholder-avatar">
                  <div className="avatar-initials">{member.initials}</div>
                  <div className="social-overlay">
                    <a href="#"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                  </div>
                </div>
                <div className="team-info">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content" data-aos="fade-up">
            <h2>Ready to Start Your Adventure?</h2>
            <p>Let our experienced team help you create memories that last a lifetime</p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn-primary">
                <i className="fas fa-paper-plane"></i>
                Get in Touch
              </Link>
              <Link to="/tour" className="btn-secondary">
                <i className="fas fa-compass"></i>
                Explore Tours
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
