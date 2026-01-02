import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { user, isFirebaseConfigured } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = useMemo(() => {
    const stateFrom = location.state?.from?.pathname;
    return stateFrom && stateFrom !== '/login' ? stateFrom : '/dashboard';
  }, [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorCode = err?.code;
      setError(
        errorCode === 'auth/user-not-found'
          ? 'No user found with this email address'
          : errorCode === 'auth/wrong-password'
          ? 'Incorrect password. Please try again'
          : errorCode === 'auth/invalid-email'
          ? 'Invalid email address format'
          : errorCode === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please try again later'
          : err?.message || 'Login failed. Please check your credentials'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="back-to-home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </Link>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-user-circle"></i>
            </div>
            <h2 className="login-title">User Login</h2>
            <p className="login-subtitle">Welcome back! Please login to continue</p>
          </div>

          <div className="login-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={submitting || !isFirebaseConfigured}
              >
                {submitting ? (
                  <span className="login-button-loading">
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Login to Dashboard'
                )}
              </button>
            </form>

            <ul className="features-list">
              <li className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure and encrypted login</span>
              </li>
              <li className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Access your dashboard and analytics</span>
              </li>
              <li className="feature-item">
                <i className="fas fa-users"></i>
                <span>Manage bookings and customers</span>
              </li>
            </ul>
          </div>

          <div className="login-footer">
            <p className="signup-text">
              Don't have an account? <Link to="/agent-signup" className="signup-link">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
