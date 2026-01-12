import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { sendCustomerPasswordResetEmail } from '../../services/emailService';
import '../../styles/myProfile.css';

export default function CustomerForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Check if user exists in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No account found with this email address.');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Generate reset token
      const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token in user document
      await updateDoc(doc(db, 'users', userDoc.id), {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
        lastUpdated: serverTimestamp()
      });

      // Send password reset email
      await sendCustomerPasswordResetEmail(
        { email: email, name: userData.name },
        resetToken
      );

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="customer-auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header success-header">
              <div className="auth-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h2>Check Your Email</h2>
              <p>We've sent password reset instructions to</p>
              <strong>{email}</strong>
            </div>

            <div className="auth-info-box">
              <div className="info-item">
                <i className="fas fa-clock"></i>
                <span>The link will expire in 1 hour</span>
              </div>
              <div className="info-item">
                <i className="fas fa-inbox"></i>
                <span>Check your spam folder if you don't see the email</span>
              </div>
            </div>

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

  return (
    <div className="customer-auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <i className="fas fa-key"></i>
            </div>
            <h2>Forgot Password?</h2>
            <p>Enter your email and we'll send you a reset link</p>
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
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
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
