import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import '../../styles/myBookings.css';

export default function MyBookings() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [user]);

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
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (status) => {
    setActiveFilter(status);
  };

  const getFilteredBookings = () => {
    if (activeFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === activeFilter);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      pending: { class: 'status-pending', text: 'Pending' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' },
      completed: { class: 'status-completed', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <div className="header-content">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage all your travel bookings in one place</p>
        </div>
      </div>

      <div className="bookings-content">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => filterBookings('all')}
          >
            All Bookings ({bookings.length})
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => filterBookings('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => filterBookings('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => filterBookings('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => filterBookings('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {getFilteredBookings().length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>You don't have any {activeFilter !== 'all' ? activeFilter : ''} bookings yet.</p>
            <button className="btn-explore" onClick={() => window.location.href = '/tours'}>
              Explore Tours
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {getFilteredBookings().map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header-section">
                  <div className="booking-type">
                    <span className="type-icon">
                      {booking.type === 'tour' && '🗺️'}
                      {booking.type === 'hotel' && '🏨'}
                      {booking.type === 'flight' && '✈️'}
                      {booking.type === 'vehicle' && '🚗'}
                    </span>
                    <span className="type-text">{booking.type?.toUpperCase()}</span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-details">
                  <h3 className="booking-title">{booking.title || booking.name}</h3>
                  <div className="booking-info">
                    <div className="info-item">
                      <span className="info-label">Booking ID:</span>
                      <span className="info-value">{booking.bookingId || booking.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Booking Date:</span>
                      <span className="info-value">
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Travel Date:</span>
                      <span className="info-value">
                        {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {booking.guests && (
                      <div className="info-item">
                        <span className="info-label">Guests:</span>
                        <span className="info-value">{booking.guests}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="booking-price">
                    <span className="price-label">Total Amount:</span>
                    <span className="price-value">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="booking-actions">
                    <button className="btn-secondary">View Details</button>
                    {booking.status === 'confirmed' && (
                      <button className="btn-primary">Download Voucher</button>
                    )}
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <button className="btn-danger">Cancel Booking</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
