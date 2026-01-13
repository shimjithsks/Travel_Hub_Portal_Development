import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, limit, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { getAllPartners, approvePartner, rejectPartner, deletePartner } from '../../services/partnerService';
import { sendApprovalEmail, sendRejectionEmail } from '../../services/emailService';
import '../../styles/adminPortal.css';

const AdminPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  // Get tab from URL query params
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  
  const [activeSection, setActiveSection] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPartners: 0,
    activePartners: 0,
    pendingPartners: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  
  // Data States
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Filter States
  const [customerSearch, setCustomerSearch] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  
  // Modal States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerActiveTab, setCustomerActiveTab] = useState('profile');
  const [customerBookings, setCustomerBookings] = useState([]);
  const [customerBookingsLoading, setCustomerBookingsLoading] = useState(false);
  const [customerBookingSort, setCustomerBookingSort] = useState('newest');
  const [customerBookingFilter, setCustomerBookingFilter] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentToView, setDocumentToView] = useState({ title: '', data: '' });
  const [partnerActiveTab, setPartnerActiveTab] = useState('company');
  
  // Deactivation Modal State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [customerToDeactivate, setCustomerToDeactivate] = useState(null);
  
  // Activation Modal State
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateReason, setActivateReason] = useState('');
  const [customerToActivate, setCustomerToActivate] = useState(null);
  
  // Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Get user role
  const userRole = profile?.role || '';
  const isSuperAdmin = userRole === 'super-admin';
  const isFullAdmin = userRole === 'admin';
  
  // Role-based access control
  const canAccessCustomers = isSuperAdmin || isFullAdmin || userRole === 'admin-customers';
  const canAccessPartners = isSuperAdmin || isFullAdmin || userRole === 'admin-partners';
  const canAccessBookings = isSuperAdmin || isFullAdmin || userRole === 'admin-bookings';

  // Sidebar Tabs - filtered based on role
  const allTabs = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-th-large', roles: ['super-admin', 'admin', 'admin-customers', 'admin-partners', 'admin-bookings'] },
    { id: 'customers', label: 'Customers', icon: 'fas fa-users', roles: ['super-admin', 'admin', 'admin-customers'] },
    { id: 'partners', label: 'Partners', icon: 'fas fa-handshake', roles: ['super-admin', 'admin', 'admin-partners'] },
    { id: 'bookings', label: 'Bookings', icon: 'fas fa-calendar-check', roles: ['super-admin', 'admin', 'admin-bookings'] }
  ];

  const tabs = useMemo(() => {
    return allTabs.filter(tab => tab.roles.includes(userRole));
  }, [userRole]);

  // Get role display info
  const getRoleDisplayInfo = (role) => {
    const roleMap = {
      'super-admin': { label: 'Super Admin', color: '#dc2626', icon: 'fas fa-crown' },
      'admin': { label: 'Admin', color: '#7c3aed', icon: 'fas fa-user-shield' },
      'admin-customers': { label: 'Customer Admin', color: '#0891b2', icon: 'fas fa-users' },
      'admin-partners': { label: 'Partner Admin', color: '#059669', icon: 'fas fa-handshake' },
      'admin-bookings': { label: 'Booking Admin', color: '#d97706', icon: 'fas fa-calendar-check' }
    };
    return roleMap[role] || { label: role, color: '#64748b', icon: 'fas fa-user' };
  };

  const roleInfo = getRoleDisplayInfo(userRole);

  // Check authentication
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/admin-login');
      return;
    }
    
    const role = profile?.role || '';
    if (role !== 'super-admin' && !role.startsWith('admin')) {
      navigate('/admin-login');
      return;
    }

    if (profile?.status === 'inactive') {
      navigate('/admin-login');
      return;
    }
    
    setAccessChecked(true);
  }, [user, profile, authLoading, navigate]);

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', activeSection);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  }, [activeSection, location.pathname, navigate, location.search]);

  // Sync with URL on load
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeSection) {
      setActiveSection(tabFromUrl);
    }
  }, []);

  // One-time function to update existing users with registration IDs
  const updateExistingUsersWithRegistrationIds = async () => {
    console.log('Starting registration ID update...');
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      console.log('Found', snapshot.docs.length, 'users');
      
      let updatedCount = 0;
      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        if (!userData.registrationId) {
          const registrationId = `TA${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const userDocRef = doc(db, 'users', userDoc.id);
          await updateDoc(userDocRef, { registrationId });
          console.log('Updated user:', userData.email || userDoc.id, 'with ID:', registrationId);
          updatedCount++;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      console.log('Registration ID update complete. Updated', updatedCount, 'users');
    } catch (error) {
      console.error('Error updating user registration IDs:', error);
      console.error('Error details:', error.message);
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Update existing users with registration IDs (one-time)
      await updateExistingUsersWithRegistrationIds();
      
      await Promise.all([
        fetchCustomers(),
        fetchPartners(),
        fetchBookings(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      const usersRef = collection(db, 'users');
      // Fetch ALL users from Firebase users table
      const snapshot = await getDocs(usersRef);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersList);
      setFilteredCustomers(customersList);
      setStats(prev => ({ ...prev, totalCustomers: customersList.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle deactivate button click - show modal
  const handleDeactivateClick = (e, customer) => {
    e.stopPropagation();
    setCustomerToDeactivate(customer);
    setDeactivateReason('');
    setShowDeactivateModal(true);
  };

  // Handle activate button click - show modal
  const handleActivateClick = (e, customer) => {
    e.stopPropagation();
    setCustomerToActivate(customer);
    setActivateReason('');
    setShowActivateModal(true);
  };

  // Confirm deactivation with reason
  const confirmDeactivation = async () => {
    if (!deactivateReason.trim()) {
      alert('Please provide a reason for deactivating this account.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', customerToDeactivate.id);
      const timestamp = new Date().toISOString();
      
      // Create history entry
      const historyEntry = {
        action: 'deactivated',
        reason: deactivateReason.trim(),
        actionBy: user?.email || 'Admin',
        actionAt: timestamp
      };
      
      // Get existing history or create new array
      const existingHistory = customerToDeactivate.statusHistory || [];
      const newHistory = [historyEntry, ...existingHistory];
      
      await updateDoc(userDocRef, { 
        accountStatus: 'inactive',
        deactivationReason: deactivateReason.trim(),
        deactivatedBy: user?.email || 'Admin',
        statusUpdatedAt: timestamp,
        statusHistory: newHistory
      });
      
      // Update local state
      const updatedData = { 
        accountStatus: 'inactive', 
        deactivationReason: deactivateReason.trim(),
        deactivatedBy: user?.email || 'Admin',
        statusUpdatedAt: timestamp,
        statusHistory: newHistory
      };
      
      setCustomers(prev => prev.map(c => 
        c.id === customerToDeactivate.id ? { ...c, ...updatedData } : c
      ));
      setFilteredCustomers(prev => prev.map(c => 
        c.id === customerToDeactivate.id ? { ...c, ...updatedData } : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerToDeactivate.id) {
        setSelectedCustomer(prev => ({ ...prev, ...updatedData }));
      }
      
      setShowDeactivateModal(false);
      setCustomerToDeactivate(null);
      setDeactivateReason('');
      
      alert('Customer account deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating customer:', error);
      alert(`Failed to deactivate customer: ${error.message}`);
    }
  };

  // Confirm activation with reason
  const confirmActivation = async () => {
    if (!activateReason.trim()) {
      alert('Please provide a reason for activating this account.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', customerToActivate.id);
      const timestamp = new Date().toISOString();
      
      // Create history entry
      const historyEntry = {
        action: 'activated',
        reason: activateReason.trim(),
        actionBy: user?.email || 'Admin',
        actionAt: timestamp
      };
      
      // Get existing history or create new array
      const existingHistory = customerToActivate.statusHistory || [];
      const newHistory = [historyEntry, ...existingHistory];
      
      await updateDoc(userDocRef, { 
        accountStatus: 'active',
        activationReason: activateReason.trim(),
        reactivatedBy: user?.email || 'Admin',
        statusUpdatedAt: timestamp,
        statusHistory: newHistory
      });
      
      const updatedData = { 
        accountStatus: 'active', 
        activationReason: activateReason.trim(),
        reactivatedBy: user?.email || 'Admin',
        statusUpdatedAt: timestamp,
        statusHistory: newHistory
      };
      
      setCustomers(prev => prev.map(c => 
        c.id === customerToActivate.id ? { ...c, ...updatedData } : c
      ));
      setFilteredCustomers(prev => prev.map(c => 
        c.id === customerToActivate.id ? { ...c, ...updatedData } : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerToActivate.id) {
        setSelectedCustomer(prev => ({ ...prev, ...updatedData }));
      }
      
      setShowActivateModal(false);
      setCustomerToActivate(null);
      setActivateReason('');
      
      alert('Customer account activated successfully!');
    } catch (error) {
      console.error('Error activating customer:', error);
      alert(`Failed to activate customer: ${error.message}`);
    }
  };

  // Fetch Partners
  const fetchPartners = async () => {
    try {
      const data = await getAllPartners();
      setPartners(data);
      setFilteredPartners(data);
      setStats(prev => ({
        ...prev,
        totalPartners: data.length,
        activePartners: data.filter(p => p.status === 'approved').length,
        pendingPartners: data.filter(p => p.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      const bookingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsList);
      setFilteredBookings(bookingsList);
      
      const totalRevenue = bookingsList.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      setStats(prev => ({
        ...prev,
        totalBookings: bookingsList.length,
        totalRevenue
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch Recent Activities
  const fetchRecentActivities = async () => {
    try {
      // Get recent users (customers registered through Travel Axis)
      const usersRef = collection(db, 'users');
      const recentUsersQ = query(usersRef, orderBy('createdAt', 'desc'), limit(5));
      const usersSnapshot = await getDocs(recentUsersQ);
      
      const activities = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user',
        message: `New user registered: ${doc.data().name || doc.data().email}`,
        timestamp: doc.data().createdAt
      }));
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Filter Customers
  useEffect(() => {
    let result = customers;
    if (customerSearch) {
      const search = customerSearch.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.includes(search) ||
        c.registrationId?.toLowerCase().includes(search)
      );
    }
    setFilteredCustomers(result);
  }, [customerSearch, customers]);

  // Filter Partners
  useEffect(() => {
    let result = partners;
    if (partnerStatusFilter !== 'all') {
      result = result.filter(p => p.status === partnerStatusFilter);
    }
    if (partnerSearch) {
      const search = partnerSearch.toLowerCase();
      result = result.filter(p =>
        p.companyName?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.mobile?.includes(search)
      );
    }
    setFilteredPartners(result);
  }, [partnerSearch, partnerStatusFilter, partners]);

  // Filter Bookings
  useEffect(() => {
    let result = bookings;
    if (bookingStatusFilter !== 'all') {
      result = result.filter(b => b.status === bookingStatusFilter);
    }
    if (bookingSearch) {
      const search = bookingSearch.toLowerCase();
      result = result.filter(b =>
        b.bookingId?.toLowerCase().includes(search) ||
        b.customerName?.toLowerCase().includes(search) ||
        b.customerEmail?.toLowerCase().includes(search)
      );
    }
    setFilteredBookings(result);
  }, [bookingSearch, bookingStatusFilter, bookings]);

  // Notification Helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  // Date Formatter
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate age from Date of Birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Tab Click Handler
  const handleTabClick = (tabId) => {
    setActiveSection(tabId);
    setSidebarOpen(false);
  };

  // Customer Actions
  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerActiveTab('profile');
    setCustomerBookingSort('newest');
    setCustomerBookingFilter('all');
    setShowCustomerModal(true);
    
    // Fetch customer's bookings
    setCustomerBookingsLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', customer.id));
      const snapshot = await getDocs(q);
      const customerBookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomerBookings(customerBookingsData);
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      setCustomerBookings([]);
    } finally {
      setCustomerBookingsLoading(false);
    }
  };

  // Get filtered and sorted customer bookings
  const getFilteredCustomerBookings = () => {
    let result = [...customerBookings];
    
    // Apply filter
    if (customerBookingFilter !== 'all') {
      result = result.filter(b => b.status === customerBookingFilter);
    }
    
    // Apply sort
    result.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      
      if (customerBookingSort === 'newest') {
        return dateB - dateA;
      } else if (customerBookingSort === 'oldest') {
        return dateA - dateB;
      } else if (customerBookingSort === 'amount-high') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      } else if (customerBookingSort === 'amount-low') {
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      }
      return 0;
    });
    
    return result;
  };

  // Get customer booking stats
  const getCustomerBookingStats = () => {
    const total = customerBookings.length;
    const confirmed = customerBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const cancelled = customerBookings.filter(b => b.status === 'cancelled' || b.status === 'refund-requested').length;
    const pending = customerBookings.filter(b => b.status === 'pending').length;
    const totalSpent = customerBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    return { total, confirmed, cancelled, pending, totalSpent };
  };

  // Get booking type icon
  const getBookingTypeIcon = (type) => {
    const icons = {
      flight: 'fas fa-plane',
      hotel: 'fas fa-hotel',
      tour: 'fas fa-map-marked-alt',
      vehicle: 'fas fa-car',
      holiday: 'fas fa-umbrella-beach',
      bus: 'fas fa-bus'
    };
    return icons[type?.toLowerCase()] || 'fas fa-ticket-alt';
  };

  // Partner Actions
  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setPartnerActiveTab('company');
    setShowPartnerModal(true);
  };

  const handleApprovePartner = async (partner) => {
    setActionLoading(true);
    try {
      const result = await approvePartner(partner.id, 'admin');
      if (result && result.success) {
        const updatedPartner = { ...partner, partnerId: result.partnerId };
        await sendApprovalEmail(updatedPartner);
        showNotification(`Partner "${partner.companyName}" approved successfully!`, 'success');
        fetchPartners();
        setShowPartnerModal(false);
      } else {
        showNotification('Failed to approve partner', 'error');
      }
    } catch (error) {
      showNotification('Error approving partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPartner = async () => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a rejection reason', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const success = await rejectPartner(selectedPartner.id, rejectReason);
      if (success) {
        await sendRejectionEmail(selectedPartner, rejectReason);
        showNotification(`Partner "${selectedPartner.companyName}" rejected`, 'warning');
        fetchPartners();
        setShowRejectModal(false);
        setShowPartnerModal(false);
      } else {
        showNotification('Failed to reject partner', 'error');
      }
    } catch (error) {
      showNotification('Error rejecting partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePartner = async (partner) => {
    if (!window.confirm(`Delete "${partner.companyName}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const success = await deletePartner(partner.id);
      if (success) {
        showNotification(`Partner "${partner.companyName}" deleted`, 'success');
        fetchPartners();
        setShowPartnerModal(false);
      } else {
        showNotification('Failed to delete partner', 'error');
      }
    } catch (error) {
      showNotification('Error deleting partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePartnerStatus = async (partner) => {
    const newStatus = partner.status === 'approved' ? 'suspended' : 'approved';
    const action = newStatus === 'suspended' ? 'deactivate' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} "${partner.companyName}"?`)) return;
    
    setActionLoading(true);
    try {
      const partnerRef = doc(db, 'partners', partner.id);
      await updateDoc(partnerRef, { status: newStatus });
      showNotification(`Partner "${partner.companyName}" ${newStatus === 'suspended' ? 'deactivated' : 'activated'} successfully!`, 'success');
      fetchPartners();
    } catch (error) {
      showNotification(`Failed to ${action} partner`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDocument = (title, data) => {
    setDocumentToView({ title, data });
    setShowDocumentModal(true);
  };

  // Status Badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      active: 'status-approved',
      rejected: 'status-rejected',
      suspended: 'status-suspended',
      cancelled: 'status-rejected',
      completed: 'status-approved',
      confirmed: 'status-approved'
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status?.toUpperCase()}</span>;
  };

  // Render Dashboard Overview
  const renderOverview = () => (
    <div className="admin-overview">
      <h2 className="section-title"><i className="fas fa-chart-line"></i> Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card customers" onClick={() => setActiveSection('customers')}>
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
          <div className="stat-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
        
        <div className="admin-stat-card partners" onClick={() => setActiveSection('partners')}>
          <div className="stat-icon"><i className="fas fa-handshake"></i></div>
          <div className="stat-info">
            <h3>{stats.totalPartners}</h3>
            <p>Total Partners</p>
          </div>
          <div className="stat-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
        
        <div className="admin-stat-card active" onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('approved'); }}>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>{stats.activePartners}</h3>
            <p>Active Partners</p>
          </div>
          <div className="stat-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
        
        <div className="admin-stat-card pending" onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-info">
            <h3>{stats.pendingPartners}</h3>
            <p>Pending Approval</p>
          </div>
          <div className="stat-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
        
        <div className="admin-stat-card bookings" onClick={() => setActiveSection('bookings')}>
          <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
          <div className="stat-arrow"><i className="fas fa-arrow-right"></i></div>
        </div>
        
        <div className="admin-stat-card revenue">
          <div className="stat-icon"><i className="fas fa-rupee-sign"></i></div>
          <div className="stat-info">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="overview-grid">
        {/* Quick Actions */}
        <div className="overview-card quick-actions-card">
          <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
          <div className="quick-actions-list">
            <button onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}>
              <i className="fas fa-user-clock"></i>
              <span>Review Pending Partners ({stats.pendingPartners})</span>
            </button>
            <button onClick={() => setActiveSection('customers')}>
              <i className="fas fa-users"></i>
              <span>Manage Customers</span>
            </button>
            <button onClick={() => setActiveSection('bookings')}>
              <i className="fas fa-calendar-alt"></i>
              <span>View All Bookings</span>
            </button>
            <button onClick={fetchAllData}>
              <i className="fas fa-sync-alt"></i>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="overview-card recent-customers-card">
          <h3><i className="fas fa-user-plus"></i> Recent Customers</h3>
          <div className="recent-list">
            {customers.slice(0, 5).map(customer => (
              <div key={customer.id} className="recent-item" onClick={() => handleViewCustomer(customer)}>
                <div className="recent-avatar">
                  {customer.photoURL ? (
                    <img src={customer.photoURL} alt={customer.name} />
                  ) : (
                    <span>{customer.name?.charAt(0) || customer.email?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className="recent-info">
                  <strong>{customer.name || 'Unknown'}</strong>
                  <small>{customer.email}</small>
                </div>
                <small className="recent-date">{formatDate(customer.createdAt)}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Partners */}
        <div className="overview-card pending-partners-card">
          <h3><i className="fas fa-hourglass-half"></i> Pending Partners</h3>
          <div className="recent-list">
            {partners.filter(p => p.status === 'pending').slice(0, 5).map(partner => (
              <div key={partner.id} className="recent-item" onClick={() => handleViewPartner(partner)}>
                <div className="recent-avatar partner">
                  <i className="fas fa-building"></i>
                </div>
                <div className="recent-info">
                  <strong>{partner.companyName}</strong>
                  <small>{partner.email}</small>
                </div>
                <button className="review-btn" onClick={(e) => { e.stopPropagation(); handleViewPartner(partner); }}>
                  Review
                </button>
              </div>
            ))}
            {partners.filter(p => p.status === 'pending').length === 0 && (
              <div className="empty-recent">
                <i className="fas fa-check-circle"></i>
                <p>No pending partners</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Customers Tab
  const renderCustomers = () => {
    // Calculate customer stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newCustomers30Days = customers.filter(c => {
      const createdAt = c.createdAt?.toDate?.() || new Date(c.createdAt);
      return createdAt > thirtyDaysAgo;
    }).length;
    
    const newCustomers7Days = customers.filter(c => {
      const createdAt = c.createdAt?.toDate?.() || new Date(c.createdAt);
      return createdAt > sevenDaysAgo;
    }).length;

    const withPhone = customers.filter(c => c.phone).length;
    const withPhoto = customers.filter(c => c.photoURL).length;
    const withCompleteProfile = customers.filter(c => c.phone && c.address && c.city).length;

    // Calculate registration data for last 6 months
    const getMonthlyRegistrations = () => {
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        const count = customers.filter(c => {
          const createdAt = c.createdAt?.toDate?.() || new Date(c.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;
        months.push({
          name: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          count
        });
      }
      return months;
    };

    // Calculate customer bookings data
    const getBookingStats = () => {
      const customersWithBookings = customers.filter(c => {
        const customerBookingsList = bookings.filter(b => b.userId === c.id || b.userEmail === c.email);
        return customerBookingsList.length > 0;
      }).length;
      
      const totalCustomerBookings = bookings.filter(b => 
        customers.some(c => c.id === b.userId || c.email === b.userEmail)
      ).length;

      const avgBookingsPerCustomer = customersWithBookings > 0 
        ? (totalCustomerBookings / customersWithBookings).toFixed(1) 
        : 0;

      return { customersWithBookings, totalCustomerBookings, avgBookingsPerCustomer };
    };

    // Calculate profile completion breakdown
    const getProfileCompletion = () => {
      const withEmail = customers.filter(c => c.email).length;
      const withAddress = customers.filter(c => c.address).length;
      const withCity = customers.filter(c => c.city).length;
      const withDOB = customers.filter(c => c.dateOfBirth || c.dob).length;
      return { withEmail, withPhone, withAddress, withCity, withPhoto, withDOB };
    };

    const monthlyData = getMonthlyRegistrations();
    const maxMonthlyCount = Math.max(...monthlyData.map(m => m.count), 1);
    const bookingStats = getBookingStats();
    const profileStats = getProfileCompletion();

    return (
      <div className="admin-customers">
        {/* Customer Dashboard Overview */}
        <div className="customer-dashboard-overview">
          <div className="overview-header">
            <h2><i className="fas fa-chart-pie"></i> Customer Overview</h2>
            <p>Summary of all registered customers on your portal</p>
          </div>

          {/* Stats Cards */}
          <div className="customer-overview-stats">
            <div className="overview-stat-card primary">
              <div className="stat-icon-large">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>{customers.length}</h3>
                <p>Total Customers</p>
                <span className="stat-subtitle">All registered users</span>
              </div>
            </div>

            <div className="overview-stat-card success">
              <div className="stat-icon-large">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="stat-content">
                <h3>{newCustomers7Days}</h3>
                <p>New This Week</p>
                <span className="stat-subtitle">Last 7 days</span>
              </div>
            </div>

            <div className="overview-stat-card info">
              <div className="stat-icon-large">
                <i className="fas fa-calendar-plus"></i>
              </div>
              <div className="stat-content">
                <h3>{newCustomers30Days}</h3>
                <p>New This Month</p>
                <span className="stat-subtitle">Last 30 days</span>
              </div>
            </div>

            <div className="overview-stat-card warning">
              <div className="stat-icon-large">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-content">
                <h3>{withCompleteProfile}</h3>
                <p>Complete Profiles</p>
                <span className="stat-subtitle">Phone + Address</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="customer-charts-section">
            {/* Monthly Registrations Bar Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h4><i className="fas fa-chart-bar"></i> Monthly Registrations</h4>
                <span className="chart-subtitle">Last 6 months</span>
              </div>
              <div className="bar-chart">
                {monthlyData.map((month, index) => (
                  <div key={index} className="bar-column">
                    <div className="bar-value">{month.count}</div>
                    <div 
                      className="bar" 
                      style={{ height: `${(month.count / maxMonthlyCount) * 100}%` }}
                    ></div>
                    <div className="bar-label">{month.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Distribution Donut Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h4><i className="fas fa-chart-pie"></i> Customer Booking Status</h4>
                <span className="chart-subtitle">Booking distribution</span>
              </div>
              <div className="donut-chart-container">
                <div className="donut-chart">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path 
                      className="circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path 
                      className="circle booking-circle"
                      strokeDasharray={`${customers.length > 0 ? (bookingStats.customersWithBookings / customers.length) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="donut-center">
                    <span className="donut-value">{bookingStats.customersWithBookings}</span>
                    <span className="donut-label">With Bookings</span>
                  </div>
                </div>
                <div className="donut-legend">
                  <div className="legend-item">
                    <span className="legend-color booking"></span>
                    <span>With Bookings ({bookingStats.customersWithBookings})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color no-booking"></span>
                    <span>No Bookings ({customers.length - bookingStats.customersWithBookings})</span>
                  </div>
                  <div className="legend-stat">
                    <i className="fas fa-ticket-alt"></i>
                    <span>{bookingStats.totalCustomerBookings} Total Bookings</span>
                  </div>
                  <div className="legend-stat">
                    <i className="fas fa-calculator"></i>
                    <span>{bookingStats.avgBookingsPerCustomer} Avg per Customer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h4><i className="fas fa-user-check"></i> Profile Completion</h4>
                <span className="chart-subtitle">Field-wise breakdown</span>
              </div>
              <div className="horizontal-bars">
                <div className="h-bar-item">
                  <div className="h-bar-label">
                    <span>Email</span>
                    <span>{customers.length > 0 ? Math.round((profileStats.withEmail / customers.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill email" style={{ width: `${customers.length > 0 ? (profileStats.withEmail / customers.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="h-bar-item">
                  <div className="h-bar-label">
                    <span>Phone</span>
                    <span>{customers.length > 0 ? Math.round((profileStats.withPhone / customers.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill phone" style={{ width: `${customers.length > 0 ? (profileStats.withPhone / customers.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="h-bar-item">
                  <div className="h-bar-label">
                    <span>Photo</span>
                    <span>{customers.length > 0 ? Math.round((profileStats.withPhoto / customers.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill photo" style={{ width: `${customers.length > 0 ? (profileStats.withPhoto / customers.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="h-bar-item">
                  <div className="h-bar-label">
                    <span>Address</span>
                    <span>{customers.length > 0 ? Math.round((profileStats.withAddress / customers.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill address" style={{ width: `${customers.length > 0 ? (profileStats.withAddress / customers.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="h-bar-item">
                  <div className="h-bar-label">
                    <span>DOB</span>
                    <span>{customers.length > 0 ? Math.round((profileStats.withDOB / customers.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill dob" style={{ width: `${customers.length > 0 ? (profileStats.withDOB / customers.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="customer-quick-info">
            <div className="quick-info-card">
              <div className="quick-info-header">
                <i className="fas fa-address-book"></i>
                <h4>Contact Info</h4>
              </div>
              <div className="quick-info-stats">
                <div className="info-stat">
                  <span className="info-num">{withPhone}</span>
                  <span className="info-label">With Phone</span>
                </div>
                <div className="info-stat">
                  <span className="info-num">{customers.length - withPhone}</span>
                  <span className="info-label">No Phone</span>
                </div>
              </div>
              <div className="info-progress">
                <div className="progress-bar" style={{ width: `${(withPhone / customers.length) * 100}%` }}></div>
              </div>
              <span className="progress-label">{Math.round((withPhone / customers.length) * 100) || 0}% have phone numbers</span>
            </div>

            <div className="quick-info-card">
              <div className="quick-info-header">
                <i className="fas fa-camera"></i>
                <h4>Profile Photos</h4>
              </div>
              <div className="quick-info-stats">
                <div className="info-stat">
                  <span className="info-num">{withPhoto}</span>
                  <span className="info-label">With Photo</span>
                </div>
                <div className="info-stat">
                  <span className="info-num">{customers.length - withPhoto}</span>
                  <span className="info-label">No Photo</span>
                </div>
              </div>
              <div className="info-progress">
                <div className="progress-bar purple" style={{ width: `${(withPhoto / customers.length) * 100}%` }}></div>
              </div>
              <span className="progress-label">{Math.round((withPhoto / customers.length) * 100) || 0}% have profile photos</span>
            </div>

            <div className="quick-info-card">
              <div className="quick-info-header">
                <i className="fas fa-clock"></i>
                <h4>Recent Activity</h4>
              </div>
              <div className="recent-customers-mini">
                {customers.slice(0, 4).map(customer => (
                  <div key={customer.id} className="mini-customer" onClick={() => handleViewCustomer(customer)}>
                    <div className="mini-avatar">
                      {customer.photoURL ? (
                        <img src={customer.photoURL} alt={customer.name} />
                      ) : (
                        <span>{customer.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="mini-info">
                      <span className="mini-name">{customer.name || 'User'}</span>
                      <span className="mini-date">{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Customer List */}
        <div className="customer-list-section">
          <div className="list-section-header">
            <div className="header-left">
              <h3><i className="fas fa-list-ul"></i> All Registered Customers</h3>
              <span className="customer-count-badge">{customers.length} total</span>
              <button className="refresh-btn-small" onClick={fetchCustomers} disabled={loading} title="Refresh list">
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              </button>
            </div>
            <div className="customer-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, email, phone, customer ID..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <button className="clear-search" onClick={() => setCustomerSearch('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {customerSearch && (
            <div className="search-results-info">
              <i className="fas fa-filter"></i>
              <span>Showing {filteredCustomers.length} results for "<strong>{customerSearch}</strong>"</span>
            </div>
          )}

          {/* Customers List */}
          <div className="customer-list-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-users-slash"></i>
                <p>{customerSearch ? 'No customers match your search' : 'No customers found'}</p>
                {customerSearch && (
                  <button className="btn-clear-search" onClick={() => setCustomerSearch('')}>
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="customer-list">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} className={`customer-list-item ${customer.accountStatus === 'inactive' ? 'inactive' : ''}`} onClick={() => handleViewCustomer(customer)}>
                    <div className="customer-avatar-medium">
                      {customer.photoURL ? (
                        <img src={customer.photoURL} alt={customer.name} />
                      ) : (
                        <span>{customer.name?.charAt(0) || '?'}</span>
                      )}
                      <span className={`status-dot ${customer.accountStatus === 'inactive' ? 'inactive' : 'active'}`}></span>
                    </div>
                    <div className="customer-list-info">
                      <h4>{customer.name || 'Unknown User'}</h4>
                      <p>{customer.email}</p>
                      {customer.registrationId ? (
                        <span className="customer-reg-id has-id">
                          <i className="fas fa-id-badge"></i> {customer.registrationId}
                        </span>
                      ) : (
                        <span className="customer-reg-id no-id">
                          <i className="fas fa-exclamation-circle"></i> No Customer ID
                        </span>
                      )}
                    </div>
                    <div className="customer-list-meta">
                      <span className="meta-item">
                        <i className="fas fa-phone"></i>
                        {customer.phone || 'N/A'}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-calendar-alt"></i>
                        {formatDate(customer.createdAt)}
                      </span>
                      <span className={`account-status-badge ${customer.accountStatus === 'inactive' ? 'inactive' : 'active'}`}>
                        <i className={`fas ${customer.accountStatus === 'inactive' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        {customer.accountStatus === 'inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <div className="customer-list-actions">
                      {customer.accountStatus === 'inactive' ? (
                        <button 
                          className="toggle-status-btn activate"
                          onClick={(e) => handleActivateClick(e, customer)}
                          title="Activate Account"
                        >
                          <i className="fas fa-user-check"></i>
                          <span>Activate</span>
                        </button>
                      ) : (
                        <button 
                          className="toggle-status-btn deactivate"
                          onClick={(e) => handleDeactivateClick(e, customer)}
                          title="Deactivate Account"
                        >
                          <i className="fas fa-user-slash"></i>
                          <span>Deactivate</span>
                        </button>
                      )}
                      <button className="view-dashboard-btn">
                        <i className="fas fa-external-link-alt"></i>
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Partners Tab
  const renderPartners = () => (
    <div className="admin-partners">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-handshake"></i> Partner Management</h2>
        <div className="section-actions">
          <span className="total-count">{filteredPartners.length} partners</span>
          <button className="refresh-btn" onClick={fetchPartners} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Partner Stats */}
      <div className="partner-quick-stats">
        <div className={`quick-stat ${partnerStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setPartnerStatusFilter('all')}>
          <span className="stat-num">{partners.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className={`quick-stat pending ${partnerStatusFilter === 'pending' ? 'active' : ''}`} onClick={() => setPartnerStatusFilter('pending')}>
          <span className="stat-num">{partners.filter(p => p.status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className={`quick-stat approved ${partnerStatusFilter === 'approved' ? 'active' : ''}`} onClick={() => setPartnerStatusFilter('approved')}>
          <span className="stat-num">{partners.filter(p => p.status === 'approved').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className={`quick-stat rejected ${partnerStatusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setPartnerStatusFilter('rejected')}>
          <span className="stat-num">{partners.filter(p => p.status === 'rejected').length}</span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className={`quick-stat suspended ${partnerStatusFilter === 'suspended' ? 'active' : ''}`} onClick={() => setPartnerStatusFilter('suspended')}>
          <span className="stat-num">{partners.filter(p => p.status === 'suspended').length}</span>
          <span className="stat-label">Suspended</span>
        </div>
      </div>

      {/* Search */}
      <div className="admin-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by company, email, mobile..."
            value={partnerSearch}
            onChange={(e) => setPartnerSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Partners Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-handshake-slash"></i>
            <p>No partners found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(partner => (
                <tr key={partner.id}>
                  <td>
                    <div className="company-cell">
                      <strong>{partner.companyName}</strong>
                      <small>{partner.city}, {partner.state}</small>
                    </div>
                  </td>
                  <td>{partner.title} {partner.contactFirstName} {partner.contactLastName}</td>
                  <td>{partner.email}</td>
                  <td>{partner.mobile}</td>
                  <td>{formatDate(partner.registrationDate)}</td>
                  <td>{getStatusBadge(partner.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" onClick={() => handleViewPartner(partner)} title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      {partner.status === 'pending' && (
                        <>
                          <button className="btn-approve" onClick={() => handleApprovePartner(partner)} title="Approve">
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn-reject" onClick={() => { setSelectedPartner(partner); setShowRejectModal(true); }} title="Reject">
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      {(partner.status === 'approved' || partner.status === 'suspended') && (
                        <button 
                          className={partner.status === 'approved' ? 'btn-suspend' : 'btn-activate'}
                          onClick={() => handleTogglePartnerStatus(partner)}
                          title={partner.status === 'approved' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={partner.status === 'approved' ? 'fas fa-ban' : 'fas fa-check-circle'}></i>
                        </button>
                      )}
                      <button className="btn-delete" onClick={() => handleDeletePartner(partner)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Render Bookings Tab
  const renderBookings = () => (
    <div className="admin-bookings">
      <div className="section-header">
        <h2 className="section-title"><i className="fas fa-calendar-check"></i> Bookings Overview</h2>
        <div className="section-actions">
          <span className="total-count">{filteredBookings.length} bookings</span>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="booking-quick-stats">
        <div className={`quick-stat ${bookingStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('all')}>
          <span className="stat-num">{bookings.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className={`quick-stat confirmed ${bookingStatusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('confirmed')}>
          <span className="stat-num">{bookings.filter(b => b.status === 'confirmed').length}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className={`quick-stat completed ${bookingStatusFilter === 'completed' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('completed')}>
          <span className="stat-num">{bookings.filter(b => b.status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className={`quick-stat cancelled ${bookingStatusFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('cancelled')}>
          <span className="stat-num">{bookings.filter(b => b.status === 'cancelled').length}</span>
          <span className="stat-label">Cancelled</span>
        </div>
      </div>

      {/* Search */}
      <div className="admin-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by booking ID, customer name..."
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-times"></i>
            <p>No bookings found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td><strong>{booking.bookingId || booking.id?.slice(0, 8)}</strong></td>
                  <td>
                    <div className="customer-cell">
                      <strong>{booking.customerName || 'N/A'}</strong>
                      <small>{booking.customerEmail || ''}</small>
                    </div>
                  </td>
                  <td>
                    <span className="booking-type">
                      <i className={`fas ${booking.type === 'fleet' ? 'fa-car' : booking.type === 'hotel' ? 'fa-hotel' : 'fa-suitcase'}`}></i>
                      {booking.type || 'N/A'}
                    </span>
                  </td>
                  <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                  <td><strong>₹{(booking.totalAmount || 0).toLocaleString()}</strong></td>
                  <td>{getStatusBadge(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'customers':
        return canAccessCustomers ? renderCustomers() : renderAccessDenied('Customers');
      case 'partners':
        return canAccessPartners ? renderPartners() : renderAccessDenied('Partners');
      case 'bookings':
        return canAccessBookings ? renderBookings() : renderAccessDenied('Bookings');
      default:
        return renderOverview();
    }
  };

  // Render Access Denied
  const renderAccessDenied = (section) => (
    <div className="access-denied-section">
      <div className="access-denied-content">
        <i className="fas fa-lock"></i>
        <h2>Access Restricted</h2>
        <p>You don't have permission to access the {section} section.</p>
        <p>Contact your Super Admin to request access.</p>
        <button onClick={() => setActiveSection('overview')} className="back-to-dashboard-btn">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Show loading while checking auth
  if (authLoading || !accessChecked) {
    return (
      <div className="admin-portal">
        <div className="admin-loading-screen">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      {/* Notification */}
      {notification.show && (
        <div className={`admin-notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link">
            <i className="fas fa-plane-departure"></i>
            <span>TravelAxis</span>
          </Link>
        </div>

        <div className="admin-user-info">
          <div className="admin-user-avatar" style={{ borderColor: roleInfo.color }}>
            <i className={roleInfo.icon} style={{ color: roleInfo.color }}></i>
          </div>
          <h3>{profile?.name || user?.displayName || 'Admin'}</h3>
          <p className="admin-user-email">{profile?.email || user?.email || ''}</p>
          <span className="admin-role-badge" style={{ background: roleInfo.color }}>
            <i className={roleInfo.icon}></i> {roleInfo.label}
          </span>
        </div>

        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeSection === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
              {tab.id === 'partners' && stats.pendingPartners > 0 && canAccessPartners && (
                <span className="nav-badge">{stats.pendingPartners}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {isSuperAdmin && (
            <button className="admin-mgmt-btn" onClick={() => navigate('/management-portal')}>
              <i className="fas fa-users-cog"></i>
              <span>Manage Employees</span>
            </button>
          )}
          <button className="admin-logout-btn" onClick={async () => {
            await signOut(auth);
            navigate('/admin-login');
          }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="admin-header-title">
              <h1>{tabs.find(t => t.id === activeSection)?.label || 'Dashboard'}</h1>
              <p className="admin-welcome">Welcome back, {profile?.name || user?.displayName || 'Admin'}! Manage your portal here.</p>
            </div>
          </div>
          <div className="admin-header-right">
            <button className="admin-refresh-btn" onClick={fetchAllData} disabled={loading}>
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Customer Dashboard Modal */}
      {showCustomerModal && selectedCustomer && createPortal(
        <div className="modal-overlay customer-dashboard-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="customer-dashboard-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header with Customer Info */}
            <div className="customer-modal-header">
              <div className="customer-header-content">
                <div className="customer-avatar-xlarge">
                  {selectedCustomer.photoURL ? (
                    <img src={selectedCustomer.photoURL} alt={selectedCustomer.name} />
                  ) : (
                    <span>{selectedCustomer.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className="customer-header-info">
                  <h2>{selectedCustomer.name || 'Unknown Customer'}</h2>
                  <p className="customer-email-header">{selectedCustomer.email}</p>
                  <div className="customer-header-meta">
                    <span><i className="fas fa-calendar-alt"></i> Joined {formatDate(selectedCustomer.createdAt)}</span>
                    <span><i className="fas fa-phone"></i> {selectedCustomer.phone || 'No phone'}</span>
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCustomerModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Customer Stats Row */}
            <div className="customer-modal-stats">
              <div className="modal-stat-card">
                <div className="modal-stat-icon total">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="modal-stat-info">
                  <h4>{getCustomerBookingStats().total}</h4>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-icon confirmed">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="modal-stat-info">
                  <h4>{getCustomerBookingStats().confirmed}</h4>
                  <p>Confirmed</p>
                </div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-icon cancelled">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="modal-stat-info">
                  <h4>{getCustomerBookingStats().cancelled}</h4>
                  <p>Cancelled</p>
                </div>
              </div>
              <div className="modal-stat-card">
                <div className="modal-stat-icon spent">
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <div className="modal-stat-info">
                  <h4>₹{getCustomerBookingStats().totalSpent.toLocaleString()}</h4>
                  <p>Total Spent</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="customer-modal-tabs">
              <button 
                className={`customer-tab-btn ${customerActiveTab === 'profile' ? 'active' : ''}`} 
                onClick={() => setCustomerActiveTab('profile')}
              >
                <i className="fas fa-user"></i><span>Profile</span>
              </button>
              <button 
                className={`customer-tab-btn ${customerActiveTab === 'bookings' ? 'active' : ''}`} 
                onClick={() => setCustomerActiveTab('bookings')}
              >
                <i className="fas fa-suitcase-rolling"></i><span>Bookings</span>
              </button>
              <button 
                className={`customer-tab-btn ${customerActiveTab === 'cancellations' ? 'active' : ''}`} 
                onClick={() => setCustomerActiveTab('cancellations')}
              >
                <i className="fas fa-ban"></i><span>Cancellations</span>
              </button>
              <button 
                className={`customer-tab-btn ${customerActiveTab === 'analytics' ? 'active' : ''}`} 
                onClick={() => setCustomerActiveTab('analytics')}
              >
                <i className="fas fa-chart-bar"></i><span>Analytics</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="customer-modal-body">
              {/* Profile Tab */}
              {customerActiveTab === 'profile' && (
                <div className="customer-profile-content">
                  <div className="profile-section">
                    <h3><i className="fas fa-id-card"></i> Personal Information</h3>
                    <div className="profile-info-grid">
                      <div className="profile-info-item highlight">
                        <label>Registration ID</label>
                        <span className="reg-id-value">{selectedCustomer.registrationId || 'N/A'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Full Name</label>
                        <span>{selectedCustomer.name || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Email Address</label>
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Phone Number</label>
                        <span>{selectedCustomer.phone || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Gender</label>
                        <span>{selectedCustomer.gender || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Date of Birth</label>
                        <span>{selectedCustomer.dateOfBirth || selectedCustomer.dob || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Age</label>
                        <span>
                          {calculateAge(selectedCustomer.dateOfBirth || selectedCustomer.dob) !== null 
                            ? `${calculateAge(selectedCustomer.dateOfBirth || selectedCustomer.dob)} years` 
                            : 'Not available'}
                        </span>
                      </div>
                      <div className="profile-info-item">
                        <label>Member Since</label>
                        <span>{formatDateTime(selectedCustomer.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3><i className="fas fa-map-marker-alt"></i> Address Details</h3>
                    <div className="profile-info-grid">
                      <div className="profile-info-item full">
                        <label>Address</label>
                        <span>{selectedCustomer.address || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>City</label>
                        <span>{selectedCustomer.city || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>State</label>
                        <span>{selectedCustomer.state || 'Not provided'}</span>
                      </div>
                      <div className="profile-info-item">
                        <label>Pincode</label>
                        <span>{selectedCustomer.pincode || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Section */}
                  <div className={`profile-section account-status-section ${selectedCustomer.accountStatus === 'inactive' ? 'inactive' : 'active'}`}>
                    <h3>
                      <i className={`fas ${selectedCustomer.accountStatus === 'inactive' ? 'fa-user-slash' : 'fa-user-check'}`}></i> 
                      Account Status
                    </h3>
                    <div className="account-status-content">
                      <div className="status-badge-large">
                        <span className={`status-indicator ${selectedCustomer.accountStatus === 'inactive' ? 'inactive' : 'active'}`}>
                          <i className={`fas ${selectedCustomer.accountStatus === 'inactive' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                          {selectedCustomer.accountStatus === 'inactive' ? 'Deactivated' : 'Active'}
                        </span>
                      </div>
                      
                      {selectedCustomer.accountStatus === 'inactive' && (
                        <div className="deactivation-details">
                          <div className="deactivation-reason-box">
                            <label><i className="fas fa-exclamation-triangle"></i> Reason for Deactivation</label>
                            <p>{selectedCustomer.deactivationReason || 'No reason provided'}</p>
                          </div>
                          <div className="deactivation-meta">
                            <span><i className="fas fa-user-tie"></i> Deactivated by: {selectedCustomer.deactivatedBy || 'Unknown'}</span>
                            <span><i className="fas fa-clock"></i> On: {formatDateTime(selectedCustomer.statusUpdatedAt)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="status-actions">
                        {selectedCustomer.accountStatus === 'inactive' ? (
                          <button 
                            className="status-action-btn activate"
                            onClick={(e) => handleActivateClick(e, selectedCustomer)}
                          >
                            <i className="fas fa-user-check"></i> Activate Account
                          </button>
                        ) : (
                          <button 
                            className="status-action-btn deactivate"
                            onClick={(e) => handleDeactivateClick(e, selectedCustomer)}
                          >
                            <i className="fas fa-user-slash"></i> Deactivate Account
                          </button>
                        )}
                      </div>

                      {/* Status History */}
                      {selectedCustomer.statusHistory && selectedCustomer.statusHistory.length > 0 && (
                        <div className="status-history-section">
                          <h4><i className="fas fa-history"></i> Account Status History</h4>
                          <div className="status-history-timeline">
                            {selectedCustomer.statusHistory
                              .sort((a, b) => new Date(b.actionAt) - new Date(a.actionAt))
                              .map((history, index) => (
                                <div key={index} className={`history-item ${history.action}`}>
                                  <div className="history-icon">
                                    <i className={`fas ${history.action === 'activated' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                                  </div>
                                  <div className="history-content">
                                    <div className="history-header">
                                      <span className={`history-action ${history.action}`}>
                                        {history.action === 'activated' ? 'Account Activated' : 'Account Deactivated'}
                                      </span>
                                      <span className="history-date">{formatDateTime(history.actionAt)}</span>
                                    </div>
                                    <div className="history-details">
                                      <p className="history-reason">
                                        <i className="fas fa-comment-alt"></i> {history.reason || 'No reason provided'}
                                      </p>
                                      <p className="history-by">
                                        <i className="fas fa-user-tie"></i> By: {history.actionBy}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {customerActiveTab === 'bookings' && (
                <div className="customer-bookings-content">
                  {/* Filters and Sort */}
                  <div className="bookings-controls">
                    <div className="booking-filters">
                      <button 
                        className={`filter-btn ${customerBookingFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCustomerBookingFilter('all')}
                      >
                        All ({customerBookings.length})
                      </button>
                      <button 
                        className={`filter-btn ${customerBookingFilter === 'confirmed' ? 'active' : ''}`}
                        onClick={() => setCustomerBookingFilter('confirmed')}
                      >
                        Confirmed
                      </button>
                      <button 
                        className={`filter-btn ${customerBookingFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setCustomerBookingFilter('pending')}
                      >
                        Pending
                      </button>
                      <button 
                        className={`filter-btn ${customerBookingFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setCustomerBookingFilter('completed')}
                      >
                        Completed
                      </button>
                    </div>
                    <div className="booking-sort">
                      <label>Sort by:</label>
                      <select value={customerBookingSort} onChange={(e) => setCustomerBookingSort(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount-high">Amount (High to Low)</option>
                        <option value="amount-low">Amount (Low to High)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bookings List */}
                  {customerBookingsLoading ? (
                    <div className="loading-state">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading bookings...</p>
                    </div>
                  ) : getFilteredCustomerBookings().length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-suitcase"></i>
                      <p>No bookings found</p>
                    </div>
                  ) : (
                    <div className="bookings-history-list">
                      {getFilteredCustomerBookings().map(booking => (
                        <div key={booking.id} className="booking-history-card">
                          <div className="booking-history-icon">
                            <i className={getBookingTypeIcon(booking.type)}></i>
                          </div>
                          <div className="booking-history-info">
                            <h4>{booking.destination || booking.packageName || booking.hotelName || 'Booking'}</h4>
                            <div className="booking-history-meta">
                              <span><i className="fas fa-hashtag"></i> {booking.bookingId || booking.id.slice(0, 8)}</span>
                              <span><i className="fas fa-calendar"></i> {formatDate(booking.travelDate || booking.createdAt)}</span>
                              <span><i className="fas fa-users"></i> {booking.travelers || booking.guests || 1} travelers</span>
                            </div>
                          </div>
                          <div className="booking-history-amount">
                            <span className="amount">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cancellations Tab */}
              {customerActiveTab === 'cancellations' && (
                <div className="customer-cancellations-content">
                  <div className="cancellation-summary">
                    <div className="summary-card">
                      <i className="fas fa-times-circle"></i>
                      <div>
                        <h4>{customerBookings.filter(b => b.status === 'cancelled').length}</h4>
                        <p>Cancelled Bookings</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <i className="fas fa-undo"></i>
                      <div>
                        <h4>{customerBookings.filter(b => b.status === 'refund-requested').length}</h4>
                        <p>Refund Requested</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <i className="fas fa-check-double"></i>
                      <div>
                        <h4>{customerBookings.filter(b => b.status === 'refunded').length}</h4>
                        <p>Refunded</p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation History */}
                  <h3 className="section-subtitle"><i className="fas fa-history"></i> Cancellation History</h3>
                  {customerBookings.filter(b => ['cancelled', 'refund-requested', 'refunded'].includes(b.status)).length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-smile"></i>
                      <p>No cancellations! This customer has a great track record.</p>
                    </div>
                  ) : (
                    <div className="cancellation-list">
                      {customerBookings
                        .filter(b => ['cancelled', 'refund-requested', 'refunded'].includes(b.status))
                        .sort((a, b) => {
                          const dateA = a.cancelledAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
                          const dateB = b.cancelledAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
                          return dateB - dateA;
                        })
                        .map(booking => (
                          <div key={booking.id} className="cancellation-item">
                            <div className="cancellation-icon">
                              <i className={getBookingTypeIcon(booking.type)}></i>
                            </div>
                            <div className="cancellation-info">
                              <h4>{booking.destination || booking.packageName || 'Booking'}</h4>
                              <p className="cancel-reason">{booking.cancelReason || 'No reason provided'}</p>
                              <div className="cancellation-meta">
                                <span><i className="fas fa-calendar-times"></i> Cancelled: {formatDate(booking.cancelledAt || booking.updatedAt)}</span>
                                <span><i className="fas fa-rupee-sign"></i> Refund: ₹{(booking.refundAmount || booking.totalAmount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="cancellation-status">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {customerActiveTab === 'analytics' && (
                <div className="customer-analytics-content">
                  {/* Booking Timeline */}
                  <div className="analytics-section">
                    <h3><i className="fas fa-chart-line"></i> Booking Activity</h3>
                    <div className="booking-timeline">
                      {(() => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const currentYear = new Date().getFullYear();
                        const monthlyData = months.map((month, index) => {
                          const count = customerBookings.filter(b => {
                            const date = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                            return date.getMonth() === index && date.getFullYear() === currentYear;
                          }).length;
                          return { month, count };
                        });
                        const maxCount = Math.max(...monthlyData.map(d => d.count), 1);
                        
                        return (
                          <div className="timeline-chart">
                            {monthlyData.map((data, index) => (
                              <div key={index} className="timeline-bar-container">
                                <div 
                                  className="timeline-bar" 
                                  style={{ height: `${(data.count / maxCount) * 100}%` }}
                                  title={`${data.month}: ${data.count} bookings`}
                                >
                                  {data.count > 0 && <span className="bar-value">{data.count}</span>}
                                </div>
                                <span className="timeline-label">{data.month}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Booking Types Distribution */}
                  <div className="analytics-section">
                    <h3><i className="fas fa-pie-chart"></i> Booking Types</h3>
                    <div className="booking-types-grid">
                      {(() => {
                        const types = {};
                        customerBookings.forEach(b => {
                          const type = b.type || 'other';
                          types[type] = (types[type] || 0) + 1;
                        });
                        return Object.entries(types).map(([type, count]) => (
                          <div key={type} className="type-stat-card">
                            <i className={getBookingTypeIcon(type)}></i>
                            <div>
                              <h4>{count}</h4>
                              <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                            </div>
                          </div>
                        ));
                      })()}
                      {Object.keys(customerBookings.reduce((acc, b) => ({ ...acc, [b.type || 'other']: true }), {})).length === 0 && (
                        <div className="empty-state small">
                          <p>No booking data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spending Summary */}
                  <div className="analytics-section">
                    <h3><i className="fas fa-rupee-sign"></i> Spending Summary</h3>
                    <div className="spending-stats">
                      <div className="spending-stat">
                        <label>Total Spent</label>
                        <span className="amount">₹{getCustomerBookingStats().totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="spending-stat">
                        <label>Average Booking</label>
                        <span className="amount">
                          ₹{customerBookings.length > 0 
                            ? Math.round(getCustomerBookingStats().totalSpent / Math.max(getCustomerBookingStats().confirmed, 1)).toLocaleString() 
                            : 0}
                        </span>
                      </div>
                      <div className="spending-stat">
                        <label>Highest Booking</label>
                        <span className="amount">
                          ₹{Math.max(...customerBookings.map(b => b.totalAmount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="customer-modal-footer">
              <button className="btn-back" onClick={() => setShowCustomerModal(false)}>
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Partner Detail Modal */}
      {showPartnerModal && selectedPartner && createPortal(
        <div className="modal-overlay" onClick={() => setShowPartnerModal(false)}>
          <div className="partner-detail-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="partner-modal-header">
              <div className="partner-header-content">
                <div className="partner-avatar">
                  <i className="fas fa-building"></i>
                </div>
                <div className="partner-header-info">
                  <h2>{selectedPartner.companyName}</h2>
                  <p><i className="fas fa-map-marker-alt"></i> {selectedPartner.city}, {selectedPartner.state}</p>
                  <div className="partner-header-badges">
                    {getStatusBadge(selectedPartner.status)}
                    {selectedPartner.partnerId && (
                      <span className="partner-id-badge">ID: {selectedPartner.partnerId}</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPartnerModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="partner-modal-tabs">
              <button className={`tab-btn ${partnerActiveTab === 'company' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('company')}>
                <i className="fas fa-building"></i><span>Company</span>
              </button>
              <button className={`tab-btn ${partnerActiveTab === 'contact' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('contact')}>
                <i className="fas fa-user"></i><span>Contact</span>
              </button>
              <button className={`tab-btn ${partnerActiveTab === 'business' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('business')}>
                <i className="fas fa-briefcase"></i><span>Business</span>
              </button>
              <button className={`tab-btn ${partnerActiveTab === 'documents' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('documents')}>
                <i className="fas fa-file-alt"></i><span>Documents</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="partner-modal-body">
              {partnerActiveTab === 'company' && (
                <div className="tab-content">
                  <div className="info-cards-grid">
                    <div className="info-card">
                      <div className="info-card-icon"><i className="fas fa-building"></i></div>
                      <div className="info-card-content">
                        <label>Company Name</label>
                        <span>{selectedPartner.companyName}</span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-icon"><i className="fas fa-globe"></i></div>
                      <div className="info-card-content">
                        <label>Country</label>
                        <span>{selectedPartner.country}</span>
                      </div>
                    </div>
                    <div className="info-card full-width">
                      <div className="info-card-icon"><i className="fas fa-map-marker-alt"></i></div>
                      <div className="info-card-content">
                        <label>Full Address</label>
                        <span>
                          {selectedPartner.address1}{selectedPartner.address2 && `, ${selectedPartner.address2}`}<br />
                          {selectedPartner.city}, {selectedPartner.state} - {selectedPartner.pincode}
                        </span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-icon"><i className="fas fa-calendar-alt"></i></div>
                      <div className="info-card-content">
                        <label>Registration Date</label>
                        <span>{formatDateTime(selectedPartner.registrationDate)}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPartner.rejectionReason && (
                    <div className="rejection-alert">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div>
                        <strong>Rejection Reason</strong>
                        <p>{selectedPartner.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {partnerActiveTab === 'contact' && (
                <div className="tab-content">
                  <div className="contact-profile">
                    <div className="contact-avatar"><i className="fas fa-user"></i></div>
                    <h3>{selectedPartner.title} {selectedPartner.contactFirstName} {selectedPartner.contactLastName}</h3>
                    <p>Primary Contact Person</p>
                  </div>
                  <div className="contact-details-grid">
                    <div className="contact-detail-card">
                      <div className="contact-icon email"><i className="fas fa-envelope"></i></div>
                      <div className="contact-info">
                        <label>Email Address</label>
                        <a href={`mailto:${selectedPartner.email}`}>{selectedPartner.email}</a>
                      </div>
                    </div>
                    <div className="contact-detail-card">
                      <div className="contact-icon phone"><i className="fas fa-mobile-alt"></i></div>
                      <div className="contact-info">
                        <label>Mobile Number</label>
                        <a href={`tel:${selectedPartner.mobile}`}>{selectedPartner.mobile}</a>
                      </div>
                    </div>
                    <div className="contact-detail-card">
                      <div className="contact-icon landline"><i className="fas fa-phone"></i></div>
                      <div className="contact-info">
                        <label>Landline</label>
                        <span>{selectedPartner.landline || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === 'business' && (
                <div className="tab-content">
                  <div className="business-stats-grid">
                    <div className="business-stat-card">
                      <div className="stat-visual"><i className="fas fa-chart-line"></i></div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.monthlySalesVolume}</span>
                        <span className="stat-label">Monthly Sales Volume</span>
                      </div>
                    </div>
                    <div className="business-stat-card">
                      <div className="stat-visual iata"><i className="fas fa-plane"></i></div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.iata || 'N/A'}</span>
                        <span className="stat-label">IATA Code</span>
                      </div>
                    </div>
                    <div className="business-stat-card">
                      <div className="stat-visual referral"><i className="fas fa-user-friends"></i></div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.referredBy || 'Direct'}</span>
                        <span className="stat-label">Referred By</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === 'documents' && (
                <div className="tab-content">
                  <div className="documents-grid">
                    <div className="document-card">
                      <div className="document-header">
                        <div className="document-icon address"><i className="fas fa-id-card"></i></div>
                        <div className="document-title">
                          <h4>Address Proof</h4>
                          <span>{selectedPartner.addressProofType || 'Not specified'}</span>
                        </div>
                      </div>
                      {selectedPartner.addressProofData ? (
                        <div className="document-preview">
                          <img src={selectedPartner.addressProofData} alt="Address Proof" onClick={() => handleViewDocument('Address Proof', selectedPartner.addressProofData)} />
                          <div className="document-actions">
                            <button className="view-doc-btn" onClick={() => handleViewDocument('Address Proof', selectedPartner.addressProofData)}>
                              <i className="fas fa-expand"></i> View Full Size
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="no-document"><i className="fas fa-file-times"></i><p>No document uploaded</p></div>
                      )}
                    </div>
                    <div className="document-card">
                      <div className="document-header">
                        <div className="document-icon pan"><i className="fas fa-credit-card"></i></div>
                        <div className="document-title">
                          <h4>PAN Card</h4>
                          <span>{selectedPartner.panNumber}</span>
                        </div>
                      </div>
                      <div className="pan-holder-info">
                        <label>Card Holder Name</label>
                        <span>{selectedPartner.panCardHolderName}</span>
                      </div>
                      {selectedPartner.panCardData ? (
                        <div className="document-preview">
                          <img src={selectedPartner.panCardData} alt="PAN Card" onClick={() => handleViewDocument('PAN Card', selectedPartner.panCardData)} />
                          <div className="document-actions">
                            <button className="view-doc-btn" onClick={() => handleViewDocument('PAN Card', selectedPartner.panCardData)}>
                              <i className="fas fa-expand"></i> View Full Size
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="no-document"><i className="fas fa-file-times"></i><p>No document uploaded</p></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="partner-modal-footer">
              {selectedPartner.status === 'pending' && (
                <div className="action-buttons-group">
                  <button className="action-btn approve" onClick={() => handleApprovePartner(selectedPartner)} disabled={actionLoading}>
                    {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                    Approve
                  </button>
                  <button className="action-btn reject" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                    <i className="fas fa-times-circle"></i> Reject
                  </button>
                </div>
              )}
              {(selectedPartner.status === 'approved' || selectedPartner.status === 'suspended') && (
                <button 
                  className={`action-btn ${selectedPartner.status === 'approved' ? 'suspend' : 'activate'}`}
                  onClick={() => handleTogglePartnerStatus(selectedPartner)}
                  disabled={actionLoading}
                >
                  <i className={selectedPartner.status === 'approved' ? 'fas fa-ban' : 'fas fa-check-circle'}></i>
                  {selectedPartner.status === 'approved' ? 'Deactivate' : 'Activate'}
                </button>
              )}
              <button className="action-btn close" onClick={() => setShowPartnerModal(false)}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && documentToView.data && createPortal(
        <div className="document-viewer-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="document-viewer" onClick={e => e.stopPropagation()}>
            <div className="document-viewer-header">
              <h3><i className="fas fa-file-image"></i> {documentToView.title}</h3>
              <button className="close-viewer-btn" onClick={() => setShowDocumentModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="document-viewer-body">
              <img src={documentToView.data} alt={documentToView.title} />
            </div>
            <div className="document-viewer-footer">
              <a href={documentToView.data} download={`${documentToView.title}.jpg`} className="download-doc-btn">
                <i className="fas fa-download"></i> Download
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {showRejectModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="reject-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-exclamation-triangle"></i> Reject Partner</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="reject-warning">
                <p>You are about to reject <strong>{selectedPartner?.companyName}</strong>.</p>
                <p>Please provide a detailed reason:</p>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-reject-lg" onClick={handleRejectPartner} disabled={actionLoading}>
                {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                Confirm Rejection
              </button>
              <button className="btn btn-close" onClick={() => setShowRejectModal(false)}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Deactivate Customer Modal */}
      {showDeactivateModal && customerToDeactivate && createPortal(
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="deactivate-modal" onClick={e => e.stopPropagation()}>
            <div className="deactivate-modal-header">
              <div className="deactivate-icon">
                <i className="fas fa-user-slash"></i>
              </div>
              <h3>Deactivate Account</h3>
              <p>You are about to deactivate the following account:</p>
            </div>
            
            <div className="deactivate-customer-info">
              <div className="deactivate-avatar">
                {customerToDeactivate.photoURL ? (
                  <img src={customerToDeactivate.photoURL} alt={customerToDeactivate.name} />
                ) : (
                  <span>{customerToDeactivate.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="deactivate-details">
                <h4>{customerToDeactivate.name || 'Unknown User'}</h4>
                <p>{customerToDeactivate.email}</p>
              </div>
            </div>

            <div className="deactivate-reason-input">
              <label><i className="fas fa-comment-alt"></i> Reason for Deactivation <span className="required">*</span></label>
              <textarea
                placeholder="Please provide a reason for deactivating this account (e.g., Violation of terms, Fraudulent activity, User request, etc.)"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                rows={4}
              ></textarea>
              <span className="char-count">{deactivateReason.length}/500 characters</span>
            </div>

            <div className="deactivate-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>This action will immediately prevent the user from logging in. You can reactivate the account later from the admin panel.</p>
            </div>

            <div className="deactivate-modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeactivateModal(false)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                className="btn-deactivate" 
                onClick={confirmDeactivation}
                disabled={!deactivateReason.trim()}
              >
                <i className="fas fa-user-slash"></i> Deactivate Account
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Activate Customer Modal */}
      {showActivateModal && customerToActivate && createPortal(
        <div className="modal-overlay" onClick={() => setShowActivateModal(false)}>
          <div className="deactivate-modal activate-modal" onClick={e => e.stopPropagation()}>
            <div className="deactivate-modal-header activate-header">
              <div className="deactivate-icon activate-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <h3>Activate Account</h3>
              <p>You are about to activate the following account:</p>
            </div>
            
            <div className="deactivate-customer-info">
              <div className="deactivate-avatar">
                {customerToActivate.photoURL ? (
                  <img src={customerToActivate.photoURL} alt={customerToActivate.name} />
                ) : (
                  <span>{customerToActivate.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="deactivate-details">
                <h4>{customerToActivate.name || 'Unknown User'}</h4>
                <p>{customerToActivate.email}</p>
              </div>
            </div>

            {customerToActivate.deactivationReason && (
              <div className="previous-deactivation-info">
                <label><i className="fas fa-exclamation-circle"></i> Previous Deactivation Reason</label>
                <p>{customerToActivate.deactivationReason}</p>
              </div>
            )}

            <div className="deactivate-reason-input activate-reason-input">
              <label><i className="fas fa-comment-alt"></i> Reason for Activation <span className="required">*</span></label>
              <textarea
                placeholder="Please provide a reason for activating this account (e.g., Issue resolved, User verification completed, Appeal approved, etc.)"
                value={activateReason}
                onChange={(e) => setActivateReason(e.target.value)}
                rows={4}
              ></textarea>
              <span className="char-count">{activateReason.length}/500 characters</span>
            </div>

            <div className="activate-info">
              <i className="fas fa-info-circle"></i>
              <p>This action will immediately restore the user's access. They will be able to log in and use the platform again.</p>
            </div>

            <div className="deactivate-modal-actions">
              <button className="btn-cancel" onClick={() => setShowActivateModal(false)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                className="btn-activate" 
                onClick={confirmActivation}
                disabled={!activateReason.trim()}
              >
                <i className="fas fa-user-check"></i> Activate Account
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPortal;
