import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { sendCustomerPasswordChangedEmail } from '../../services/emailService';
import '../../styles/myProfile.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userName, setUserName] = useState('');
  const [userDocId, setUserDocId] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (tokenParam) setToken(tokenParam);

    // Validate token
    const validateToken = async () => {
      if (!emailParam || !tokenParam) {
        setError('Invalid reset link. Please request a new password reset.');
        setValidating(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', decodeURIComponent(emailParam)));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('No account found with this email.');
          setValidating(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setUserName(userData.name || '');
        setUserDocId(userDoc.id);

        // Check token
        if (userData.resetToken !== tokenParam) {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setValidating(false);
          return;
        }

        // Check expiry
        if (userData.resetTokenExpiry) {
          const expiry = userData.resetTokenExpiry.toDate ? userData.resetTokenExpiry.toDate() : new Date(userData.resetTokenExpiry);
          if (expiry < new Date()) {
            setError('This reset link has expired. Please request a new password reset.');
            setValidating(false);
            return;
          }
        }

        setTokenValid(true);
        setValidating(false);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Unable to validate reset link. Please try again.');
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      // Store the new password in Firestore
      // This will be used to update Firebase Auth on next login
      await updateDoc(doc(db, 'users', userDocId), {
        pendingPassword: password, // Store pending password (will be applied on login)
        passwordChangedAt: serverTimestamp(),
        resetToken: null,
        resetTokenExpiry: null,
        lastUpdated: serverTimestamp()
      });

      // Send password changed confirmation email
      await sendCustomerPasswordChangedEmail({
        email: email,
        name: userName
      });

      setSuccess(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (validating) {
    return (
      <div className="customer-auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Validating reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="customer-auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header error-header">
              <div className="auth-icon error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Invalid Link</h2>
              <p>{error}</p>
            </div>

            <div className="auth-footer">
              <Link to="/" className="auth-link">
                <i className="fas fa-redo"></i> Request New Reset Link
              </Link>
              <Link to="/" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="customer-auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header success-header">
              <div className="auth-icon success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Password Reset Successfully!</h2>
              <p>Your password has been updated. You can now login with your new password.</p>
            </div>

            <div className="auth-redirect">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Redirecting to home page...</span>
            </div>

            <div className="auth-footer">
              <Link to="/" className="back-link">
                <i className="fas fa-home"></i> Go to Home Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2>Create New Password</h2>
            <p>Enter a new password for <strong>{email}</strong></p>
          </div>

          {error && (
            <div className="auth-alert error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <i className="fas fa-key"></i>
                New Password
              </label>
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="new-password"
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
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-check-double"></i>
                Confirm Password
              </label>
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="new-password"
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="password-requirements">
              <p><i className="fas fa-info-circle"></i> Password Requirements:</p>
              <ul>
                <li className={password.length >= 6 ? 'valid' : ''}>
                  <i className={`fas ${password.length >= 6 ? 'fa-check' : 'fa-circle'}`}></i>
                  At least 6 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                  <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check' : 'fa-circle'}`}></i>
                  One uppercase letter
                </li>
                <li className={/[0-9]/.test(password) ? 'valid' : ''}>
                  <i className={`fas ${/[0-9]/.test(password) ? 'fa-check' : 'fa-circle'}`}></i>
                  One number
                </li>
                <li className={password === confirmPassword && password.length > 0 ? 'valid' : ''}>
                  <i className={`fas ${password === confirmPassword && password.length > 0 ? 'fa-check' : 'fa-circle'}`}></i>
                  Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <i className="fas fa-check"></i>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/" className="back-link">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
