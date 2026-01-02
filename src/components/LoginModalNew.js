import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModalNew.css';

export default function LoginModalNew({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login with:', emailOrPhone);
    onClose();
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign-in
    console.log('Google Sign In');
  };

  const handleCreateAccount = () => {
    onClose();
    navigate('/register');
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="login-modal-content">
          {/* Left Side - Image and Benefits */}
          <div className="login-modal-left">
            <div className="modal-image-section">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=1000&fit=crop" 
                alt="Travel" 
              />
            </div>
            
            <div className="modal-benefits">
              <div className="benefit-item">
                <i className="fas fa-gift"></i>
                <span>Unlock Exclusive Deals on every booking</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-star"></i>
                <span>Zero Convenience Fee with Travel Axis Prime</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-calendar-check"></i>
                <span>Easily View, Modify, or Cancel Bookings</span>
              </div>
              <p className="and-more">and more..</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-modal-right">
            <h2 className="modal-title">Login or Create an Account</h2>

            <form onSubmit={handleLogin} className="modal-login-form">
              <div className="modal-form-group">
                <label>Email Id / Mobile Number</label>
                <input
                  type="text"
                  placeholder="Email Id / Mobile Number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="modal-login-btn">
                Login
              </button>

              <p className="modal-terms">
                By proceeding, you agree with our{' '}
                <a href="/terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>,{' '}
                <a href="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> &{' '}
                <a href="/user-agreement" onClick={(e) => e.preventDefault()}>Master User Agreement</a>.
              </p>

              <div className="modal-divider">
                <span>Or</span>
              </div>

              <button type="button" className="modal-google-btn" onClick={handleGoogleSignIn}>
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="google-icon"
                />
                Sign in with Google
              </button>

              <p className="modal-signup">
                Don't have an account?{' '}
                <button type="button" onClick={handleCreateAccount} className="create-account-link">
                  Create Account
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
