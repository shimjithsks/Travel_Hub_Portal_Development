import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { setPartnerPassword } from '../../services/partnerService';
import '../Login.css';

export default function SetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  useEffect(() => {
    // Get email from URL query params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: 'Very Weak', color: '#ef4444' },
      1: { label: 'Weak', color: '#f97316' },
      2: { label: 'Fair', color: '#eab308' },
      3: { label: 'Good', color: '#22c55e' },
      4: { label: 'Strong', color: '#14b8a6' },
      5: { label: 'Very Strong', color: '#0d9488' }
    };

    setPasswordStrength({
      score,
      label: strengthMap[score].label,
      color: strengthMap[score].color
    });
  }, [password]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await setPartnerPassword(email, password, confirmPassword);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/agent-login', { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="login-page">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <Link to="/" className="brand-logo">
            <i className="fas fa-plane-departure"></i>
            <span>Travel Axis</span>
          </Link>

          <div className="branding-content">
            <h1>Partner Portal</h1>
            <p>Manage your bookings, track earnings, and grow your travel business with our powerful dashboard.</p>
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
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Password Set Successfully!</h2>
              <p>Your password has been created. You can now login to your partner account.</p>
            </div>

            <div className="success-message">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Redirecting to login page...</span>
            </div>

            <div className="login-form-footer">
              <p>
                <Link to="/agent-login">
                  <i className="fas fa-arrow-right"></i> Go to Login Now
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
        <Link to="/" className="brand-logo">
          <i className="fas fa-plane-departure"></i>
          <span>Travel Axis</span>
        </Link>

        <div className="branding-content">
          <h1>Partner Portal</h1>
          <p>Set up your secure password to access your partner dashboard and start managing your bookings.</p>
          
          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Secure Access</h4>
                <p>Your password is encrypted securely</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Verified Account</h4>
                <p>Your partner application is approved</p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="brand-feature-text">
                <h4>Ready to Launch</h4>
                <p>Start earning once you set password</p>
              </div>
            </div>
          </div>
        </div>

        <div className="branding-footer">
          <p>© 2026 Travel Axis. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Set Password Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-header">
            <div className="login-icon">
              <i className="fas fa-key"></i>
            </div>
            <h2>Set Your Password</h2>
            <p>Create a secure password for your partner account</p>
          </div>

          {error && (
            <div className="login-alert">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {!email && (
            <div className="login-alert">
              <i className="fas fa-info-circle"></i>
              <span>No email address provided. Please use the link from your approval email.</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!searchParams.get('email')}
                  className={searchParams.get('email') ? 'readonly-input' : ''}
                />
                {searchParams.get('email') && (
                  <i className="fas fa-lock input-lock"></i>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              <div className="password-hints">
                <span className={password.length >= 6 ? 'hint-valid' : ''}>
                  <i className={`fas ${password.length >= 6 ? 'fa-check' : 'fa-circle'}`}></i>
                  At least 6 characters
                </span>
                <span className={/[A-Z]/.test(password) ? 'hint-valid' : ''}>
                  <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check' : 'fa-circle'}`}></i>
                  One uppercase letter
                </span>
                <span className={/[0-9]/.test(password) ? 'hint-valid' : ''}>
                  <i className={`fas ${/[0-9]/.test(password) ? 'fa-check' : 'fa-circle'}`}></i>
                  One number
                </span>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {confirmPassword && (
                <div className="password-match">
                  {password === confirmPassword ? (
                    <span className="match-valid">
                      <i className="fas fa-check-circle"></i> Passwords match
                    </span>
                  ) : (
                    <span className="match-invalid">
                      <i className="fas fa-times-circle"></i> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || !email || password !== confirmPassword || password.length < 6}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Setting Password...
                </>
              ) : (
                <>
                  Set Password & Continue
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="login-form-footer">
            <p>
              Already have a password?{' '}
              <Link to="/agent-login">Sign In</Link>
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
