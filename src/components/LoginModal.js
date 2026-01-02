import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Here you would normally send an OTP or validate email/phone
      // For now, just close the modal
      onClose();
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
      navigate('/customer');
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-body">
          {/* Left Side - Benefits */}
          <div className="modal-left">
            <div className="traveler-illustration">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop" 
                alt="Travel" 
                className="illustration-img"
              />
            </div>
            <div className="benefits-list">
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
          <div className="modal-right">
            <h2 className="modal-title">Login or Create an Account</h2>

            {error && <div className="alert-danger-modal">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group-modal">
                <label>Email Id / Mobile Number</label>
                <input
                  type="text"
                  placeholder="Email Id / Mobile Number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>

              <button 
                type="submit" 
                className="login-btn-modal"
                disabled={submitting || !isFirebaseConfigured}
              >
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="terms-text">
              By proceeding, you agree with our{' '}
              <a href="/terms">Terms of Service</a>,{' '}
              <a href="/privacy">Privacy Policy</a>
              {' '}& <a href="/agreement">Master User Agreement</a>.
            </div>

            <div className="divider-or">
              <span>Or</span>
            </div>

            <button className="google-signin-btn" onClick={handleGoogleSignIn}>
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google"
                className="google-icon"
              />
              Sign in with Google
            </button>

            <div className="create-account-link">
              Don't have an account?{' '}
              <a href="/register" onClick={onClose}>Create Account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
