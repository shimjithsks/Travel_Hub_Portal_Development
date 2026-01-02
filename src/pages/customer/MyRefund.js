import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import '../../styles/myRefund.css';

export default function MyRefund() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    fetchCancellableBookings();
  }, [user]);

  const fetchCancellableBookings = async () => {
    if (!user) return;
    
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter bookings that can be refunded (cancelled or eligible for cancellation)
      const refundableBookings = bookingsData.filter(
        booking => booking.status === 'confirmed' || booking.status === 'cancelled'
      );
      
      setBookings(refundableBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (booking) => {
    setSelectedBooking(booking);
    setRefundAmount(calculateRefundAmount(booking));
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedBooking(null);
    setRefundReason('');
  };

  const calculateRefundAmount = (booking) => {
    // Simple refund calculation - can be made more complex based on cancellation policy
    const totalAmount = booking.totalAmount || 0;
    const cancellationCharge = totalAmount * 0.1; // 10% cancellation charge
    return totalAmount - cancellationCharge;
  };

  const handleRefundRequest = async () => {
    if (!selectedBooking || !refundReason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, {
        status: 'refund-requested',
        refundReason,
        refundAmount,
        refundRequestDate: new Date().toISOString()
      });

      alert('Refund request submitted successfully!');
      closeRefundModal();
      fetchCancellableBookings();
    } catch (error) {
      console.error('Error requesting refund:', error);
      alert('Failed to submit refund request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="my-refund-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading refund information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-refund-container">
      <div className="refund-header">
        <div className="header-content">
          <h1 className="page-title">My Refunds</h1>
          <p className="page-subtitle">Manage cancellations and refund requests</p>
        </div>
      </div>

      <div className="refund-content">
        <div className="refund-info-card">
          <h3>📋 Refund Policy</h3>
          <ul>
            <li>Cancellations made 7+ days before travel: 90% refund</li>
            <li>Cancellations made 3-7 days before travel: 50% refund</li>
            <li>Cancellations made within 3 days: 25% refund</li>
            <li>Refunds processed within 7-10 business days</li>
          </ul>
        </div>

        {bookings.length === 0 ? (
          <div className="no-refunds">
            <div className="no-refunds-icon">💰</div>
            <h3>No refundable bookings</h3>
            <p>You don't have any bookings eligible for refund at the moment.</p>
            <button className="btn-explore" onClick={() => window.location.href = '/customer/my-bookings'}>
              View All Bookings
            </button>
          </div>
        ) : (
          <div className="refund-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="refund-card">
                <div className="refund-card-header">
                  <div className="booking-type">
                    <span className="type-icon">
                      {booking.type === 'tour' && '🗺️'}
                      {booking.type === 'hotel' && '🏨'}
                      {booking.type === 'flight' && '✈️'}
                      {booking.type === 'vehicle' && '🚗'}
                    </span>
                    <span className="type-text">{booking.type?.toUpperCase()}</span>
                  </div>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status === 'refund-requested' ? 'Refund Requested' : booking.status}
                  </span>
                </div>

                <div className="refund-details">
                  <h3 className="booking-title">{booking.title || booking.name}</h3>
                  <div className="booking-info">
                    <div className="info-item">
                      <span className="info-label">Booking ID:</span>
                      <span className="info-value">{booking.bookingId || booking.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Travel Date:</span>
                      <span className="info-value">
                        {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Booking Amount:</span>
                      <span className="info-value">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Refundable Amount:</span>
                      <span className="info-value refund-amount">
                        ₹{calculateRefundAmount(booking).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="refund-actions">
                  {booking.status === 'refund-requested' ? (
                    <div className="refund-status-info">
                      <p className="status-text">Refund request submitted on {new Date(booking.refundRequestDate).toLocaleDateString()}</p>
                      <p className="status-subtext">We'll process your refund within 7-10 business days</p>
                    </div>
                  ) : (
                    <button 
                      className="btn-request-refund"
                      onClick={() => openRefundModal(booking)}
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Request Modal */}
      {showRefundModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeRefundModal}>
          <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Refund</h2>
              <button className="close-btn" onClick={closeRefundModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="booking-summary">
                <h4>{selectedBooking.title || selectedBooking.name}</h4>
                <p>Booking ID: {selectedBooking.bookingId || selectedBooking.id}</p>
              </div>

              <div className="refund-calculation">
                <div className="calc-row">
                  <span>Original Amount:</span>
                  <span>₹{selectedBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="calc-row">
                  <span>Cancellation Charge (10%):</span>
                  <span className="charge">-₹{(selectedBooking.totalAmount * 0.1).toLocaleString()}</span>
                </div>
                <div className="calc-row total">
                  <span>Refund Amount:</span>
                  <span className="refund-total">₹{refundAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please provide a reason for requesting a refund..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeRefundModal}>Cancel</button>
                <button className="btn-submit" onClick={handleRefundRequest}>Submit Refund Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
