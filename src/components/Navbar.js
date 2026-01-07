import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './NavbarNew.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserDropdown]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const dashboardPath = role === 'operator' ? '/operator' : '/customer';

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleMenuNavigation = (path) => {
    setShowUserDropdown(false);
    navigate(path);
  };

  // Get user's first name and initial
  const getUserName = () => {
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
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
                  <Link to="/customer/my-bookings" className="nav-link" onClick={() => setIsOpen(false)}>
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

                <div className="nav-dropdown" style={{position: 'relative'}}>
                  <button 
                    className="header-btn"
                    onClick={() => setShowDropdown(showDropdown === 'support' ? null : 'support')}
                  >
                    <i className="fas fa-phone-alt"></i>
                    <span>Support</span>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  {showDropdown === 'support' && (
                    <div className="dropdown-menu" style={{position: 'absolute', top: '100%', left: 0, zIndex: 9999, display: 'block', minWidth: '280px', whiteSpace: 'nowrap'}}>
                      <Link to="/customer/my-refund" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-undo"></i> Check Your Refund
                      </Link>
                      <Link to="/contact" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-envelope"></i> Contact Us
                      </Link>
                      <Link to="/complete-booking" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-check-circle"></i> Complete Your Booking
                      </Link>
                      <Link to="/make-payment" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-credit-card"></i> Make a Payment
                      </Link>
                      <Link to="/complete-holiday" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-umbrella-beach"></i> Complete Holiday Bookings
                      </Link>
                    </div>
                  )}
                </div>

                {user ? (
                  <div className="user-dropdown-wrapper" ref={userDropdownRef}>
                    <button className="user-profile-btn" onClick={toggleUserDropdown}>
                      <div className="user-avatar">
                        {getUserInitial()}
                      </div>
                      <span className="user-greeting">Hi {getUserName()}</span>
                      <i className={`fas fa-chevron-down ${showUserDropdown ? 'rotated' : ''}`}></i>
                    </button>
                    {showUserDropdown && (
                      <div className="user-dropdown-menu">
                        <button onClick={() => handleMenuNavigation('/customer/my-bookings')}>
                          <i className="fas fa-suitcase"></i> My Booking
                        </button>
                        <button onClick={() => handleMenuNavigation('/customer/my-refund')}>
                          <i className="fas fa-undo"></i> My Refund
                        </button>
                        <button onClick={() => handleMenuNavigation('/customer/my-ecash')}>
                          <i className="fas fa-wallet"></i> My eCash
                        </button>
                        <button onClick={() => handleMenuNavigation('/customer/my-profile')}>
                          <i className="fas fa-user"></i> My Profile
                        </button>
                        <button onClick={handleLogout} className="logout-menu-item">
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </div>
                    )}
                  </div>
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
