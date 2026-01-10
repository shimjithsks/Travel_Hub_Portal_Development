import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './NavbarNew.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const userDropdownRef = useRef(null);
  const supportDropdownRef = useRef(null);

  // Check if on agent/partner pages to hide nav items and open logo in new tab
  const isPartnerPage = location.pathname === '/agent-signup' || location.pathname === '/travel-agents' || location.pathname === '/agent-login' || location.pathname === '/portal-dashboard' || location.pathname === '/partner-dashboard' || location.pathname === '/set-password';

  // Handle logo click - smooth scroll if on home, navigate if not, open new tab if on partner pages
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    // If on partner-related pages, open in new tab
    if (isPartnerPage) {
      window.open('/', '_blank');
      return;
    }
    
    if (location.pathname === '/') {
      // Already on home page - smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Navigate to home page
      navigate('/');
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Click outside handler for user dropdown
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

  // Click outside handler for support/help dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (supportDropdownRef.current && !supportDropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    if (showDropdown) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

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
              <a href="/" className="brand-logo" onClick={handleLogoClick}>
                <div className="logo-wrapper">
                  <div className="logo-icon">
                    <i className="fas fa-globe-americas globe-main"></i>
                    <i className="fas fa-plane icon-plane"></i>
                    <i className="fas fa-bus icon-bus"></i>
                    <i className="fas fa-car icon-car"></i>
                    <i className="fas fa-ship icon-ship"></i>
                    <i className="fas fa-car-side icon-luxury"></i>
                  </div>
                  <div className="logo-text">
                    <h1>Travel<span className="logo-accent">Axis</span></h1>
                    <span className="logo-tagline">Your Journey, Our Passion</span>
                  </div>
                </div>
              </a>

              <div className="mobile-toggle" onClick={toggleMenu}>
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </div>

              <nav className={`main-navigation ${isOpen ? 'active' : ''}`}>
                {/* My Journeys link hidden
                {user && !isPartnerPage ? (
                  <Link to="/customer/my-bookings" className="trips-link" onClick={() => setIsOpen(false)}>
                    <i className="fas fa-compass"></i>
                    <span>My Journeys</span>
                  </Link>
                ) : null}
                */}
              </nav>

              {!isPartnerPage && (
              <div className="nav-actions">
                {/* Become a Partner link hidden
                <Link to="/travel-agents" className="header-btn agents-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-handshake"></i>
                  <span>Become a Partner</span>
                </Link>
                */}

                {/* Help dropdown hidden
                <div className="nav-dropdown" ref={supportDropdownRef} style={{position: 'relative'}}>
                  <button 
                    className="header-btn support-btn"
                    onClick={() => setShowDropdown(showDropdown === 'support' ? null : 'support')}
                  >
                    <i className="fas fa-life-ring"></i>
                    <span>Help</span>
                    <i className={`fas fa-chevron-down ${showDropdown === 'support' ? 'rotated' : ''}`}></i>
                  </button>
                  {showDropdown === 'support' && (
                    <div className="dropdown-menu" style={{position: 'absolute', top: '100%', right: 0, zIndex: 9999, display: 'block', minWidth: '260px', whiteSpace: 'nowrap'}}>
                      <div className="dropdown-header">
                        <i className="fas fa-headset"></i>
                        <span>How can we help?</span>
                      </div>
                      <Link to="/customer/my-refund" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-rotate-left"></i> Track Refund
                      </Link>
                      <Link to="/contact" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-message"></i> Contact Support
                      </Link>
                      <Link to="/complete-booking" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-clipboard-check"></i> Complete Booking
                      </Link>
                      <Link to="/make-payment" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-credit-card"></i> Make Payment
                      </Link>
                      <Link to="/complete-holiday" onClick={() => setShowDropdown(null)}>
                        <i className="fas fa-palm-tree"></i> Holiday Bookings
                      </Link>
                    </div>
                  )}
                </div>
                */}

                {/* Login / Signup and user dropdown hidden
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
                */}
              </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
