import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { sendCustomerPasswordResetEmail, sendCustomerPasswordChangedEmail } from '../../services/emailService';
import '../../styles/customerDashboard.css';

export default function CustomerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL query params
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [ecashBalance, setEcashBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refundBookings, setRefundBookings] = useState([]);
  
  // Profile states
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
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password states
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
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Booking form states
  const [bookingRef, setBookingRef] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal states
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
    { id: 'profile', label: 'My Profile', icon: 'fas fa-user-circle' },
    { id: 'journeys', label: 'My Journeys', icon: 'fas fa-suitcase-rolling' },
    { id: 'refund', label: 'My Refund', icon: 'fas fa-undo-alt' },
    { id: 'ecash', label: 'My eCash', icon: 'fas fa-wallet' },
    { id: 'track-refund', label: 'Track Refund', icon: 'fas fa-search-dollar' },
    { id: 'complete-booking', label: 'Complete Booking', icon: 'fas fa-clipboard-check' },
    { id: 'make-payment', label: 'Make Payment', icon: 'fas fa-credit-card' },
    { id: 'holiday-booking', label: 'Holiday Booking', icon: 'fas fa-umbrella-beach' }
  ];

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', activeTab);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  }, [activeTab, location.pathname, navigate]);

  // Listen for URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Fetch all data on mount
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBookings(),
        fetchECashData(),
        fetchProfileData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setRefundBookings(bookingsData.filter(
        booking => booking.status === 'confirmed' || booking.status === 'cancelled' || booking.status === 'refund-requested'
      ));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchECashData = async () => {
    if (!user) return;
    try {
      const ecashRef = doc(db, 'ecash', user.uid);
      const ecashDoc = await getDoc(ecashRef);
      if (ecashDoc.exists()) {
        const data = ecashDoc.data();
        setEcashBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } else {
        await setDoc(ecashRef, {
          userId: user.uid,
          balance: 0,
          transactions: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching eCash data:', error);
    }
  };

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      // Update display name in Firebase Auth (photoURL is stored in Firestore only for base64 images)
      if (formData.name && formData.name !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: formData.name });
      }
      // Refresh profile in context so Navbar updates
      await refreshProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Password handlers
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
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { passwordChangedAt: new Date().toISOString() });
      
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
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError(error.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    setSendingResetEmail(true);
    setResetEmailSent(false);
    try {
      await sendPasswordResetEmail(auth, user.email);
      await sendCustomerPasswordResetEmail({
        email: user.email,
        name: formData.name || user.displayName || 'Valued Customer'
      });
      setResetEmailSent(true);
    } catch (error) {
      alert('Failed to send password reset email');
    } finally {
      setSendingResetEmail(false);
    }
  };

  // eCash handlers
  const handleAddCash = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount < 100) {
      alert('Minimum amount is ₹100');
      return;
    }
    try {
      const ecashRef = doc(db, 'ecash', user.uid);
      const newTransaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: amount,
        description: 'Money added to wallet',
        date: new Date().toISOString(),
        status: 'completed'
      };
      const ecashDoc = await getDoc(ecashRef);
      const currentTransactions = ecashDoc.data()?.transactions || [];
      await updateDoc(ecashRef, {
        balance: increment(amount),
        transactions: [newTransaction, ...currentTransactions]
      });
      setEcashBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      setShowAddCashModal(false);
      setAddAmount('');
      alert('Money added successfully!');
    } catch (error) {
      alert('Failed to add money');
    }
  };

  // Refund handlers
  const calculateRefundAmount = (booking) => {
    const totalAmount = booking.totalAmount || 0;
    return totalAmount - (totalAmount * 0.1);
  };

  const openRefundModal = (booking) => {
    setSelectedBooking(booking);
    setRefundAmount(calculateRefundAmount(booking));
    setShowRefundModal(true);
  };

  const handleRefundRequest = async () => {
    if (!selectedBooking || !refundReason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }
    try {
      const bookingRefDoc = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRefDoc, {
        status: 'refund-requested',
        refundReason,
        refundAmount,
        refundRequestDate: new Date().toISOString()
      });
      alert('Refund request submitted successfully!');
      setShowRefundModal(false);
      setSelectedBooking(null);
      setRefundReason('');
      fetchBookings();
    } catch (error) {
      alert('Failed to submit refund request');
    }
  };

  // Booking handlers
  const handleCompleteBooking = (e) => {
    e.preventDefault();
    if (bookingRef.trim()) {
      alert(`Retrieving booking details for: ${bookingRef}`);
    }
  };

  const handleMakePayment = (e) => {
    e.preventDefault();
    if (bookingRef.trim() && bookingEmail.trim()) {
      alert(`Processing payment for booking: ${bookingRef}`);
    }
  };

  // Filter helpers
  const getFilteredBookings = () => {
    if (activeFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === activeFilter);
  };

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed', icon: 'fas fa-check-circle' },
      pending: { class: 'status-pending', text: 'Pending', icon: 'fas fa-clock' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled', icon: 'fas fa-times-circle' },
      completed: { class: 'status-completed', text: 'Completed', icon: 'fas fa-flag-checkered' },
      'refund-requested': { class: 'status-refund', text: 'Refund Requested', icon: 'fas fa-undo' }
    };
    const c = config[status] || config.pending;
    return <span className={`status-badge ${c.class}`}><i className={c.icon}></i> {c.text}</span>;
  };

  // Handle tab click with mobile sidebar close
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'journeys':
        return renderJourneys();
      case 'refund':
      case 'track-refund':
        return renderRefund();
      case 'ecash':
        return renderECash();
      case 'profile':
        return renderProfile();
      case 'complete-booking':
        return renderCompleteBooking();
      case 'make-payment':
        return renderMakePayment();
      case 'holiday-booking':
        return renderHolidayBooking();
      default:
        return renderOverview();
    }
  };

  // Overview Tab
  const renderOverview = () => (
    <div className="overview-content">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {profile?.name || user?.displayName || 'Traveler'}! 👋</h2>
          <p>Ready for your next adventure? Explore destinations and book your dream trip.</p>
        </div>
        <div className="welcome-illustration">
          <i className="fas fa-plane-departure"></i>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('journeys')}>
          <div className="stat-icon journeys">
            <i className="fas fa-suitcase-rolling"></i>
          </div>
          <div className="stat-info">
            <h3>{bookings.length}</h3>
            <p>Total Journeys</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('ecash')}>
          <div className="stat-icon ecash">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-info">
            <h3>₹{ecashBalance.toLocaleString()}</h3>
            <p>eCash Balance</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('refund')}>
          <div className="stat-icon refund">
            <i className="fas fa-undo-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{refundBookings.filter(b => b.status === 'refund-requested').length}</h3>
            <p>Pending Refunds</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('profile')}>
          <div className="stat-icon profile">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Profile</h3>
            <p>Manage Account</p>
          </div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="section-card recent-bookings">
          <div className="section-header">
            <h3><i className="fas fa-history"></i> Recent Bookings</h3>
            <button className="view-all-btn" onClick={() => setActiveTab('journeys')}>View All</button>
          </div>
          {bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.slice(0, 3).map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="booking-details">
                    <h4>{booking.destination || booking.packageName || 'Trip'}</h4>
                    <p>{booking.travelDate || 'Date not set'}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-suitcase"></i>
              <p>No bookings yet. Start exploring!</p>
              <button className="explore-btn" onClick={() => navigate('/tour')}>
                <i className="fas fa-compass"></i> Explore Tours
              </button>
            </div>
          )}
        </div>

        <div className="section-card quick-actions">
          <div className="section-header">
            <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setActiveTab('complete-booking')}>
              <i className="fas fa-clipboard-check"></i>
              <span>Complete Booking</span>
            </button>
            <button className="action-btn" onClick={() => setActiveTab('make-payment')}>
              <i className="fas fa-credit-card"></i>
              <span>Make Payment</span>
            </button>
            <button className="action-btn" onClick={() => setActiveTab('holiday-booking')}>
              <i className="fas fa-umbrella-beach"></i>
              <span>Holiday Package</span>
            </button>
            <button className="action-btn" onClick={() => setActiveTab('track-refund')}>
              <i className="fas fa-search-dollar"></i>
              <span>Track Refund</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Journeys Tab
  const renderJourneys = () => (
    <div className="journeys-content">
      <div className="content-header">
        <h2><i className="fas fa-suitcase-rolling"></i> My Journeys</h2>
        <p>Track and manage all your bookings</p>
      </div>

      <div className="filter-tabs">
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(filter => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {getFilteredBookings().length > 0 ? (
        <div className="bookings-grid">
          {getFilteredBookings().map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div className="booking-type">
                  <i className={booking.type === 'hotel' ? 'fas fa-hotel' : 'fas fa-plane'}></i>
                  <span>{booking.type || 'Trip'}</span>
                </div>
                {getStatusBadge(booking.status)}
              </div>
              <div className="booking-card-body">
                <h3>{booking.destination || booking.packageName || 'Trip Details'}</h3>
                <div className="booking-meta">
                  <span><i className="fas fa-calendar"></i> {booking.travelDate || 'N/A'}</span>
                  <span><i className="fas fa-users"></i> {booking.guests || 1} Guest(s)</span>
                </div>
                <div className="booking-amount">
                  <span className="amount">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="booking-card-footer">
                <button className="btn-view">View Details</button>
                {booking.status === 'confirmed' && (
                  <button className="btn-cancel" onClick={() => openRefundModal(booking)}>Request Refund</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <i className="fas fa-route"></i>
          <h3>No journeys found</h3>
          <p>Start planning your next adventure!</p>
          <button className="primary-btn" onClick={() => navigate('/tour')}>
            <i className="fas fa-compass"></i> Explore Destinations
          </button>
        </div>
      )}
    </div>
  );

  // Refund Tab
  const renderRefund = () => (
    <div className="refund-content">
      <div className="content-header">
        <h2><i className="fas fa-undo-alt"></i> {activeTab === 'track-refund' ? 'Track Refund' : 'My Refunds'}</h2>
        <p>Request and track your refunds</p>
      </div>

      <div className="refund-stats">
        <div className="refund-stat-card">
          <i className="fas fa-clock"></i>
          <div>
            <h4>{refundBookings.filter(b => b.status === 'refund-requested').length}</h4>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="refund-stat-card success">
          <i className="fas fa-check-circle"></i>
          <div>
            <h4>{refundBookings.filter(b => b.status === 'refunded').length}</h4>
            <p>Completed Refunds</p>
          </div>
        </div>
      </div>

      {refundBookings.length > 0 ? (
        <div className="refund-list">
          {refundBookings.map(booking => (
            <div key={booking.id} className="refund-card">
              <div className="refund-card-left">
                <div className="refund-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="refund-details">
                  <h4>{booking.destination || booking.packageName || 'Booking'}</h4>
                  <p>Booking ID: {booking.id.slice(0, 8)}...</p>
                  <span className="refund-date">{booking.travelDate}</span>
                </div>
              </div>
              <div className="refund-card-right">
                <div className="refund-amount">₹{(booking.totalAmount || 0).toLocaleString()}</div>
                {getStatusBadge(booking.status)}
                {booking.status === 'confirmed' && (
                  <button className="btn-request-refund" onClick={() => openRefundModal(booking)}>
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <i className="fas fa-smile"></i>
          <h3>No refund requests</h3>
          <p>All your bookings are active!</p>
        </div>
      )}
    </div>
  );

  // eCash Tab
  const renderECash = () => (
    <div className="ecash-content">
      <div className="content-header">
        <h2><i className="fas fa-wallet"></i> My eCash</h2>
        <p>Manage your wallet and transactions</p>
      </div>

      <div className="ecash-balance-card">
        <div className="balance-info">
          <span className="balance-label">Available Balance</span>
          <h2 className="balance-amount">₹{ecashBalance.toLocaleString()}</h2>
        </div>
        <button className="add-money-btn" onClick={() => setShowAddCashModal(true)}>
          <i className="fas fa-plus"></i> Add Money
        </button>
      </div>

      <div className="transactions-section">
        <h3><i className="fas fa-history"></i> Transaction History</h3>
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map(txn => (
              <div key={txn.id} className={`transaction-item ${txn.type}`}>
                <div className="txn-icon">
                  <i className={txn.type === 'credit' ? 'fas fa-arrow-down' : 'fas fa-arrow-up'}></i>
                </div>
                <div className="txn-details">
                  <h4>{txn.description}</h4>
                  <span className="txn-date">{new Date(txn.date).toLocaleDateString()}</span>
                </div>
                <div className={`txn-amount ${txn.type}`}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-receipt"></i>
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );

  // Profile Tab
  const renderProfile = () => {
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Image size should be less than 2MB');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, photoURL: reader.result });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
    <div className="profile-content">
      <div className="content-header">
        <h2><i className="fas fa-user-circle"></i> My Profile</h2>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-card">
        <div className="profile-header-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {formData.photoURL ? (
                <img src={formData.photoURL} alt={formData.name} />
              ) : (
                <span>{formData.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            {editing && (
              <label className="avatar-upload-btn">
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          <div className="profile-name-section">
            <h3>{formData.name || 'User'}</h3>
            <p>{formData.email}</p>
          </div>
          <button className="edit-profile-btn" onClick={() => setEditing(!editing)}>
            <i className={editing ? 'fas fa-times' : 'fas fa-edit'}></i>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleProfileChange}
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
                onChange={handleProfileChange}
                disabled={!editing}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleProfileChange}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleProfileChange}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleProfileChange}
                disabled={!editing}
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleProfileChange}
              disabled={!editing}
              rows={3}
            />
          </div>

          {editing && (
            <div className="form-actions">
              <button className="save-btn" onClick={handleProfileSave} disabled={profileLoading}>
                {profileLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="password-section">
          <h4><i className="fas fa-lock"></i> Password & Security</h4>
          <div className="password-actions">
            <button className="password-btn" onClick={() => setShowPasswordModal(true)}>
              <i className="fas fa-key"></i> Change Password
            </button>
            <button 
              className="password-btn secondary" 
              onClick={handleSendPasswordResetEmail}
              disabled={sendingResetEmail}
            >
              <i className="fas fa-envelope"></i> 
              {sendingResetEmail ? 'Sending...' : resetEmailSent ? 'Email Sent!' : 'Send Reset Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Complete Booking Tab
  const renderCompleteBooking = () => (
    <div className="complete-booking-content">
      <div className="content-header">
        <h2><i className="fas fa-clipboard-check"></i> Complete Booking</h2>
        <p>Retrieve your pending booking and complete the payment</p>
      </div>

      <div className="form-card">
        <div className="form-card-icon">
          <i className="fas fa-ticket-alt"></i>
        </div>
        <h3>Enter Booking Reference</h3>
        <form onSubmit={handleCompleteBooking}>
          <div className="form-group">
            <label>Booking Reference Number *</label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="Enter your booking reference"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            <i className="fas fa-search"></i> Find Booking
          </button>
        </form>
        <div className="info-box">
          <h4>How to find your booking reference?</h4>
          <ul>
            <li><i className="fas fa-check"></i> Check your email for booking confirmation</li>
            <li><i className="fas fa-check"></i> Look for a 6-10 character alphanumeric code</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Make Payment Tab
  const renderMakePayment = () => (
    <div className="make-payment-content">
      <div className="content-header">
        <h2><i className="fas fa-credit-card"></i> Make Payment</h2>
        <p>Complete your booking payment securely</p>
      </div>

      <div className="form-card">
        <div className="form-card-icon payment">
          <i className="fas fa-lock"></i>
        </div>
        <h3>Payment Details</h3>
        <form onSubmit={handleMakePayment}>
          <div className="form-group">
            <label>Booking Reference Number *</label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="Enter booking reference"
              required
            />
          </div>
          <div className="form-group">
            <label>Your Email ID *</label>
            <input
              type="email"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="submit-btn payment">
            <i className="fas fa-lock"></i> Continue to Payment
          </button>
        </form>
        <div className="payment-methods-info">
          <span>We Accept:</span>
          <div className="payment-icons">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-amex"></i>
            <i className="fas fa-mobile-alt"></i>
          </div>
        </div>
      </div>
    </div>
  );

  // Holiday Booking Tab
  const renderHolidayBooking = () => (
    <div className="holiday-booking-content">
      <div className="content-header">
        <h2><i className="fas fa-umbrella-beach"></i> Holiday Booking</h2>
        <p>Complete your dream vacation package</p>
      </div>

      <div className="form-card holiday">
        <div className="form-card-icon holiday">
          <i className="fas fa-palm-tree"></i>
        </div>
        <h3>Holiday Package Details</h3>
        <form onSubmit={handleMakePayment}>
          <div className="form-group">
            <label>Booking Reference Number *</label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="Enter booking reference"
              required
            />
          </div>
          <div className="form-group">
            <label>Your Email ID *</label>
            <input
              type="email"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="submit-btn holiday">
            <i className="fas fa-check-circle"></i> Complete Holiday Booking
          </button>
        </form>
        <div className="benefits-box">
          <h4>Why Book With Us?</h4>
          <div className="benefits-grid">
            <span><i className="fas fa-tag"></i> Best Prices</span>
            <span><i className="fas fa-shield-alt"></i> Secure Payment</span>
            <span><i className="fas fa-headset"></i> 24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-background">
          <div className="header-blob blob-1"></div>
          <div className="header-blob blob-2"></div>
        </div>
        <div className="header-content">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={sidebarOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
          <div className="user-info">
            <div className="user-avatar-large">
              {formData.photoURL ? (
                <img src={formData.photoURL} alt={formData.name} />
              ) : (
                <span>{(profile?.name || user?.displayName || 'U').charAt(0)}</span>
              )}
            </div>
            <div className="user-details">
              <h1>Hello, {profile?.name || user?.displayName || 'Traveler'}!</h1>
              <p>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-body">
        {/* Sidebar Navigation */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button
            className="home-nav-btn"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </button>
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

        {/* Content Area */}
        <main className="dashboard-content">
          {renderTabContent()}
        </main>
      </div>

      {/* Add Cash Modal */}
      {showAddCashModal && (
        <div className="modal-overlay" onClick={() => setShowAddCashModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddCashModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3><i className="fas fa-wallet"></i> Add Money to eCash</h3>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount (min ₹100)"
                min="100"
              />
            </div>
            <div className="quick-amounts">
              {[500, 1000, 2000, 5000].map(amt => (
                <button key={amt} onClick={() => setAddAmount(amt.toString())}>
                  ₹{amt}
                </button>
              ))}
            </div>
            <button className="modal-submit-btn" onClick={handleAddCash}>
              <i className="fas fa-plus"></i> Add Money
            </button>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content password-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="password-modal-header">
              <div className="password-icon-circle">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Password & Security</h3>
              <p>Update your password to keep your account secure</p>
            </div>
            {passwordError && <div className="alert error"><i className="fas fa-exclamation-circle"></i> {passwordError}</div>}
            {passwordSuccess && <div className="alert success"><i className="fas fa-check-circle"></i> {passwordSuccess}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group password-field">
                <label><i className="fas fa-lock"></i> Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter your current password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="form-group password-field">
                <label><i className="fas fa-key"></i> New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter your new password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <small className="password-hint">Password must be at least 6 characters long</small>
              </div>
              <div className="form-group password-field">
                <label><i className="fas fa-check-double"></i> Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button type="submit" className="modal-submit-btn password-submit" disabled={passwordLoading}>
                {passwordLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                ) : (
                  <><i className="fas fa-save"></i> Update Password</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRefundModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h3><i className="fas fa-undo"></i> Request Refund</h3>
            <div className="refund-details-box">
              <p><strong>Booking:</strong> {selectedBooking.destination || selectedBooking.packageName}</p>
              <p><strong>Amount:</strong> ₹{(selectedBooking.totalAmount || 0).toLocaleString()}</p>
              <p><strong>Refund Amount:</strong> ₹{refundAmount.toLocaleString()} <small>(10% cancellation fee applied)</small></p>
            </div>
            <div className="form-group">
              <label>Reason for Refund *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please provide a reason for your refund request"
                rows={4}
                required
              />
            </div>
            <button className="modal-submit-btn refund" onClick={handleRefundRequest}>
              <i className="fas fa-paper-plane"></i> Submit Refund Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
