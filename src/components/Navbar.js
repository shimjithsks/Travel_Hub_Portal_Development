import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './NavbarNew.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const dashboardPath = role === 'operator' ? '/operator' : '/customer';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="yatra-header">
        {/* Main Navbar */}
        <div className="header-main">
          <div className="container-fluid">
            <div className="main-nav-content">
              <Link to="/" className="brand-logo">
                <div className="logo-wrapper">
                  <div className="logo-icon">
                    <i className="fas fa-globe-americas"></i>
                    <i className="fas fa-route route-overlay"></i>
                  </div>
                  <div className="logo-text">
                    <h1>Travel Axis</h1>
                    <span className="logo-tagline">Explore the World</span>
                  </div>
                </div>
              </Link>

              <div className="mobile-toggle" onClick={toggleMenu}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </div>

              <nav className={`main-navigation ${isOpen ? 'active' : ''}`}>
                {user ? (
                  <Link to={dashboardPath} className="nav-link" onClick={() => setIsOpen(false)}>
                    <i className="fas fa-suitcase"></i>
                    <span>My Trips</span>
                  </Link>
                ) : null}
              </nav>

              <div className="nav-actions">
                <Link to="/travel-agents" className="header-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-headphones"></i>
                  <span>For Travel Agents</span>
                </Link>

                <div 
                  className="nav-dropdown"
                  onMouseEnter={() => setShowDropdown('support')}
                  onMouseLeave={() => setShowDropdown(null)}
                >
                  <button className="header-btn">
                    <i className="fas fa-phone-alt"></i>
                    <span>Support</span>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  {showDropdown === 'support' && (
                    <div className="dropdown-menu">
                      <Link to="/contact" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-headset"></i> Help Center
                      </Link>
                      <Link to="/faq" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-question-circle"></i> FAQs
                      </Link>
                      <Link to="/contact" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-envelope"></i> Contact Us
                      </Link>
                    </div>
                  )}
                </div>

                {user ? (
                  <button className="login-btn" onClick={handleLogout} type="button">
                    Logout
                  </button>
                ) : (
                  <button className="login-btn" onClick={() => setShowLoginModal(true)}>
                    Login / Signup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
