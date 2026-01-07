import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import '../../styles/myProfile.css';

export default function MyProfile() {
  const { user, profile } = useAuth();
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
    pincode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setFormData({
        name: profile.name || user.displayName || '',
        email: user.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      });
    }
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

  return (
    <div className="my-profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {getInitials()}
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

          <div className="profile-card">
            <div className="card-header">
              <h2>Account Security</h2>
            </div>
            <div className="security-section">
              <div className="security-item">
                <div className="security-info">
                  <h4>Password</h4>
                  <p>Last changed: Never</p>
                </div>
                <button className="btn-secondary">Change Password</button>
              </div>
              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security</p>
                </div>
                <button className="btn-secondary">Enable 2FA</button>
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
    </div>
  );
}
