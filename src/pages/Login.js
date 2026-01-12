import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginPartner } from '../services/partnerService';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if partner is already logged in
  const storedPartner = localStorage.getItem('partnerSession');
  if (storedPartner) {
    navigate('/partner-dashboard', { replace: true });
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await loginPartner(email, password);
      
      if (result.success) {
        // Store partner session
        localStorage.setItem('partnerSession', JSON.stringify(result.partner));
        navigate('/partner-dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <h1>Partner Portal</h1>
          <p>Manage your bookings, track earnings, and grow your travel business with our powerful dashboard.</p>
          
          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Real-time Analytics</h4>
                <p>Track bookings and revenue instantly</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Easy Payouts</h4>
                <p>Secure and fast payment processing</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <div className="brand-feature-text">
                <h4>24/7 Support</h4>
                <p>Dedicated partner support team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="branding-footer">
          <p>© 2026 Travel Axis. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-header">
            <div className="login-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your partner account</p>
          </div>

          {error && (
            <div className="login-alert">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            <p>
              New to Travel Axis?{' '}
              <Link to="/agent-signup">Create Partner Account</Link>
            </p>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <i className="fas fa-shield-alt"></i>
              <span>SSL Secured</span>
            </div>
            <div className="trust-badge">
              <i className="fas fa-lock"></i>
              <span>Encrypted</span>
            </div>
            <div className="trust-badge">
              <i className="fas fa-check-circle"></i>
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
