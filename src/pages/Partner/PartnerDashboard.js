import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getPartnerById, 
  getPartnerBookings, 
  getPartnerCommissionStats,
  updatePartnerProfile 
} from '../../services/partnerService';
import '../../styles/partnerDashboard.css';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Check if partner is logged in
  useEffect(() => {
    const storedPartner = localStorage.getItem('partnerSession');
    if (!storedPartner) {
      navigate('/agent-login');
      return;
    }
    
    const partnerSession = JSON.parse(storedPartner);
    loadPartnerData(partnerSession.id);
  }, [navigate]);

  const loadPartnerData = useCallback(async (partnerId) => {
    setLoading(true);
    try {
      const [partnerData, bookingsData, statsData] = await Promise.all([
        getPartnerById(partnerId),
        getPartnerBookings(partnerId),
        getPartnerCommissionStats(partnerId)
      ]);

      if (partnerData) {
        setPartner(partnerData);
        setProfileData({
          companyName: partnerData.companyName,
          address1: partnerData.address1,
          address2: partnerData.address2,
          city: partnerData.city,
          state: partnerData.state,
          pincode: partnerData.pincode,
          landline: partnerData.landline,
          mobile: partnerData.mobile
        });
      }
      setBookings(bookingsData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading partner data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerSession');
    navigate('/agent-login');
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const success = await updatePartnerProfile(partner.id, profileData);
      if (success) {
        showNotification('Profile updated successfully!', 'success');
        setEditMode(false);
        loadPartnerData(partner.id);
      } else {
        showNotification('Failed to update profile', 'error');
      }
    } catch (error) {
      showNotification('Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="partner-dashboard-loading">
        <div className="loader-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="partner-dashboard-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Session Expired</h2>
        <p>Please login again to access your dashboard.</p>
        <button onClick={() => navigate('/agent-login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="partner-dashboard">
      {/* Notification */}
      {notification.show && (
        <div className={`pd-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="pd-sidebar">
        <div className="pd-sidebar-header">
          <Link to="/" className="pd-logo">
            <i className="fas fa-plane-departure"></i>
            <span>TravelAxis</span>
          </Link>
        </div>

        <div className="pd-partner-info">
          <div className="pd-partner-avatar">
            <i className="fas fa-building"></i>
          </div>
          <h3>{partner.companyName}</h3>
          <p className="pd-partner-id">
            <i className="fas fa-id-badge"></i> {partner.partnerId}
          </p>
          <span className="pd-status-badge approved">Approved Partner</span>
        </div>

        <nav className="pd-nav">
          <button 
            className={`pd-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-th-large"></i>
            <span>Overview</span>
          </button>
          <button 
            className={`pd-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>My Bookings</span>
          </button>
          <button 
            className={`pd-nav-item ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <i className="fas fa-wallet"></i>
            <span>Commissions</span>
          </button>
          <button 
            className={`pd-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user-cog"></i>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="pd-sidebar-footer">
          <button className="pd-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pd-main">
        {/* Header */}
        <header className="pd-header">
          <div className="pd-header-left">
            <h1>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'commissions' && 'Commission Earnings'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
            <p className="pd-welcome">Welcome back, {partner.contactFirstName}!</p>
          </div>
          <div className="pd-header-right">
            <Link to="/" className="pd-new-booking-btn">
              <i className="fas fa-plus"></i>
              <span>New Booking</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="pd-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="pd-overview">
              {/* Stats Grid */}
              <div className="pd-stats-grid">
                <div className="pd-stat-card earnings">
                  <div className="pd-stat-icon">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                  <div className="pd-stat-info">
                    <span className="pd-stat-value">{formatCurrency(stats?.totalEarnings || 0)}</span>
                    <span className="pd-stat-label">Total Earnings</span>
                  </div>
                </div>
                <div className="pd-stat-card bookings">
                  <div className="pd-stat-icon">
                    <i className="fas fa-suitcase"></i>
                  </div>
                  <div className="pd-stat-info">
                    <span className="pd-stat-value">{stats?.totalBookings || 0}</span>
                    <span className="pd-stat-label">Total Bookings</span>
                  </div>
                </div>
                <div className="pd-stat-card pending">
                  <div className="pd-stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="pd-stat-info">
                    <span className="pd-stat-value">{formatCurrency(stats?.pendingCommission || 0)}</span>
                    <span className="pd-stat-label">Pending Commission</span>
                  </div>
                </div>
                <div className="pd-stat-card monthly">
                  <div className="pd-stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="pd-stat-info">
                    <span className="pd-stat-value">{formatCurrency(stats?.thisMonthEarnings || 0)}</span>
                    <span className="pd-stat-label">This Month</span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="pd-section">
                <div className="pd-section-header">
                  <h2>Recent Bookings</h2>
                  <button onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                <div className="pd-bookings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Destination</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(booking => (
                        <tr key={booking.id}>
                          <td><strong>{booking.id}</strong></td>
                          <td>{booking.customerName}</td>
                          <td>{booking.destination}</td>
                          <td>{formatDate(booking.date)}</td>
                          <td>{formatCurrency(booking.amount)}</td>
                          <td className="commission">{formatCurrency(booking.commission)}</td>
                          <td>
                            <span className={`booking-status ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pd-quick-actions">
                <h2>Quick Actions</h2>
                <div className="pd-actions-grid">
                  <Link to="/hotels" className="pd-action-card">
                    <i className="fas fa-hotel"></i>
                    <span>Book Hotel</span>
                  </Link>
                  <Link to="/flights" className="pd-action-card">
                    <i className="fas fa-plane"></i>
                    <span>Book Flight</span>
                  </Link>
                  <Link to="/tour" className="pd-action-card">
                    <i className="fas fa-map-marked-alt"></i>
                    <span>Book Tour</span>
                  </Link>
                  <button className="pd-action-card" onClick={() => setActiveTab('commissions')}>
                    <i className="fas fa-file-invoice-dollar"></i>
                    <span>View Earnings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="pd-bookings">
              <div className="pd-bookings-header">
                <div className="pd-bookings-filters">
                  <input type="text" placeholder="Search bookings..." />
                  <select>
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="pd-bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Destination</th>
                      <th>Travel Date</th>
                      <th>Amount</th>
                      <th>Commission</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td><strong>{booking.id}</strong></td>
                        <td>{booking.customerName}</td>
                        <td>{booking.destination}</td>
                        <td>{formatDate(booking.date)}</td>
                        <td>{formatCurrency(booking.amount)}</td>
                        <td className="commission">{formatCurrency(booking.commission)}</td>
                        <td>
                          <span className={`booking-status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button className="pd-view-btn">
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <div className="pd-commissions">
              <div className="pd-commission-summary">
                <div className="pd-commission-card total">
                  <i className="fas fa-coins"></i>
                  <div>
                    <h3>Total Earnings</h3>
                    <span className="amount">{formatCurrency(stats?.totalEarnings || 0)}</span>
                  </div>
                </div>
                <div className="pd-commission-card pending">
                  <i className="fas fa-hourglass-half"></i>
                  <div>
                    <h3>Pending Payout</h3>
                    <span className="amount">{formatCurrency(stats?.pendingCommission || 0)}</span>
                  </div>
                </div>
                <div className="pd-commission-card paid">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h3>Total Paid</h3>
                    <span className="amount">{formatCurrency(stats?.paidCommission || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="pd-section">
                <div className="pd-section-header">
                  <h2>Commission History</h2>
                </div>
                <div className="pd-bookings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Booking Amount</th>
                        <th>Commission (5%)</th>
                        <th>Status</th>
                        <th>Payout Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id}>
                          <td><strong>{booking.id}</strong></td>
                          <td>{booking.customerName}</td>
                          <td>{formatCurrency(booking.amount)}</td>
                          <td className="commission">{formatCurrency(booking.commission)}</td>
                          <td>
                            <span className={`booking-status ${booking.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                              {booking.status === 'confirmed' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td>{booking.status === 'confirmed' ? formatDate(booking.date) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="pd-profile">
              <div className="pd-profile-header">
                <div className="pd-profile-avatar">
                  <i className="fas fa-building"></i>
                </div>
                <div className="pd-profile-info">
                  <h2>{partner.companyName}</h2>
                  <p>Partner ID: {partner.partnerId}</p>
                  <p><i className="fas fa-envelope"></i> {partner.email}</p>
                  <p><i className="fas fa-phone"></i> {partner.mobile}</p>
                </div>
                {!editMode && (
                  <button className="pd-edit-btn" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </div>

              <div className="pd-profile-sections">
                <div className="pd-profile-section">
                  <h3><i className="fas fa-building"></i> Company Information</h3>
                  {editMode ? (
                    <div className="pd-form-grid">
                      <div className="pd-form-group">
                        <label>Company Name</label>
                        <input 
                          type="text" 
                          name="companyName"
                          value={profileData.companyName}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="pd-form-group">
                        <label>Address Line 1</label>
                        <input 
                          type="text" 
                          name="address1"
                          value={profileData.address1}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="pd-form-group">
                        <label>Address Line 2</label>
                        <input 
                          type="text" 
                          name="address2"
                          value={profileData.address2 || ''}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="pd-form-group">
                        <label>City</label>
                        <input 
                          type="text" 
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="pd-form-group">
                        <label>State</label>
                        <input 
                          type="text" 
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="pd-form-group">
                        <label>Pincode</label>
                        <input 
                          type="text" 
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pd-info-grid">
                      <div className="pd-info-item">
                        <label>Company Name</label>
                        <span>{partner.companyName}</span>
                      </div>
                      <div className="pd-info-item full-width">
                        <label>Address</label>
                        <span>
                          {partner.address1}
                          {partner.address2 && `, ${partner.address2}`}
                          <br />
                          {partner.city}, {partner.state} - {partner.pincode}
                        </span>
                      </div>
                      <div className="pd-info-item">
                        <label>Country</label>
                        <span>{partner.country}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pd-profile-section">
                  <h3><i className="fas fa-user"></i> Contact Person</h3>
                  <div className="pd-info-grid">
                    <div className="pd-info-item">
                      <label>Name</label>
                      <span>{partner.title} {partner.contactFirstName} {partner.contactLastName}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>Email</label>
                      <span>{partner.email}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>Mobile</label>
                      <span>{partner.mobile}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>Landline</label>
                      <span>{partner.landline || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="pd-profile-section">
                  <h3><i className="fas fa-briefcase"></i> Business Details</h3>
                  <div className="pd-info-grid">
                    <div className="pd-info-item">
                      <label>PAN Number</label>
                      <span>{partner.panNumber}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>PAN Holder Name</label>
                      <span>{partner.panCardHolderName}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>Monthly Sales Volume</label>
                      <span>{partner.monthlySalesVolume}</span>
                    </div>
                    <div className="pd-info-item">
                      <label>IATA Code</label>
                      <span>{partner.iata || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="pd-form-actions">
                    <button 
                      className="pd-save-btn" 
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      className="pd-cancel-btn" 
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;
