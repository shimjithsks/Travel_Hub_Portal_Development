import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from '../../services/partnerService';
import '../Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await sendPasswordResetEmail(email);
      
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="login-page">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <h1>Partner Portal</h1>
            <p>Reset your password securely and get back to managing your travel business.</p>
          </div>

          <div className="branding-footer">
            <p>© 2026 Travel Axis. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-form-header">
              <div className="login-icon success-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h2>Check Your Email</h2>
              <p>We've sent password reset instructions to <strong>{email}</strong></p>
            </div>

            <div className="success-info-box">
              <div className="info-item">
                <i className="fas fa-clock"></i>
                <span>The link will expire in 1 hour</span>
              </div>
              <div className="info-item">
                <i className="fas fa-inbox"></i>
                <span>Check your spam folder if you don't see the email</span>
              </div>
            </div>

            <div className="login-form-footer">
              <p>
                <Link to="/agent-login">
                  <i className="fas fa-arrow-left"></i> Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <h1>Partner Portal</h1>
          <p>Reset your password securely and get back to managing your travel business.</p>
          
          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Secure Reset</h4>
                <p>Your password reset is encrypted and secure</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Email Verification</h4>
                <p>Reset link sent to your registered email</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Quick Process</h4>
                <p>Reset your password in minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="branding-footer">
          <p>© 2026 Travel Axis. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-header">
            <div className="login-icon">
              <i className="fas fa-key"></i>
            </div>
            <h2>Forgot Password?</h2>
            <p>Enter your email and we'll send you a reset link</p>
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

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            <p>
              Remember your password?{' '}
              <Link to="/agent-login">Back to Login</Link>
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
