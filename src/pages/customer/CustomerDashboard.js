import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { sendCustomerPasswordResetEmail, sendCustomerPasswordChangedEmail } from '../../services/emailService';
import LoadingSpinner from '../../components/LoadingSpinner';
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
  
  // Vehicle Support Modal states
  const [showCancelVehicleModal, setShowCancelVehicleModal] = useState(false);
  const [showModifyVehicleModal, setShowModifyVehicleModal] = useState(false);
  const [showDriverContactModal, setShowDriverContactModal] = useState(false);
  const [showVehicleRefundModal, setShowVehicleRefundModal] = useState(false);
  const [vehicleBookingId, setVehicleBookingId] = useState('');
  const [vehicleCancelReason, setVehicleCancelReason] = useState('');
  const [vehicleModifyData, setVehicleModifyData] = useState({
    pickupLocation: '',
    pickupDate: '',
    pickupTime: '',
    vehicleType: ''
  });
  
  // Complaint Form states
  const [complaintForm, setComplaintForm] = useState({
    bookingId: '',
    issueType: '',
    description: '',
    contactNumber: ''
  });
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [vehicleSupportTab, setVehicleSupportTab] = useState('support'); // 'support', 'complaints'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintDetailModal, setShowComplaintDetailModal] = useState(false);
  
  // Holiday Support states
  const [holidaySupportTab, setHolidaySupportTab] = useState('support'); // 'support', 'complaints'
  const [holidayComplaintForm, setHolidayComplaintForm] = useState({
    bookingId: '',
    issueType: '',
    description: '',
    contactNumber: ''
  });
  const [holidayComplaintSubmitting, setHolidayComplaintSubmitting] = useState(false);
  const [holidayComplaintSuccess, setHolidayComplaintSuccess] = useState(false);
  const [myHolidayComplaints, setMyHolidayComplaints] = useState([]);
  const [selectedHolidayComplaint, setSelectedHolidayComplaint] = useState(null);
  const [showHolidayComplaintDetailModal, setShowHolidayComplaintDetailModal] = useState(false);
  
  // Refund Support states
  const [refundSupportTab, setRefundSupportTab] = useState('support'); // 'support', 'complaints'
  const [refundComplaintForm, setRefundComplaintForm] = useState({
    bookingId: '',
    issueType: '',
    description: '',
    contactNumber: ''
  });
  const [refundComplaintSubmitting, setRefundComplaintSubmitting] = useState(false);
  const [refundComplaintSuccess, setRefundComplaintSuccess] = useState(false);
  const [myRefundComplaints, setMyRefundComplaints] = useState([]);
  const [selectedRefundComplaint, setSelectedRefundComplaint] = useState(null);
  const [showRefundComplaintDetailModal, setShowRefundComplaintDetailModal] = useState(false);
  
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tabs configuration - Organized by priority
  const tabs = [
    // Main Dashboard
    { id: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
    
    // Primary Features
    { id: 'journeys', label: 'My Journeys', icon: 'fas fa-suitcase-rolling' },
    { id: 'profile', label: 'My Profile', icon: 'fas fa-user-circle' },
    { id: 'ecash', label: 'My eCash', icon: 'fas fa-wallet' },
    
    // Booking & Payments
    { id: 'complete-booking', label: 'Complete Booking', icon: 'fas fa-clipboard-check' },
    { id: 'make-payment', label: 'Make Payment', icon: 'fas fa-credit-card' },
    
    // Refunds
    { id: 'track-refund', label: 'Track Refund', icon: 'fas fa-search-dollar' },
    { id: 'refund', label: 'My Refund', icon: 'fas fa-undo-alt' },
    
    // Support Center
    { id: 'holiday-support', label: 'Holiday Support', icon: 'fas fa-umbrella-beach' },
    { id: 'vehicle-support', label: 'Vehicle Support', icon: 'fas fa-car-side' },
    { id: 'refund-support', label: 'Refund Support', icon: 'fas fa-hand-holding-usd' }
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
        fetchProfileData(),
        fetchAllComplaints()
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

  // Fetch customer's complaints - categorized by type
  const fetchAllComplaints = async () => {
    if (!user) return;
    try {
      const complaintsRef = collection(db, 'complaints');
      const q = query(complaintsRef, where('customerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const complaintsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Categorize complaints by source
      const vehicleComplaints = complaintsData.filter(c => c.source === 'vehicle' || c.category === 'vehicle');
      const holidayComplaints = complaintsData.filter(c => c.source === 'holiday' || c.category === 'holiday');
      const refundComplaints = complaintsData.filter(c => c.source === 'refund' || c.category === 'refund');
      
      setMyComplaints(vehicleComplaints);
      setMyHolidayComplaints(holidayComplaints);
      setMyRefundComplaints(refundComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  // Handle Vehicle complaint form submission
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaintForm.bookingId || !complaintForm.issueType || !complaintForm.description || !complaintForm.contactNumber) {
      alert('Please fill all required fields');
      return;
    }

    setComplaintSubmitting(true);
    try {
      // Map issue types to categories
      const categoryMap = {
        'driver': { category: 'vehicle', subCategory: 'Driver Issue' },
        'vehicle': { category: 'vehicle', subCategory: 'Vehicle Condition' },
        'delay': { category: 'vehicle', subCategory: 'Delay / No Show' },
        'route': { category: 'vehicle', subCategory: 'Route Issue' },
        'payment': { category: 'booking', subCategory: 'Payment Issue' },
        'cancel': { category: 'booking', subCategory: 'Cancellation' },
        'modify': { category: 'booking', subCategory: 'Modification Request' },
        'other': { category: 'booking', subCategory: 'Other' }
      };

      const categoryInfo = categoryMap[complaintForm.issueType] || { category: 'booking', subCategory: 'Other' };

      // Determine priority based on issue type
      const priorityMap = {
        'driver': 'high',
        'delay': 'high',
        'payment': 'high',
        'vehicle': 'medium',
        'cancel': 'medium',
        'modify': 'low',
        'route': 'medium',
        'other': 'low'
      };

      const complaintData = {
        type: 'customer',
        source: 'vehicle',
        category: 'vehicle',
        subCategory: categoryInfo.subCategory,
        subject: `Vehicle: ${categoryInfo.subCategory} - Booking ${complaintForm.bookingId}`,
        description: complaintForm.description,
        customerName: profile?.name || user?.displayName || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: complaintForm.contactNumber,
        customerId: user.uid,
        bookingId: complaintForm.bookingId,
        status: 'open',
        priority: priorityMap[complaintForm.issueType] || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      };

      // Save to Firestore
      await addDoc(collection(db, 'complaints'), complaintData);

      // Reset form and show success
      setComplaintForm({
        bookingId: '',
        issueType: '',
        description: '',
        contactNumber: ''
      });
      setComplaintSuccess(true);
      
      // Refresh complaints list
      await fetchAllComplaints();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setComplaintSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint: ' + (error.message || 'Please try again.'));
    } finally {
      setComplaintSubmitting(false);
    }
  };

  // Handle Holiday complaint form submission
  const handleHolidayComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!holidayComplaintForm.bookingId || !holidayComplaintForm.issueType || !holidayComplaintForm.description || !holidayComplaintForm.contactNumber) {
      alert('Please fill all required fields');
      return;
    }

    setHolidayComplaintSubmitting(true);
    try {
      // Map issue types to categories for holiday
      const categoryMap = {
        'itinerary': { subCategory: 'Itinerary Issue' },
        'hotel': { subCategory: 'Hotel/Accommodation Issue' },
        'transport': { subCategory: 'Transport Issue' },
        'guide': { subCategory: 'Tour Guide Issue' },
        'meal': { subCategory: 'Meals Issue' },
        'cancel': { subCategory: 'Cancellation Request' },
        'modify': { subCategory: 'Modification Request' },
        'refund': { subCategory: 'Refund Request' },
        'other': { subCategory: 'Other Issue' }
      };

      const categoryInfo = categoryMap[holidayComplaintForm.issueType] || { subCategory: 'Other Issue' };

      // Determine priority
      const priorityMap = {
        'hotel': 'high',
        'transport': 'high',
        'cancel': 'high',
        'refund': 'high',
        'itinerary': 'medium',
        'guide': 'medium',
        'meal': 'medium',
        'modify': 'low',
        'other': 'low'
      };

      const complaintData = {
        type: 'customer',
        source: 'holiday',
        category: 'holiday',
        subCategory: categoryInfo.subCategory,
        subject: `Holiday: ${categoryInfo.subCategory} - Booking ${holidayComplaintForm.bookingId}`,
        description: holidayComplaintForm.description,
        customerName: profile?.name || user?.displayName || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: holidayComplaintForm.contactNumber,
        customerId: user.uid,
        bookingId: holidayComplaintForm.bookingId,
        status: 'open',
        priority: priorityMap[holidayComplaintForm.issueType] || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      };

      await addDoc(collection(db, 'complaints'), complaintData);

      setHolidayComplaintForm({
        bookingId: '',
        issueType: '',
        description: '',
        contactNumber: ''
      });
      setHolidayComplaintSuccess(true);
      await fetchAllComplaints();

      setTimeout(() => {
        setHolidayComplaintSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting holiday complaint:', error);
      alert('Failed to submit complaint: ' + (error.message || 'Please try again.'));
    } finally {
      setHolidayComplaintSubmitting(false);
    }
  };

  // Handle Refund complaint form submission
  const handleRefundComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundComplaintForm.bookingId || !refundComplaintForm.issueType || !refundComplaintForm.description || !refundComplaintForm.contactNumber) {
      alert('Please fill all required fields');
      return;
    }

    setRefundComplaintSubmitting(true);
    try {
      // Map issue types to categories for refund
      const categoryMap = {
        'not-received': { subCategory: 'Refund Not Received' },
        'partial': { subCategory: 'Partial Refund Issue' },
        'delay': { subCategory: 'Refund Delayed' },
        'wrong-amount': { subCategory: 'Wrong Refund Amount' },
        'status': { subCategory: 'Refund Status Query' },
        'cancel': { subCategory: 'Cancel & Refund Request' },
        'account': { subCategory: 'Wrong Account Credited' },
        'other': { subCategory: 'Other Refund Issue' }
      };

      const categoryInfo = categoryMap[refundComplaintForm.issueType] || { subCategory: 'Other Refund Issue' };

      // Determine priority - all refund issues are generally high priority
      const priorityMap = {
        'not-received': 'high',
        'wrong-amount': 'high',
        'partial': 'high',
        'account': 'high',
        'delay': 'medium',
        'status': 'medium',
        'cancel': 'medium',
        'other': 'low'
      };

      const complaintData = {
        type: 'customer',
        source: 'refund',
        category: 'refund',
        subCategory: categoryInfo.subCategory,
        subject: `Refund: ${categoryInfo.subCategory} - Booking ${refundComplaintForm.bookingId}`,
        description: refundComplaintForm.description,
        customerName: profile?.name || user?.displayName || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: refundComplaintForm.contactNumber,
        customerId: user.uid,
        bookingId: refundComplaintForm.bookingId,
        status: 'open',
        priority: priorityMap[refundComplaintForm.issueType] || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      };

      await addDoc(collection(db, 'complaints'), complaintData);

      setRefundComplaintForm({
        bookingId: '',
        issueType: '',
        description: '',
        contactNumber: ''
      });
      setRefundComplaintSuccess(true);
      await fetchAllComplaints();

      setTimeout(() => {
        setRefundComplaintSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting refund complaint:', error);
      alert('Failed to submit complaint: ' + (error.message || 'Please try again.'));
    } finally {
      setRefundComplaintSubmitting(false);
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
        <LoadingSpinner size="large" text="Loading your dashboard..." />
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
      case 'holiday-support':
        return renderHolidaySupport();
      case 'vehicle-support':
        return renderVehicleSupport();
      case 'refund-support':
        return renderRefundSupport();
      default:
        return renderOverview();
    }
  };

  // Overview Tab
  const renderOverview = () => (
    <div className="overview-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-left">
            <div className="greeting-badge">
              <i className="fas fa-sun"></i>
              <span>{new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}</span>
            </div>
            <h1 className="welcome-name">{profile?.name || user?.displayName || 'Traveler'} 👋</h1>
            <p className="welcome-subtitle">Ready for your next adventure? Let's make it memorable!</p>
            <div className="welcome-actions">
              <button className="btn-explore" onClick={() => navigate('/tours')}>
                <i className="fas fa-compass"></i> Explore Tours
              </button>
              <button className="btn-secondary" onClick={() => setActiveTab('profile')}>
                <i className="fas fa-user-edit"></i> My Profile
              </button>
            </div>
          </div>
          <div className="welcome-right">
            <div className="welcome-illustration-new">
              <div className="floating-icon icon-1"><i className="fas fa-plane"></i></div>
              <div className="floating-icon icon-2"><i className="fas fa-map-marker-alt"></i></div>
              <div className="floating-icon icon-3"><i className="fas fa-suitcase"></i></div>
              <div className="main-icon"><i className="fas fa-globe-americas"></i></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="quick-stat-item" onClick={() => setActiveTab('journeys')}>
          <div className="qs-icon journeys"><i className="fas fa-route"></i></div>
          <div className="qs-content">
            <span className="qs-value">{bookings.length}</span>
            <span className="qs-label">Total Trips</span>
          </div>
          <i className="fas fa-chevron-right qs-arrow"></i>
        </div>
        <div className="quick-stat-item" onClick={() => setActiveTab('ecash')}>
          <div className="qs-icon ecash"><i className="fas fa-wallet"></i></div>
          <div className="qs-content">
            <span className="qs-value">₹{ecashBalance.toLocaleString()}</span>
            <span className="qs-label">eCash Balance</span>
          </div>
          <i className="fas fa-chevron-right qs-arrow"></i>
        </div>
        <div className="quick-stat-item" onClick={() => setActiveTab('refund')}>
          <div className="qs-icon refund"><i className="fas fa-clock"></i></div>
          <div className="qs-content">
            <span className="qs-value">{refundBookings.filter(b => b.status === 'refund-requested').length}</span>
            <span className="qs-label">Pending Refunds</span>
          </div>
          <i className="fas fa-chevron-right qs-arrow"></i>
        </div>
        <div className="quick-stat-item" onClick={() => setActiveTab('vehicle-support')}>
          <div className="qs-icon support"><i className="fas fa-headset"></i></div>
          <div className="qs-content">
            <span className="qs-value">{myComplaints.filter(c => c.status !== 'resolved').length}</span>
            <span className="qs-label">Open Tickets</span>
          </div>
          <i className="fas fa-chevron-right qs-arrow"></i>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overview-main-grid">
        {/* Left Column */}
        <div className="overview-left-column">
          {/* Recent Bookings Card */}
          <div className="overview-card recent-bookings-card">
            <div className="card-header">
              <div className="header-left">
                <i className="fas fa-history"></i>
                <h3>Recent Bookings</h3>
              </div>
              <button className="view-all-link" onClick={() => setActiveTab('journeys')}>
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="card-body">
              {bookings.length > 0 ? (
                <div className="recent-bookings-list">
                  {bookings.slice(0, 4).map((booking, index) => (
                    <div key={booking.id} className="recent-booking-item">
                      <div className="rb-number">{String(index + 1).padStart(2, '0')}</div>
                      <div className="rb-icon">
                        <i className={booking.type === 'hotel' ? 'fas fa-hotel' : booking.type === 'vehicle' ? 'fas fa-car' : 'fas fa-plane'}></i>
                      </div>
                      <div className="rb-details">
                        <h4>{booking.destination || booking.packageName || 'Trip'}</h4>
                        <p><i className="fas fa-calendar-alt"></i> {booking.travelDate || 'Date not set'}</p>
                      </div>
                      <div className="rb-right">
                        <span className="rb-amount">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-bookings">
                  <div className="empty-icon">
                    <i className="fas fa-suitcase-rolling"></i>
                  </div>
                  <h4>No Bookings Yet</h4>
                  <p>Start your journey by exploring our amazing tour packages!</p>
                  <button className="btn-start-explore" onClick={() => navigate('/tours')}>
                    <i className="fas fa-search"></i> Find Tours
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Support Section */}
          <div className="overview-card support-overview-card">
            <div className="card-header">
              <div className="header-left">
                <i className="fas fa-life-ring"></i>
                <h3>Need Help?</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="support-options-grid">
                <div className="support-option" onClick={() => setActiveTab('vehicle-support')}>
                  <div className="so-icon vehicle"><i className="fas fa-car-side"></i></div>
                  <span>Vehicle Support</span>
                </div>
                <div className="support-option" onClick={() => setActiveTab('holiday-support')}>
                  <div className="so-icon holiday"><i className="fas fa-umbrella-beach"></i></div>
                  <span>Holiday Support</span>
                </div>
                <div className="support-option" onClick={() => setActiveTab('refund-support')}>
                  <div className="so-icon refund"><i className="fas fa-hand-holding-usd"></i></div>
                  <span>Refund Support</span>
                </div>
                <div className="support-option" onClick={() => setActiveTab('track-refund')}>
                  <div className="so-icon track"><i className="fas fa-search-dollar"></i></div>
                  <span>Track Refund</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="overview-right-column">
          {/* Quick Actions Card */}
          <div className="overview-card quick-actions-card">
            <div className="card-header">
              <div className="header-left">
                <i className="fas fa-bolt"></i>
                <h3>Quick Actions</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="quick-actions-list">
                <button className="qa-item" onClick={() => setActiveTab('complete-booking')}>
                  <div className="qa-icon complete"><i className="fas fa-clipboard-check"></i></div>
                  <div className="qa-text">
                    <span className="qa-title">Complete Booking</span>
                    <span className="qa-desc">Finish your pending booking</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button className="qa-item" onClick={() => setActiveTab('make-payment')}>
                  <div className="qa-icon payment"><i className="fas fa-credit-card"></i></div>
                  <div className="qa-text">
                    <span className="qa-title">Make Payment</span>
                    <span className="qa-desc">Pay for your bookings</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button className="qa-item" onClick={() => navigate('/tours')}>
                  <div className="qa-icon explore"><i className="fas fa-map-marked-alt"></i></div>
                  <div className="qa-text">
                    <span className="qa-title">Book New Trip</span>
                    <span className="qa-desc">Explore destinations</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button className="qa-item" onClick={() => setActiveTab('ecash')}>
                  <div className="qa-icon wallet"><i className="fas fa-plus-circle"></i></div>
                  <div className="qa-text">
                    <span className="qa-title">Add eCash</span>
                    <span className="qa-desc">Top up your wallet</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Account Overview Card */}
          <div className="overview-card account-overview-card">
            <div className="card-header">
              <div className="header-left">
                <i className="fas fa-user-circle"></i>
                <h3>Account Overview</h3>
              </div>
              <button className="view-all-link" onClick={() => setActiveTab('profile')}>
                Edit <i className="fas fa-pen"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="account-profile-section">
                <div className="account-avatar">
                  {profile?.photoURL || formData?.photoURL ? (
                    <img src={profile?.photoURL || formData?.photoURL} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className="avatar-badge">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                <div className="account-info">
                  <h4>{profile?.name || user?.displayName || 'User'}</h4>
                  <p><i className="fas fa-envelope"></i> {user?.email || 'Not set'}</p>
                  <p><i className="fas fa-phone"></i> {profile?.phone || formData?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="account-stats-mini">
                <div className="asm-item">
                  <span className="asm-value">{bookings.filter(b => b.status === 'completed').length}</span>
                  <span className="asm-label">Completed</span>
                </div>
                <div className="asm-item">
                  <span className="asm-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
                  <span className="asm-label">Upcoming</span>
                </div>
                <div className="asm-item">
                  <span className="asm-value">₹{ecashBalance.toLocaleString()}</span>
                  <span className="asm-label">eCash</span>
                </div>
              </div>
            </div>
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

  // Holiday Support Tab
  const renderHolidaySupport = () => (
    <div className="holiday-support-content">
      <div className="content-header">
        <h2><i className="fas fa-umbrella-beach"></i> Holiday Booking Support</h2>
        <p>Get help with your holiday package issues</p>
      </div>

      {/* Sub-tabs for Holiday Support */}
      <div className="vehicle-support-tabs">
        <button 
          className={`vs-tab ${holidaySupportTab === 'support' ? 'active' : ''}`}
          onClick={() => setHolidaySupportTab('support')}
        >
          <i className="fas fa-headset"></i>
          <span>Get Support</span>
        </button>
        <button 
          className={`vs-tab ${holidaySupportTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setHolidaySupportTab('complaints')}
        >
          <i className="fas fa-clipboard-list"></i>
          <span>My Complaints</span>
          {myHolidayComplaints.length > 0 && <span className="complaint-count">{myHolidayComplaints.length}</span>}
        </button>
      </div>

      {holidaySupportTab === 'support' ? (
        <>
          <div className="support-grid">
            {/* Track Holiday Booking */}
            <div className="form-card vehicle-support holiday-support">
              <div className="form-card-icon holiday">
                <i className="fas fa-search-location"></i>
              </div>
              <h3>Track Your Holiday Booking</h3>
              <form onSubmit={handleMakePayment}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Holiday Booking ID *</label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Enter your holiday booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Registered Email *</label>
                  <input
                    type="email"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn holiday">
                  <i className="fas fa-search"></i> Track Booking
                </button>
              </form>
            </div>

            {/* Report Holiday Issue */}
            <div className="form-card vehicle-issue holiday-issue">
              <div className="form-card-icon issue">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Report an Issue</h3>
              {holidayComplaintSuccess && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <span>Your holiday complaint has been submitted successfully! Our team will review and respond shortly.</span>
                </div>
              )}
              <form onSubmit={handleHolidayComplaintSubmit}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Holiday Booking ID *</label>
                  <input
                    type="text"
                    value={holidayComplaintForm.bookingId}
                    onChange={(e) => setHolidayComplaintForm({...holidayComplaintForm, bookingId: e.target.value})}
                    placeholder="Enter your holiday booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-list"></i> Issue Type *</label>
                  <select 
                    value={holidayComplaintForm.issueType}
                    onChange={(e) => setHolidayComplaintForm({...holidayComplaintForm, issueType: e.target.value})}
                    required
                  >
                    <option value="">Select issue type</option>
                    <option value="itinerary">Itinerary Issue</option>
                    <option value="hotel">Hotel / Accommodation Issue</option>
                    <option value="transport">Transport Issue</option>
                    <option value="guide">Tour Guide Issue</option>
                    <option value="meal">Meals Issue</option>
                    <option value="cancel">Cancellation Request</option>
                    <option value="modify">Modification Request</option>
                    <option value="refund">Refund Request</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><i className="fas fa-comment-alt"></i> Describe Your Issue *</label>
                  <textarea
                    value={holidayComplaintForm.description}
                    onChange={(e) => setHolidayComplaintForm({...holidayComplaintForm, description: e.target.value})}
                    placeholder="Please describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-phone"></i> Contact Number *</label>
                  <input
                    type="tel"
                    value={holidayComplaintForm.contactNumber}
                    onChange={(e) => setHolidayComplaintForm({...holidayComplaintForm, contactNumber: e.target.value})}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn issue" disabled={holidayComplaintSubmitting}>
                  {holidayComplaintSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Submit Issue
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Help Options for Holiday */}
          <div className="quick-help-section">
            <h3><i className="fas fa-hands-helping"></i> Quick Help</h3>
            <div className="quick-help-cards">
              <div className="quick-help-card">
                <div className="help-icon cancel">
                  <i className="fas fa-ban"></i>
                </div>
                <h4>Cancel Package</h4>
                <p>Cancel your holiday package and request a refund</p>
                <button className="help-btn" onClick={() => {
                  setHolidayComplaintForm({...holidayComplaintForm, issueType: 'cancel'});
                  setHolidaySupportTab('support');
                }}>Cancel Package</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon modify">
                  <i className="fas fa-edit"></i>
                </div>
                <h4>Modify Booking</h4>
                <p>Change dates, add travelers or upgrade package</p>
                <button className="help-btn" onClick={() => {
                  setHolidayComplaintForm({...holidayComplaintForm, issueType: 'modify'});
                  setHolidaySupportTab('support');
                }}>Modify Booking</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon driver">
                  <i className="fas fa-concierge-bell"></i>
                </div>
                <h4>Hotel Issues</h4>
                <p>Report hotel or accommodation problems</p>
                <button className="help-btn" onClick={() => {
                  setHolidayComplaintForm({...holidayComplaintForm, issueType: 'hotel'});
                  setHolidaySupportTab('support');
                }}>Report Issue</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon refund">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h4>Request Refund</h4>
                <p>Submit your refund request for holiday package</p>
                <button className="help-btn" onClick={() => {
                  setHolidayComplaintForm({...holidayComplaintForm, issueType: 'refund'});
                  setHolidaySupportTab('support');
                }}>Request Refund</button>
              </div>
            </div>
          </div>

          {/* FAQ Section for Holiday */}
          <div className="vehicle-faq-section">
            <h3><i className="fas fa-question-circle"></i> Frequently Asked Questions</h3>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>How do I cancel my holiday package?</span>
                </div>
                <p className="faq-answer">You can cancel your holiday package up to 7 days before departure. Refund will be processed based on our cancellation policy within 10-15 business days.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>Can I change my travel dates?</span>
                </div>
                <p className="faq-answer">Yes, you can modify your travel dates up to 14 days before departure. Additional charges may apply based on availability.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>What if my hotel is not as described?</span>
                </div>
                <p className="faq-answer">If your hotel doesn't match the description, report it immediately using the form above. We'll arrange an alternative or provide compensation.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>How do I add more travelers?</span>
                </div>
                <p className="faq-answer">You can add travelers up to 5 days before departure. Use the Modify Booking option and provide traveler details.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="contact-support-box">
            <div className="support-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="support-info">
              <h4>Need More Help?</h4>
              <p>Our holiday support team is available 24/7 to assist you</p>
              <div className="support-contacts">
                <span><i className="fas fa-phone"></i> +91 1800-XXX-XXXX</span>
                <span><i className="fas fa-envelope"></i> holiday.support@travelaxis.com</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* My Holiday Complaints Tab */
        <div className="my-complaints-tab">
          {myHolidayComplaints.length === 0 ? (
            <div className="no-complaints">
              <div className="no-complaints-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3>No Complaints Yet</h3>
              <p>You haven't submitted any holiday complaints. If you face any issues with your holiday booking, report them using the "Get Support" tab.</p>
              <button className="go-support-btn" onClick={() => setHolidaySupportTab('support')}>
                <i className="fas fa-headset"></i> Get Support
              </button>
            </div>
          ) : (
            <div className="complaints-list-view">
              {myHolidayComplaints.map(complaint => (
                <div 
                  key={complaint.id} 
                  className={`complaint-card-item ${complaint.status}`}
                  onClick={() => { setSelectedHolidayComplaint(complaint); setShowHolidayComplaintDetailModal(true); }}
                >
                  <div className="complaint-card-left">
                    <div className={`complaint-status-icon ${complaint.status}`}>
                      {complaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                      {complaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                      {complaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
                    </div>
                  </div>
                  <div className="complaint-card-content">
                    <div className="complaint-card-header">
                      <h4>{complaint.subject}</h4>
                      <span className={`status-tag ${complaint.status}`}>
                        {complaint.status === 'open' && 'Open'}
                        {complaint.status === 'in-progress' && 'In Progress'}
                        {complaint.status === 'resolved' && 'Resolved'}
                      </span>
                    </div>
                    <p className="complaint-card-desc">{complaint.description.substring(0, 100)}{complaint.description.length > 100 ? '...' : ''}</p>
                    <div className="complaint-card-footer">
                      <span className="complaint-date">
                        <i className="fas fa-calendar-alt"></i>
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="complaint-category">
                        <i className="fas fa-tag"></i>
                        {complaint.subCategory}
                      </span>
                      {complaint.responses && complaint.responses.length > 0 && (
                        <span className="response-count">
                          <i className="fas fa-reply"></i>
                          {complaint.responses.length} Response{complaint.responses.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="complaint-card-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Holiday Complaint Detail Modal */}
      {showHolidayComplaintDetailModal && selectedHolidayComplaint && (
        <div className="modal-overlay complaint-detail-overlay" onClick={() => setShowHolidayComplaintDetailModal(false)}>
          <div className="modal-content complaint-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHolidayComplaintDetailModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="complaint-detail-header">
              <div className={`detail-status-icon ${selectedHolidayComplaint.status}`}>
                {selectedHolidayComplaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                {selectedHolidayComplaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                {selectedHolidayComplaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
              </div>
              <div className="detail-header-info">
                <h3>{selectedHolidayComplaint.subject}</h3>
                <span className={`detail-status-badge ${selectedHolidayComplaint.status}`}>
                  {selectedHolidayComplaint.status === 'open' && 'Open'}
                  {selectedHolidayComplaint.status === 'in-progress' && 'In Progress'}
                  {selectedHolidayComplaint.status === 'resolved' && 'Resolved'}
                </span>
              </div>
            </div>

            <div className="complaint-detail-body">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <label>Complaint ID</label>
                  <span>#{selectedHolidayComplaint.id.substring(0, 12)}</span>
                </div>
                <div className="detail-info-item">
                  <label>Category</label>
                  <span>{selectedHolidayComplaint.subCategory}</span>
                </div>
                <div className="detail-info-item">
                  <label>Booking ID</label>
                  <span>{selectedHolidayComplaint.bookingId || 'N/A'}</span>
                </div>
                <div className="detail-info-item">
                  <label>Submitted On</label>
                  <span>{new Date(selectedHolidayComplaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="detail-description">
                <h4><i className="fas fa-align-left"></i> Issue Description</h4>
                <p>{selectedHolidayComplaint.description}</p>
              </div>

              <div className="detail-responses">
                <h4><i className="fas fa-comments"></i> Updates & Responses ({selectedHolidayComplaint.responses?.length || 0})</h4>
                {selectedHolidayComplaint.responses && selectedHolidayComplaint.responses.length > 0 ? (
                  <div className="responses-timeline">
                    {selectedHolidayComplaint.responses.map((response, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-icon">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-author">{response.respondedBy}</span>
                            <span className="timeline-date">
                              {new Date(response.respondedAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="timeline-message">{response.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-responses-yet">
                    <i className="fas fa-hourglass-half"></i>
                    <p>No responses yet. Our team will review your complaint and respond shortly.</p>
                  </div>
                )}
              </div>

              {selectedHolidayComplaint.status === 'resolved' && (
                <div className="resolved-banner">
                  <i className="fas fa-check-circle"></i>
                  <span>This complaint has been resolved on {new Date(selectedHolidayComplaint.resolvedAt || selectedHolidayComplaint.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Vehicle Booking Support Tab
  const renderVehicleSupport = () => (
    <div className="vehicle-support-content">
      <div className="content-header">
        <h2><i className="fas fa-car-side"></i> Vehicle Booking Support</h2>
        <p>Get help with your vehicle booking issues</p>
      </div>

      {/* Sub-tabs for Vehicle Support */}
      <div className="vehicle-support-tabs">
        <button 
          className={`vs-tab ${vehicleSupportTab === 'support' ? 'active' : ''}`}
          onClick={() => setVehicleSupportTab('support')}
        >
          <i className="fas fa-headset"></i>
          <span>Get Support</span>
        </button>
        <button 
          className={`vs-tab ${vehicleSupportTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setVehicleSupportTab('complaints')}
        >
          <i className="fas fa-clipboard-list"></i>
          <span>My Complaints</span>
          {myComplaints.length > 0 && <span className="complaint-count">{myComplaints.length}</span>}
        </button>
      </div>

      {vehicleSupportTab === 'support' ? (
        <>
          <div className="support-grid">
            {/* Track Vehicle Booking */}
            <div className="form-card vehicle-support">
              <div className="form-card-icon vehicle">
                <i className="fas fa-search-location"></i>
              </div>
              <h3>Track Your Vehicle Booking</h3>
              <form onSubmit={handleMakePayment}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Enter your vehicle booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Registered Email *</label>
                  <input
                    type="email"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn vehicle">
                  <i className="fas fa-search"></i> Track Booking
                </button>
              </form>
            </div>

            {/* Report Issue */}
            <div className="form-card vehicle-issue">
              <div className="form-card-icon issue">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Report an Issue</h3>
              {complaintSuccess && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <span>Your complaint has been submitted successfully! Our team will review and respond shortly.</span>
                </div>
              )}
              <form onSubmit={handleComplaintSubmit}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                  <input
                    type="text"
                    value={complaintForm.bookingId}
                    onChange={(e) => setComplaintForm({...complaintForm, bookingId: e.target.value})}
                    placeholder="Enter your vehicle booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-list"></i> Issue Type *</label>
                  <select 
                    value={complaintForm.issueType}
                    onChange={(e) => setComplaintForm({...complaintForm, issueType: e.target.value})}
                    required
                  >
                    <option value="">Select issue type</option>
                    <option value="driver">Driver Related Issue</option>
                    <option value="vehicle">Vehicle Condition Issue</option>
                    <option value="delay">Delay / No Show</option>
                    <option value="route">Route / Navigation Issue</option>
                    <option value="payment">Payment / Billing Issue</option>
                    <option value="cancel">Cancellation Request</option>
                    <option value="modify">Modify Booking</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><i className="fas fa-comment-alt"></i> Describe Your Issue *</label>
                  <textarea
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                    placeholder="Please describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-phone"></i> Contact Number *</label>
                  <input
                    type="tel"
                    value={complaintForm.contactNumber}
                    onChange={(e) => setComplaintForm({...complaintForm, contactNumber: e.target.value})}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn issue" disabled={complaintSubmitting}>
                  {complaintSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Submit Issue
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Help Options */}
          <div className="quick-help-section">
            <h3><i className="fas fa-hands-helping"></i> Quick Help</h3>
            <div className="quick-help-cards">
              <div className="quick-help-card">
                <div className="help-icon cancel">
                  <i className="fas fa-ban"></i>
                </div>
                <h4>Cancel Booking</h4>
                <p>Need to cancel? Get a refund based on our cancellation policy</p>
                <button className="help-btn" onClick={() => setShowCancelVehicleModal(true)}>Cancel Booking</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon modify">
                  <i className="fas fa-edit"></i>
                </div>
                <h4>Modify Booking</h4>
                <p>Change pickup time, location or vehicle type</p>
                <button className="help-btn" onClick={() => setShowModifyVehicleModal(true)}>Modify Details</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon driver">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h4>Contact Driver</h4>
                <p>Get driver details and contact information</p>
                <button className="help-btn" onClick={() => setShowDriverContactModal(true)}>Get Details</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon refund">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h4>Request Refund</h4>
                <p>Eligible for refund? Submit your request here</p>
                <button className="help-btn" onClick={() => setShowVehicleRefundModal(true)}>Request Refund</button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="vehicle-faq-section">
            <h3><i className="fas fa-question-circle"></i> Frequently Asked Questions</h3>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>How do I cancel my vehicle booking?</span>
                </div>
                <p className="faq-answer">You can cancel your booking up to 2 hours before pickup. Go to Track Booking, enter your booking ID, and click on Cancel. Refund will be processed within 5-7 business days.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>What if my driver doesn't arrive on time?</span>
                </div>
                <p className="faq-answer">If your driver is delayed by more than 15 minutes, please report the issue using the form above. You may be eligible for a discount or full refund.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>Can I change my pickup location?</span>
                </div>
                <p className="faq-answer">Yes, you can modify your pickup location up to 1 hour before the scheduled pickup time. Use the Modify Booking option above.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>How do I contact my driver?</span>
                </div>
                <p className="faq-answer">Driver details including contact number will be shared 30 minutes before pickup. You can also track your booking to get live driver location.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="contact-support-box">
            <div className="support-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="support-info">
              <h4>Need More Help?</h4>
              <p>Our support team is available 24/7 to assist you</p>
              <div className="support-contacts">
                <span><i className="fas fa-phone"></i> +91 1800-XXX-XXXX</span>
                <span><i className="fas fa-envelope"></i> vehicle.support@travelaxis.com</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* My Complaints Tab */
        <div className="my-complaints-tab">
          {myComplaints.length === 0 ? (
            <div className="no-complaints">
              <div className="no-complaints-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3>No Complaints Yet</h3>
              <p>You haven't submitted any complaints. If you face any issues with your vehicle booking, report them using the "Get Support" tab.</p>
              <button className="go-support-btn" onClick={() => setVehicleSupportTab('support')}>
                <i className="fas fa-headset"></i> Get Support
              </button>
            </div>
          ) : (
            <div className="complaints-list-view">
              {myComplaints.map(complaint => (
                <div 
                  key={complaint.id} 
                  className={`complaint-card-item ${complaint.status}`}
                  onClick={() => { setSelectedComplaint(complaint); setShowComplaintDetailModal(true); }}
                >
                  <div className="complaint-card-left">
                    <div className={`complaint-status-icon ${complaint.status}`}>
                      {complaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                      {complaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                      {complaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
                    </div>
                  </div>
                  <div className="complaint-card-content">
                    <div className="complaint-card-header">
                      <h4>{complaint.subject}</h4>
                      <span className={`status-tag ${complaint.status}`}>
                        {complaint.status === 'open' && 'Open'}
                        {complaint.status === 'in-progress' && 'In Progress'}
                        {complaint.status === 'resolved' && 'Resolved'}
                      </span>
                    </div>
                    <p className="complaint-card-desc">{complaint.description.substring(0, 100)}{complaint.description.length > 100 ? '...' : ''}</p>
                    <div className="complaint-card-footer">
                      <span className="complaint-date">
                        <i className="fas fa-calendar-alt"></i>
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="complaint-category">
                        <i className="fas fa-tag"></i>
                        {complaint.subCategory}
                      </span>
                      {complaint.responses && complaint.responses.length > 0 && (
                        <span className="response-count">
                          <i className="fas fa-reply"></i>
                          {complaint.responses.length} Response{complaint.responses.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="complaint-card-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complaint Detail Modal */}
      {showComplaintDetailModal && selectedComplaint && (
        <div className="modal-overlay complaint-detail-overlay" onClick={() => setShowComplaintDetailModal(false)}>
          <div className="modal-content complaint-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowComplaintDetailModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="complaint-detail-header">
              <div className={`detail-status-icon ${selectedComplaint.status}`}>
                {selectedComplaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                {selectedComplaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                {selectedComplaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
              </div>
              <div className="detail-header-info">
                <h3>{selectedComplaint.subject}</h3>
                <span className={`detail-status-badge ${selectedComplaint.status}`}>
                  {selectedComplaint.status === 'open' && 'Open'}
                  {selectedComplaint.status === 'in-progress' && 'In Progress'}
                  {selectedComplaint.status === 'resolved' && 'Resolved'}
                </span>
              </div>
            </div>

            <div className="complaint-detail-body">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <label>Complaint ID</label>
                  <span>#{selectedComplaint.id.substring(0, 12)}</span>
                </div>
                <div className="detail-info-item">
                  <label>Category</label>
                  <span>{selectedComplaint.subCategory}</span>
                </div>
                <div className="detail-info-item">
                  <label>Booking ID</label>
                  <span>{selectedComplaint.bookingId || 'N/A'}</span>
                </div>
                <div className="detail-info-item">
                  <label>Submitted On</label>
                  <span>{new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="detail-description">
                <h4><i className="fas fa-align-left"></i> Issue Description</h4>
                <p>{selectedComplaint.description}</p>
              </div>

              <div className="detail-responses">
                <h4><i className="fas fa-comments"></i> Updates & Responses ({selectedComplaint.responses?.length || 0})</h4>
                {selectedComplaint.responses && selectedComplaint.responses.length > 0 ? (
                  <div className="responses-timeline">
                    {selectedComplaint.responses.map((response, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-icon">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-author">{response.respondedBy}</span>
                            <span className="timeline-date">
                              {new Date(response.respondedAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="timeline-message">{response.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-responses-yet">
                    <i className="fas fa-hourglass-half"></i>
                    <p>Waiting for admin response. We'll get back to you shortly.</p>
                  </div>
                )}
              </div>

              {selectedComplaint.resolvedAt && (
                <div className="resolved-banner">
                  <i className="fas fa-check-double"></i>
                  <span>This complaint was resolved on {new Date(selectedComplaint.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Refund Support Tab
  const renderRefundSupport = () => (
    <div className="refund-support-content">
      <div className="content-header">
        <h2><i className="fas fa-hand-holding-usd"></i> Refund Support</h2>
        <p>Get help with your refund issues and track refund status</p>
      </div>

      {/* Sub-tabs for Refund Support */}
      <div className="vehicle-support-tabs">
        <button 
          className={`vs-tab ${refundSupportTab === 'support' ? 'active' : ''}`}
          onClick={() => setRefundSupportTab('support')}
        >
          <i className="fas fa-headset"></i>
          <span>Raise Issue</span>
        </button>
        <button 
          className={`vs-tab ${refundSupportTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setRefundSupportTab('complaints')}
        >
          <i className="fas fa-clipboard-list"></i>
          <span>My Tickets</span>
          {myRefundComplaints.length > 0 && <span className="complaint-count">{myRefundComplaints.length}</span>}
        </button>
      </div>

      {refundSupportTab === 'support' ? (
        <>
          <div className="support-grid">
            {/* Track Refund Status */}
            <div className="form-card vehicle-support refund-support">
              <div className="form-card-icon refund">
                <i className="fas fa-search-dollar"></i>
              </div>
              <h3>Track Your Refund</h3>
              <form onSubmit={handleMakePayment}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Booking ID *</label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Enter your booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Registered Email *</label>
                  <input
                    type="email"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn refund">
                  <i className="fas fa-search"></i> Track Refund
                </button>
              </form>
            </div>

            {/* Report Refund Issue */}
            <div className="form-card vehicle-issue refund-issue">
              <div className="form-card-icon issue">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Report Refund Issue</h3>
              {refundComplaintSuccess && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <span>Your refund ticket has been submitted successfully! Our team will review and respond shortly.</span>
                </div>
              )}
              <form onSubmit={handleRefundComplaintSubmit}>
                <div className="form-group">
                  <label><i className="fas fa-ticket-alt"></i> Booking ID *</label>
                  <input
                    type="text"
                    value={refundComplaintForm.bookingId}
                    onChange={(e) => setRefundComplaintForm({...refundComplaintForm, bookingId: e.target.value})}
                    placeholder="Enter your booking ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-list"></i> Issue Type *</label>
                  <select 
                    value={refundComplaintForm.issueType}
                    onChange={(e) => setRefundComplaintForm({...refundComplaintForm, issueType: e.target.value})}
                    required
                  >
                    <option value="">Select issue type</option>
                    <option value="not-received">Refund Not Received</option>
                    <option value="partial">Partial Refund Issue</option>
                    <option value="delay">Refund Delayed</option>
                    <option value="wrong-amount">Wrong Refund Amount</option>
                    <option value="status">Refund Status Query</option>
                    <option value="cancel">Cancel & Refund Request</option>
                    <option value="account">Wrong Account Credited</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><i className="fas fa-comment-alt"></i> Describe Your Issue *</label>
                  <textarea
                    value={refundComplaintForm.description}
                    onChange={(e) => setRefundComplaintForm({...refundComplaintForm, description: e.target.value})}
                    placeholder="Please describe your refund issue in detail. Include expected amount, refund request date, etc..."
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-phone"></i> Contact Number *</label>
                  <input
                    type="tel"
                    value={refundComplaintForm.contactNumber}
                    onChange={(e) => setRefundComplaintForm({...refundComplaintForm, contactNumber: e.target.value})}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn issue" disabled={refundComplaintSubmitting}>
                  {refundComplaintSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Help Options for Refund */}
          <div className="quick-help-section">
            <h3><i className="fas fa-hands-helping"></i> Common Refund Issues</h3>
            <div className="quick-help-cards">
              <div className="quick-help-card">
                <div className="help-icon cancel">
                  <i className="fas fa-clock"></i>
                </div>
                <h4>Refund Delayed</h4>
                <p>Refund taking longer than expected? Report here</p>
                <button className="help-btn" onClick={() => {
                  setRefundComplaintForm({...refundComplaintForm, issueType: 'delay'});
                }}>Report Delay</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon modify">
                  <i className="fas fa-times-circle"></i>
                </div>
                <h4>Not Received</h4>
                <p>Refund not credited to your account?</p>
                <button className="help-btn" onClick={() => {
                  setRefundComplaintForm({...refundComplaintForm, issueType: 'not-received'});
                }}>Report Issue</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon driver">
                  <i className="fas fa-calculator"></i>
                </div>
                <h4>Wrong Amount</h4>
                <p>Received less than expected amount?</p>
                <button className="help-btn" onClick={() => {
                  setRefundComplaintForm({...refundComplaintForm, issueType: 'wrong-amount'});
                }}>Report Issue</button>
              </div>
              <div className="quick-help-card">
                <div className="help-icon refund">
                  <i className="fas fa-university"></i>
                </div>
                <h4>Wrong Account</h4>
                <p>Refund credited to wrong account?</p>
                <button className="help-btn" onClick={() => {
                  setRefundComplaintForm({...refundComplaintForm, issueType: 'account'});
                }}>Report Issue</button>
              </div>
            </div>
          </div>

          {/* Refund Info Section */}
          <div className="refund-info-section">
            <h3><i className="fas fa-info-circle"></i> Refund Processing Timeline</h3>
            <div className="refund-timeline">
              <div className="refund-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Request Submitted</h4>
                  <p>Your cancellation/refund request is received</p>
                </div>
              </div>
              <div className="refund-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Under Review</h4>
                  <p>Our team reviews your request (1-2 days)</p>
                </div>
              </div>
              <div className="refund-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Refund Initiated</h4>
                  <p>Refund is processed to your payment method</p>
                </div>
              </div>
              <div className="refund-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Amount Credited</h4>
                  <p>Amount reflects in your account (5-7 business days)</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section for Refund */}
          <div className="vehicle-faq-section">
            <h3><i className="fas fa-question-circle"></i> Frequently Asked Questions</h3>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>How long does a refund take?</span>
                </div>
                <p className="faq-answer">Refunds typically take 5-7 business days to reflect in your account after approval. Credit card refunds may take up to 10 business days.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>Why is my refund amount less than expected?</span>
                </div>
                <p className="faq-answer">Refund amounts may be deducted based on our cancellation policy. Cancellation charges, payment gateway fees, and timing of cancellation affect the final amount.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>Can I get my refund to a different account?</span>
                </div>
                <p className="faq-answer">Refunds are processed to the original payment method only. For exceptional cases, please raise a support ticket with proper documentation.</p>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <i className="fas fa-chevron-right"></i>
                  <span>What if my refund fails?</span>
                </div>
                <p className="faq-answer">If a refund fails, we'll notify you via email. The amount can be credited to your eCash wallet or re-processed to another account.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="contact-support-box">
            <div className="support-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="support-info">
              <h4>Need Urgent Help?</h4>
              <p>Our refund support team is available to assist you</p>
              <div className="support-contacts">
                <span><i className="fas fa-phone"></i> +91 1800-XXX-XXXX</span>
                <span><i className="fas fa-envelope"></i> refunds@travelaxis.com</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* My Refund Tickets Tab */
        <div className="my-complaints-tab">
          {myRefundComplaints.length === 0 ? (
            <div className="no-complaints">
              <div className="no-complaints-icon">
                <i className="fas fa-receipt"></i>
              </div>
              <h3>No Refund Tickets Yet</h3>
              <p>You haven't raised any refund issues. If you face any problems with your refund, use the "Raise Issue" tab.</p>
              <button className="go-support-btn" onClick={() => setRefundSupportTab('support')}>
                <i className="fas fa-plus-circle"></i> Raise Issue
              </button>
            </div>
          ) : (
            <div className="complaints-list-view">
              {myRefundComplaints.map(complaint => (
                <div 
                  key={complaint.id} 
                  className={`complaint-card-item ${complaint.status}`}
                  onClick={() => { setSelectedRefundComplaint(complaint); setShowRefundComplaintDetailModal(true); }}
                >
                  <div className="complaint-card-left">
                    <div className={`complaint-status-icon ${complaint.status}`}>
                      {complaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                      {complaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                      {complaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
                    </div>
                  </div>
                  <div className="complaint-card-content">
                    <div className="complaint-card-header">
                      <h4>{complaint.subject}</h4>
                      <span className={`status-tag ${complaint.status}`}>
                        {complaint.status === 'open' && 'Open'}
                        {complaint.status === 'in-progress' && 'In Progress'}
                        {complaint.status === 'resolved' && 'Resolved'}
                      </span>
                    </div>
                    <p className="complaint-card-desc">{complaint.description.substring(0, 100)}{complaint.description.length > 100 ? '...' : ''}</p>
                    <div className="complaint-card-footer">
                      <span className="complaint-date">
                        <i className="fas fa-calendar-alt"></i>
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="complaint-category">
                        <i className="fas fa-tag"></i>
                        {complaint.subCategory}
                      </span>
                      {complaint.responses && complaint.responses.length > 0 && (
                        <span className="response-count">
                          <i className="fas fa-reply"></i>
                          {complaint.responses.length} Response{complaint.responses.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="complaint-card-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Refund Complaint Detail Modal */}
      {showRefundComplaintDetailModal && selectedRefundComplaint && (
        <div className="modal-overlay complaint-detail-overlay" onClick={() => setShowRefundComplaintDetailModal(false)}>
          <div className="modal-content complaint-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRefundComplaintDetailModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="complaint-detail-header">
              <div className={`detail-status-icon ${selectedRefundComplaint.status}`}>
                {selectedRefundComplaint.status === 'open' && <i className="fas fa-exclamation-circle"></i>}
                {selectedRefundComplaint.status === 'in-progress' && <i className="fas fa-clock"></i>}
                {selectedRefundComplaint.status === 'resolved' && <i className="fas fa-check-circle"></i>}
              </div>
              <div className="detail-header-info">
                <h3>{selectedRefundComplaint.subject}</h3>
                <span className={`detail-status-badge ${selectedRefundComplaint.status}`}>
                  {selectedRefundComplaint.status === 'open' && 'Open'}
                  {selectedRefundComplaint.status === 'in-progress' && 'In Progress'}
                  {selectedRefundComplaint.status === 'resolved' && 'Resolved'}
                </span>
              </div>
            </div>

            <div className="complaint-detail-body">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <label>Ticket ID</label>
                  <span>#{selectedRefundComplaint.id.substring(0, 12)}</span>
                </div>
                <div className="detail-info-item">
                  <label>Issue Type</label>
                  <span>{selectedRefundComplaint.subCategory}</span>
                </div>
                <div className="detail-info-item">
                  <label>Booking ID</label>
                  <span>{selectedRefundComplaint.bookingId || 'N/A'}</span>
                </div>
                <div className="detail-info-item">
                  <label>Submitted On</label>
                  <span>{new Date(selectedRefundComplaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="detail-description">
                <h4><i className="fas fa-align-left"></i> Issue Description</h4>
                <p>{selectedRefundComplaint.description}</p>
              </div>

              <div className="detail-responses">
                <h4><i className="fas fa-comments"></i> Updates & Responses ({selectedRefundComplaint.responses?.length || 0})</h4>
                {selectedRefundComplaint.responses && selectedRefundComplaint.responses.length > 0 ? (
                  <div className="responses-timeline">
                    {selectedRefundComplaint.responses.map((response, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-icon">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-author">{response.respondedBy}</span>
                            <span className="timeline-date">
                              {new Date(response.respondedAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="timeline-message">{response.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-responses-yet">
                    <i className="fas fa-hourglass-half"></i>
                    <p>No responses yet. Our refund team will review your ticket and respond shortly.</p>
                  </div>
                )}
              </div>

              {selectedRefundComplaint.status === 'resolved' && (
                <div className="resolved-banner">
                  <i className="fas fa-check-circle"></i>
                  <span>This ticket has been resolved on {new Date(selectedRefundComplaint.resolvedAt || selectedRefundComplaint.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

      {/* Cancel Vehicle Booking Modal */}
      {showCancelVehicleModal && (
        <div className="modal-overlay" onClick={() => setShowCancelVehicleModal(false)}>
          <div className="modal-content vehicle-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCancelVehicleModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-icon cancel">
              <i className="fas fa-ban"></i>
            </div>
            <h3>Cancel Vehicle Booking</h3>
            <p className="modal-subtitle">Please provide your booking details to proceed with cancellation</p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Cancellation request submitted successfully!'); setShowCancelVehicleModal(false); }}>
              <div className="form-group">
                <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                <input
                  type="text"
                  value={vehicleBookingId}
                  onChange={(e) => setVehicleBookingId(e.target.value)}
                  placeholder="Enter your vehicle booking ID"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Registered Email *</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-comment-alt"></i> Reason for Cancellation *</label>
                <select 
                  value={vehicleCancelReason}
                  onChange={(e) => setVehicleCancelReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="change-plans">Change in travel plans</option>
                  <option value="found-alternative">Found alternative transport</option>
                  <option value="emergency">Personal emergency</option>
                  <option value="weather">Weather conditions</option>
                  <option value="price">Price concerns</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-edit"></i> Additional Comments (Optional)</label>
                <textarea
                  placeholder="Any additional details..."
                  rows={3}
                />
              </div>
              <div className="cancellation-policy-box">
                <h4><i className="fas fa-info-circle"></i> Cancellation Policy</h4>
                <ul>
                  <li><i className="fas fa-check"></i> Free cancellation up to 24 hours before pickup</li>
                  <li><i className="fas fa-check"></i> 50% refund for cancellation within 24 hours</li>
                  <li><i className="fas fa-times"></i> No refund for cancellation within 2 hours</li>
                </ul>
              </div>
              <button type="submit" className="modal-submit-btn cancel-btn">
                <i className="fas fa-ban"></i> Cancel Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modify Vehicle Booking Modal */}
      {showModifyVehicleModal && (
        <div className="modal-overlay" onClick={() => setShowModifyVehicleModal(false)}>
          <div className="modal-content vehicle-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModifyVehicleModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-icon modify">
              <i className="fas fa-edit"></i>
            </div>
            <h3>Modify Vehicle Booking</h3>
            <p className="modal-subtitle">Update your booking details</p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Modification request submitted successfully!'); setShowModifyVehicleModal(false); }}>
              <div className="form-group">
                <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                <input
                  type="text"
                  placeholder="Enter your vehicle booking ID"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-map-marker-alt"></i> New Pickup Location</label>
                <input
                  type="text"
                  value={vehicleModifyData.pickupLocation}
                  onChange={(e) => setVehicleModifyData({...vehicleModifyData, pickupLocation: e.target.value})}
                  placeholder="Enter new pickup location (if changing)"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-calendar"></i> New Pickup Date</label>
                  <input
                    type="date"
                    value={vehicleModifyData.pickupDate}
                    onChange={(e) => setVehicleModifyData({...vehicleModifyData, pickupDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-clock"></i> New Pickup Time</label>
                  <input
                    type="time"
                    value={vehicleModifyData.pickupTime}
                    onChange={(e) => setVehicleModifyData({...vehicleModifyData, pickupTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label><i className="fas fa-car"></i> Change Vehicle Type</label>
                <select
                  value={vehicleModifyData.vehicleType}
                  onChange={(e) => setVehicleModifyData({...vehicleModifyData, vehicleType: e.target.value})}
                >
                  <option value="">Keep current vehicle</option>
                  <option value="sedan">Sedan (4 seater)</option>
                  <option value="suv">SUV (6 seater)</option>
                  <option value="luxury">Luxury Car</option>
                  <option value="tempo">Tempo Traveller (12-17 seater)</option>
                  <option value="minibus">Mini Bus (20-35 seater)</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-comment-alt"></i> Additional Notes</label>
                <textarea
                  placeholder="Any special requests or instructions..."
                  rows={3}
                />
              </div>
              <div className="modify-info-box">
                <p><i className="fas fa-info-circle"></i> Modifications are subject to availability. Price difference (if any) will be communicated before confirmation.</p>
              </div>
              <button type="submit" className="modal-submit-btn modify-btn">
                <i className="fas fa-save"></i> Submit Modification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Driver Modal */}
      {showDriverContactModal && (
        <div className="modal-overlay" onClick={() => setShowDriverContactModal(false)}>
          <div className="modal-content vehicle-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDriverContactModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-icon driver">
              <i className="fas fa-user-tie"></i>
            </div>
            <h3>Contact Driver</h3>
            <p className="modal-subtitle">Get your driver's contact details</p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Driver details will be sent to your registered email and phone!'); setShowDriverContactModal(false); }}>
              <div className="form-group">
                <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                <input
                  type="text"
                  placeholder="Enter your vehicle booking ID"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone"></i> Your Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <div className="driver-info-preview">
                <div className="driver-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="driver-details-placeholder">
                  <p>Enter your booking ID to view driver details</p>
                  <span>Driver information is available 30 minutes before pickup</span>
                </div>
              </div>
              <div className="driver-help-options">
                <h4>Need Help With?</h4>
                <div className="help-option-chips">
                  <span className="help-chip"><i className="fas fa-map-marker-alt"></i> Share Live Location</span>
                  <span className="help-chip"><i className="fas fa-clock"></i> Driver Running Late</span>
                  <span className="help-chip"><i className="fas fa-car"></i> Wrong Vehicle</span>
                  <span className="help-chip"><i className="fas fa-route"></i> Change Route</span>
                </div>
              </div>
              <button type="submit" className="modal-submit-btn driver-btn">
                <i className="fas fa-search"></i> Get Driver Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Refund Request Modal */}
      {showVehicleRefundModal && (
        <div className="modal-overlay" onClick={() => setShowVehicleRefundModal(false)}>
          <div className="modal-content vehicle-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVehicleRefundModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-icon refund">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>Request Refund</h3>
            <p className="modal-subtitle">Submit your refund request for vehicle booking</p>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Refund request submitted successfully! We will process it within 5-7 business days.'); setShowVehicleRefundModal(false); }}>
              <div className="form-group">
                <label><i className="fas fa-ticket-alt"></i> Vehicle Booking ID *</label>
                <input
                  type="text"
                  placeholder="Enter your vehicle booking ID"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Registered Email *</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-list"></i> Reason for Refund *</label>
                <select required>
                  <option value="">Select a reason</option>
                  <option value="cancelled">Booking was cancelled</option>
                  <option value="no-show">Driver didn't show up</option>
                  <option value="service-issue">Poor service quality</option>
                  <option value="overcharged">Overcharged/Wrong billing</option>
                  <option value="vehicle-issue">Vehicle condition issue</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-rupee-sign"></i> Refund Amount Expected (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount (optional)"
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-comment-alt"></i> Describe Your Issue *</label>
                <textarea
                  placeholder="Please provide details about your refund request..."
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-university"></i> Bank Account Details (for refund)</label>
                <input
                  type="text"
                  placeholder="Account number / UPI ID"
                />
              </div>
              <div className="refund-timeline-box">
                <h4><i className="fas fa-clock"></i> Refund Timeline</h4>
                <div className="timeline-steps">
                  <div className="timeline-step">
                    <span className="step-number">1</span>
                    <span>Request Submitted</span>
                  </div>
                  <div className="timeline-step">
                    <span className="step-number">2</span>
                    <span>Under Review (1-2 days)</span>
                  </div>
                  <div className="timeline-step">
                    <span className="step-number">3</span>
                    <span>Approved & Processed</span>
                  </div>
                  <div className="timeline-step">
                    <span className="step-number">4</span>
                    <span>Credited (5-7 days)</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="modal-submit-btn refund-btn">
                <i className="fas fa-paper-plane"></i> Submit Refund Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
