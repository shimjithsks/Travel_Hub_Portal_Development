import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../../styles/travelAgents.css';

export default function TravelAgents() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const benefits = [
    {
      icon: 'fa-chart-line',
      title: 'Higher Earnings',
      description: 'Earn attractive commissions on every booking you make'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Dedicated support team available round the clock'
    },
    {
      icon: 'fa-bolt',
      title: 'Instant Booking',
      description: 'Real-time confirmations with our advanced booking system'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Payments',
      description: 'Safe and secure payment gateway with multiple options'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Register',
      description: 'Create your partner account in just 2 minutes'
    },
    {
      number: '02',
      title: 'Verify',
      description: 'Complete KYC verification for account activation'
    },
    {
      number: '03',
      title: 'Start Earning',
      description: 'Begin booking and earning commissions instantly'
    }
  ];

  return (
    <div className="travel-agents-page">
      {/* Hero Section */}
      <section className="agents-hero">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content" data-aos="fade-up">
              <span className="hero-badge">Partner Program</span>
              <h1>Grow Your Travel Business with Travel Axis</h1>
              <p className="hero-subtitle">Join our network of successful travel partners and unlock unlimited earning potential</p>
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-icon"><i className="fas fa-users"></i></div>
                  <h3>5,000+</h3>
                  <p>Active Partners</p>
                </div>
                <div className="stat-item">
                  <div className="stat-icon"><i className="fas fa-rupee-sign"></i></div>
                  <h3>₹2Cr+</h3>
                  <p>Bookings Managed</p>
                </div>
                <div className="stat-item">
                  <div className="stat-icon"><i className="fas fa-map-marker-alt"></i></div>
                  <h3>200+</h3>
                  <p>Cities Covered</p>
                </div>
              </div>
              <div className="hero-actions">
                <Link to="/agent-signup" className="btn-primary">
                  <i className="fas fa-rocket"></i>
                  Become a Partner
                </Link>
                <Link to="/agent-login" className="btn-secondary">
                  <i className="fas fa-sign-in-alt"></i>
                  Partner Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Partner With Us</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">We provide all the tools and support you need to grow your travel business</p>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="benefit-icon">
                  <i className={`fas ${benefit.icon}`}></i>
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="steps-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Getting Started</span>
            <h2 className="section-title">Start in 3 Simple Steps</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card" data-aos="fade-up" data-aos-delay={index * 150}>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of successful travel partners earning with Travel Axis</p>
            <div className="cta-buttons">
              <Link to="/agent-signup" className="btn-primary">
                <i className="fas fa-user-plus"></i>
                Register Now
              </Link>
              <Link to="/contact" className="btn-secondary">
                <i className="fas fa-phone-alt"></i>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
