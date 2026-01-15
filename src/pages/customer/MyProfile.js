import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { sendCustomerPasswordResetEmail, sendCustomerPasswordChangedEmail } from '../../services/emailService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/myProfile.css';

export default function MyProfile() {
  const { user, profile, updateProfileLocal } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setFetchingProfile(false);
        return;
      }

      // If profile is available from context, use it
      if (profile) {
        setFormData({
          name: profile.name || user.displayName || '',
          email: user.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          photoURL: profile.photoURL || user.photoURL || ''
        });
        setFetchingProfile(false);
        return;
      }

      // Otherwise, fetch directly from Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || user.displayName || '',
            email: user.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
            photoURL: data.photoURL || user.photoURL || ''
          });
        } else {
          // No profile exists, use auth user data
          setFormData({
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            photoURL: user.photoURL || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setFetchingProfile(false);
      }
    };

    loadProfile();
  }, [user, profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if document exists
      const docSnap = await getDoc(userRef);
      
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        updatedAt: new Date().toISOString()
      };

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userRef, profileData);
      } else {
        // Create new document
        await setDoc(userRef, {
          ...profileData,
          email: user.email,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }

      // Update Firebase Auth display name
      if (formData.name !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.name
        });
      }

      // Update email if changed (this requires re-authentication)
      if (formData.email !== user.email) {
        try {
          await updateEmail(user, formData.email);
        } catch (emailError) {
          console.error('Email update error:', emailError);
          alert('Profile updated but email change requires re-authentication. Please log out and log in again to change email.');
        }
      }

      setEditing(false);
      alert('Profile updated successfully!');
      window.location.reload(); // Reload to fetch updated profile
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (formData.name) {
      return formData.name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 500KB for Firestore storage)
    if (file.size > 500 * 1024) {
      alert('Image size should be less than 500KB. Please compress the image or choose a smaller one.');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Convert to base64 and compress
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        
        try {
          // Only store in Firestore (Firebase Auth has URL length limits)
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            photoURL: base64Image,
            updatedAt: new Date().toISOString()
          });

          // Update local state immediately
          setFormData(prev => ({ ...prev, photoURL: base64Image }));
          
          // Update global profile context so header updates immediately
          updateProfileLocal({ photoURL: base64Image });
          
          setUploadingPhoto(false);
          alert('Profile photo updated successfully!');
        } catch (error) {
          console.error('Error saving photo:', error);
          alert('Failed to upload photo. The image might be too large. Please try a smaller image.');
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
      setUploadingPhoto(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      // Update Firestore with password change timestamp
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        passwordChangedAt: new Date().toISOString()
      });

      // Send confirmation email
      await sendCustomerPasswordChangedEmail({
        email: user.email,
        name: formData.name || user.displayName || 'Valued Customer'
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Please log out and log in again before changing password');
      } else {
        setPasswordError(error.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Send password reset email using Firebase Auth
  const handleSendPasswordResetEmail = async () => {
    setSendingResetEmail(true);
    setResetEmailSent(false);
    
    try {
      // Use Firebase's built-in password reset
      // This sends a Firebase email that actually updates the Auth password
      await sendPasswordResetEmail(auth, user.email);
      
      // Also send our beautiful custom notification email
      await sendCustomerPasswordResetEmail({
        email: user.email,
        name: formData.name || user.displayName || 'Valued Customer'
      });
      
      setResetEmailSent(true);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      if (error.code === 'auth/too-many-requests') {
        alert('Too many requests. Please wait a few minutes before trying again.');
      } else {
        alert('Failed to send password reset email. Please try again.');
      }
    } finally {
      setSendingResetEmail(false);
    }
  };

  // Show loading state while fetching profile
  if (fetchingProfile) {
    return <LoadingSpinner size="fullpage" text="Loading your profile..." overlay />;
  }

  return (
    <div className="my-profile-container">
      <div className="profile-header">
        <div className="profile-header-background">
          <div className="profile-blob profile-blob-1"></div>
          <div className="profile-blob profile-blob-2"></div>
          <div className="profile-icon-deco"></div>
        </div>
        <div className="header-content profile-header-content">
          <div className="profile-icon-badge">
            <i className="fas fa-user"></i>
          </div>
          <div className="profile-header-text">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account information</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Profile" className="profile-photo" />
                ) : (
                  getInitials()
                )}
                {uploadingPhoto && (
                  <div className="photo-upload-overlay">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>
              <button 
                className="photo-upload-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change profile photo"
              >
                <i className="fas fa-camera"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <h3 className="profile-name">{formData.name || user?.email}</h3>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Bookings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Reviews</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              {!editing ? (
                <button className="btn-edit" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="section-divider">
                <h3>Address Information</h3>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your state"
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card security-card">
            <div className="card-header">
              <div className="card-header-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2>Account Security</h2>
            </div>
            <div className="security-section">
              <div className="security-item">
                <div className="security-icon password-icon">
                  <i className="fas fa-key"></i>
                </div>
                <div className="security-info">
                  <h4>Password</h4>
                  <p className="security-status">
                    <i className="fas fa-clock"></i>
                    Last changed: {profile?.passwordChangedAt 
                      ? new Date(profile.passwordChangedAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })
                      : 'Never'}
                  </p>
                  {resetEmailSent ? (
                    <p className="security-tip success-tip">
                      <i className="fas fa-check-circle"></i>
                      Password reset link sent! Check your inbox.
                    </p>
                  ) : (
                    <p className="security-tip">Use a strong password with letters, numbers & symbols</p>
                  )}
                </div>
                <button 
                  className="btn-security" 
                  onClick={handleSendPasswordResetEmail}
                  disabled={sendingResetEmail || resetEmailSent}
                >
                  {sendingResetEmail ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : resetEmailSent ? (
                    <>
                      <i className="fas fa-check"></i>
                      Email Sent
                    </>
                  ) : (
                    <>
                      <i className="fas fa-envelope"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
              
              <div className="security-divider"></div>
              
              <div className="security-item">
                <div className="security-icon twofa-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p className="security-status">
                    <i className="fas fa-times-circle status-disabled"></i>
                    Currently disabled
                  </p>
                  <p className="security-tip">Add an extra layer of security to your account</p>
                </div>
                <button className="btn-security btn-security-enable">
                  <i className="fas fa-shield-alt"></i>
                  Enable 2FA
                </button>
              </div>
              
              <div className="security-divider"></div>
              
              <div className="security-item">
                <div className="security-icon sessions-icon">
                  <i className="fas fa-laptop"></i>
                </div>
                <div className="security-info">
                  <h4>Active Sessions</h4>
                  <p className="security-status">
                    <i className="fas fa-check-circle status-active"></i>
                    1 active session
                  </p>
                  <p className="security-tip">Manage devices where you're logged in</p>
                </div>
                <button className="btn-security btn-security-view">
                  <i className="fas fa-eye"></i>
                  View All
                </button>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h2>Preferences</h2>
            </div>
            <div className="preferences-section">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Email Notifications</h4>
                  <p>Receive booking updates and offers via email</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4>SMS Notifications</h4>
                  <p>Receive booking confirmations via SMS</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Promotional Offers</h4>
                  <p>Get exclusive deals and discounts</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <i className="fas fa-key"></i>
              </div>
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              {passwordError && (
                <div className="password-alert error">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="password-alert success">
                  <i className="fas fa-check-circle"></i>
                  {passwordSuccess}
                </div>
              )}

              <div className="password-form-group">
                <label>
                  <i className="fas fa-lock"></i>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="current-password"
                />
              </div>

              <div className="password-form-group">
                <label>
                  <i className="fas fa-key"></i>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  required
                  minLength="6"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="new-password"
                />
              </div>

              <div className="password-form-group">
                <label>
                  <i className="fas fa-check-double"></i>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="new-password"
                />
              </div>

              <div className="password-requirements">
                <p><i className="fas fa-info-circle"></i> Password Requirements:</p>
                <ul>
                  <li className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                    <i className={`fas ${passwordData.newPassword.length >= 6 ? 'fa-check' : 'fa-circle'}`}></i>
                    At least 6 characters
                  </li>
                  <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                    <i className={`fas ${/[A-Z]/.test(passwordData.newPassword) ? 'fa-check' : 'fa-circle'}`}></i>
                    One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(passwordData.newPassword) ? 'valid' : ''}>
                    <i className={`fas ${/[0-9]/.test(passwordData.newPassword) ? 'fa-check' : 'fa-circle'}`}></i>
                    One number
                  </li>
                </ul>
              </div>

              <div className="password-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-change-password" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
