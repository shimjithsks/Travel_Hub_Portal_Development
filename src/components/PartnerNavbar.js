import React from 'react';
import { Link } from 'react-router-dom';
import './PartnerNavbar.css';

export default function PartnerNavbar() {
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.open('/', '_blank');
  };

  return (
    <nav className="partner-navbar">
      <div className="partner-navbar-gradient"></div>
      <div className="partner-navbar-container">
        <Link to="/" onClick={handleLogoClick} className="partner-navbar-brand">
          <div className="partner-logo-icon">
            <i className="fas fa-globe-americas globe-main"></i>
            <i className="fas fa-plane icon-plane"></i>
            <i className="fas fa-bus icon-bus"></i>
            <i className="fas fa-car icon-car"></i>
            <i className="fas fa-ship icon-ship"></i>
          </div>
          <div className="partner-navbar-text">
            <span className="partner-navbar-title">Travel<span className="highlight">Axis</span></span>
            <span className="partner-navbar-tagline">YOUR JOURNEY, OUR PASSION</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
