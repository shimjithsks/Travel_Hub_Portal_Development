import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, limit, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { getAllPartners, approvePartner, rejectPartner, deletePartner } from '../../services/partnerService';
import { sendApprovalEmail, sendRejectionEmail } from '../../services/emailService';
import LoadingSpinner from '../../components/LoadingSpinner';
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
  const [bookingViewMode, setBookingViewMode] = useState('dashboard'); // 'dashboard' or 'list'
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  
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
  
  // Partner Deactivation Modal State
  const [showPartnerDeactivateModal, setShowPartnerDeactivateModal] = useState(false);
  const [partnerDeactivateReason, setPartnerDeactivateReason] = useState('');
  const [partnerToDeactivate, setPartnerToDeactivate] = useState(null);
  
  // Partner Activation Modal State
  const [showPartnerActivateModal, setShowPartnerActivateModal] = useState(false);
  const [partnerActivateReason, setPartnerActivateReason] = useState('');
  const [partnerToActivate, setPartnerToActivate] = useState(null);

  // Partner Dashboard View State
  const [partnerViewMode, setPartnerViewMode] = useState('dashboard'); // 'dashboard' or 'list'
  const [partnerAnalytics, setPartnerAnalytics] = useState({
    totalBookings: 0,
    vehicleBookings: 0,
    holidayBookings: 0,
    hotelBookings: 0,
    flightBookings: 0,
    totalRevenue: 0,
    topPartners: [],
    topCustomers: [],
    monthlyBookings: [],
    recentBookings: []
  });

  // Partner Bookings State (for modal)
  const [selectedPartnerBookings, setSelectedPartnerBookings] = useState([]);
  const [selectedPartnerCustomers, setSelectedPartnerCustomers] = useState([]);

  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [complaintTypeFilter, setComplaintTypeFilter] = useState('all');
  const [complaintSourceFilter, setComplaintSourceFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintResponse, setComplaintResponse] = useState('');
  const [complaintViewMode, setComplaintViewMode] = useState('dashboard');

  // Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Get user role
  const userRole = profile?.role || '';
  const isSuperAdmin = userRole === 'super-admin';
  const isDelegatedAdmin = userRole === 'delegated-super-admin';
  const isFullAdmin = userRole === 'admin';
  
  // Role-based access control - Super Admin and Delegated Admin have full access
  const canAccessCustomers = isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-customers';
  const canAccessPartners = isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-partners';
  const canAccessBookings = isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-bookings';
  const canAccessComplaints = isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-customers' || userRole === 'admin-partners';

  // Sidebar Tabs - filtered based on role (Super Admin and Delegated Admin see all)
  const allTabs = [
    { id: 'overview', label: 'Dashboard', icon: 'fas fa-th-large', roles: ['super-admin', 'delegated-super-admin', 'admin', 'admin-customers', 'admin-partners', 'admin-bookings'] },
    { id: 'customers', label: 'Customers', icon: 'fas fa-users', roles: ['super-admin', 'delegated-super-admin', 'admin', 'admin-customers'] },
    { id: 'partners', label: 'Partners', icon: 'fas fa-handshake', roles: ['super-admin', 'delegated-super-admin', 'admin', 'admin-partners'] },
    { id: 'bookings', label: 'Bookings', icon: 'fas fa-calendar-check', roles: ['super-admin', 'delegated-super-admin', 'admin', 'admin-bookings'] },
    { id: 'complaints', label: 'Complaints', icon: 'fas fa-exclamation-triangle', roles: ['super-admin', 'delegated-super-admin', 'admin', 'admin-customers', 'admin-partners'] }
  ];

  const tabs = useMemo(() => {
    return allTabs.filter(tab => tab.roles.includes(userRole));
  }, [userRole]);

  // Get role display info
  const getRoleDisplayInfo = (role) => {
    const roleMap = {
      'super-admin': { label: 'Super Admin', color: '#dc2626', icon: 'fas fa-crown' },
      'delegated-super-admin': { label: 'Delegated Admin', color: '#ea580c', icon: 'fas fa-user-tie' },
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
    
    // Allow super-admin, delegated-super-admin, and all admin-* roles
    const isValidRole = role === 'super-admin' || role === 'delegated-super-admin' || role.startsWith('admin');
    
    if (!isValidRole) {
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
        fetchRecentActivities(),
        fetchComplaints()
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

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      // Try to fetch from Firestore complaints collection
      const complaintsRef = collection(db, 'complaints');
      const snapshot = await getDocs(complaintsRef);
      
      const complaintsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplaints(complaintsData);
      setFilteredComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
      setFilteredComplaints([]);
    }
  };

  // Filter complaints
  useEffect(() => {
    let filtered = [...complaints];
    
    // Search filter
    if (complaintSearch) {
      const search = complaintSearch.toLowerCase();
      filtered = filtered.filter(c => 
        c.subject?.toLowerCase().includes(search) ||
        c.customerName?.toLowerCase().includes(search) ||
        c.partnerName?.toLowerCase().includes(search) ||
        c.id?.toLowerCase().includes(search) ||
        c.bookingId?.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (complaintStatusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === complaintStatusFilter);
    }
    
    // Type filter (customer/partner)
    if (complaintSourceFilter !== 'all') {
      filtered = filtered.filter(c => c.type === complaintSourceFilter);
    }
    
    // Category filter
    if (complaintTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.category === complaintTypeFilter);
    }
    
    setFilteredComplaints(filtered);
  }, [complaints, complaintSearch, complaintStatusFilter, complaintSourceFilter, complaintTypeFilter]);

  // Handle complaint response
  const handleComplaintResponse = async () => {
    if (!complaintResponse.trim()) {
      showNotification('Please enter a response', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const newResponse = {
        message: complaintResponse,
        respondedBy: profile?.name || 'Admin',
        respondedAt: new Date().toISOString()
      };

      // Update in Firestore
      const complaintRef = doc(db, 'complaints', selectedComplaint.id);
      await updateDoc(complaintRef, {
        responses: [...(selectedComplaint.responses || []), newResponse],
        status: 'in-progress',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedComplaints = complaints.map(c => {
        if (c.id === selectedComplaint.id) {
          return {
            ...c,
            responses: [...(c.responses || []), newResponse],
            status: 'in-progress'
          };
        }
        return c;
      });
      
      setComplaints(updatedComplaints);
      setSelectedComplaint(prev => ({
        ...prev,
        responses: [...(prev.responses || []), newResponse],
        status: 'in-progress'
      }));
      setComplaintResponse('');
      showNotification('Response added successfully. Customer/Partner will be notified.', 'success');
    } catch (error) {
      console.error('Error adding response:', error);
      showNotification('Failed to add response', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve complaint
  const handleResolveComplaint = async (complaint) => {
    setActionLoading(true);
    try {
      const resolvedAt = new Date().toISOString();

      // Update in Firestore
      const complaintRef = doc(db, 'complaints', complaint.id);
      await updateDoc(complaintRef, {
        status: 'resolved',
        resolvedAt: resolvedAt,
        updatedAt: resolvedAt
      });

      // Update local state
      const updatedComplaints = complaints.map(c => {
        if (c.id === complaint.id) {
          return {
            ...c,
            status: 'resolved',
            resolvedAt: resolvedAt
          };
        }
        return c;
      });
      
      setComplaints(updatedComplaints);
      if (selectedComplaint?.id === complaint.id) {
        setSelectedComplaint(prev => ({
          ...prev,
          status: 'resolved',
          resolvedAt: resolvedAt
        }));
      }
      showNotification('Complaint marked as resolved. Customer/Partner will be notified.', 'success');
    } catch (error) {
      console.error('Error resolving complaint:', error);
      showNotification('Failed to resolve complaint', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch Customers
  // Admin/Management roles that should be excluded from customer list
  const managementRoles = ['super-admin', 'delegated-super-admin', 'admin', 'admin-customers', 'admin-partners', 'admin-bookings', 'employee'];

  const fetchCustomers = async () => {
    try {
      const usersRef = collection(db, 'users');
      // Fetch ALL users from Firebase users table
      const snapshot = await getDocs(usersRef);
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out management/admin users - only show actual customers
      const customersList = allUsers.filter(user => {
        const userRole = user.role || '';
        // Exclude users who have management/admin roles
        return !managementRoles.includes(userRole);
      });
      
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

  // Calculate Partner Analytics from bookings
  const calculatePartnerAnalytics = useCallback(() => {
    if (!bookings.length) return;
    
    // Service type categorization
    const vehicleBookings = bookings.filter(b => 
      b.bookingType === 'vehicle' || b.serviceType === 'vehicle' || b.type === 'vehicle' || b.type === 'fleet'
    );
    const holidayBookings = bookings.filter(b => 
      b.bookingType === 'holiday' || b.serviceType === 'holiday' || b.type === 'holiday' || b.bookingType === 'tour'
    );
    const hotelBookings = bookings.filter(b => 
      b.bookingType === 'hotel' || b.serviceType === 'hotel' || b.type === 'hotel'
    );
    const flightBookings = bookings.filter(b => 
      b.bookingType === 'flight' || b.serviceType === 'flight' || b.type === 'flight'
    );
    
    // Calculate revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);
    
    // Group bookings by partner
    const partnerBookingsMap = {};
    bookings.forEach(booking => {
      const partnerId = booking.partnerId || booking.partnerEmail || 'Unknown';
      if (!partnerBookingsMap[partnerId]) {
        partnerBookingsMap[partnerId] = {
          partnerId,
          partnerName: booking.partnerName || booking.partnerCompany || 'Unknown Partner',
          bookings: [],
          totalRevenue: 0,
          customerCount: new Set()
        };
      }
      partnerBookingsMap[partnerId].bookings.push(booking);
      partnerBookingsMap[partnerId].totalRevenue += (booking.totalAmount || booking.amount || 0);
      if (booking.customerEmail || booking.userId) {
        partnerBookingsMap[partnerId].customerCount.add(booking.customerEmail || booking.userId);
      }
    });
    
    // Top partners by bookings
    const topPartners = Object.values(partnerBookingsMap)
      .map(p => ({ ...p, customerCount: p.customerCount.size }))
      .sort((a, b) => b.bookings.length - a.bookings.length)
      .slice(0, 5);
    
    // Group bookings by customer
    const customerBookingsMap = {};
    bookings.forEach(booking => {
      const customerId = booking.customerEmail || booking.userId || booking.userEmail || 'Unknown';
      if (!customerBookingsMap[customerId]) {
        customerBookingsMap[customerId] = {
          customerId,
          customerName: booking.customerName || booking.userName || 'Unknown Customer',
          customerEmail: customerId,
          bookings: [],
          totalSpent: 0
        };
      }
      customerBookingsMap[customerId].bookings.push(booking);
      customerBookingsMap[customerId].totalSpent += (booking.totalAmount || booking.amount || 0);
    });
    
    // Top customers by booking count
    const topCustomers = Object.values(customerBookingsMap)
      .sort((a, b) => b.bookings.length - a.bookings.length)
      .slice(0, 5);
    
    // Monthly bookings for last 6 months
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short' });
      monthlyData[monthKey] = { month: monthKey, count: 0, revenue: 0 };
    }
    
    bookings.forEach(booking => {
      const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt || booking.bookingDate);
      if (bookingDate && !isNaN(bookingDate)) {
        const monthKey = bookingDate.toLocaleString('default', { month: 'short' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].count++;
          monthlyData[monthKey].revenue += (booking.totalAmount || booking.amount || 0);
        }
      }
    });
    
    // Recent bookings
    const recentBookings = [...bookings]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || a.bookingDate || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || b.bookingDate || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
    
    setPartnerAnalytics({
      totalBookings: bookings.length,
      vehicleBookings: vehicleBookings.length,
      holidayBookings: holidayBookings.length,
      hotelBookings: hotelBookings.length,
      flightBookings: flightBookings.length,
      totalRevenue,
      topPartners,
      topCustomers,
      monthlyBookings: Object.values(monthlyData),
      recentBookings
    });
  }, [bookings]);

  // Run analytics when bookings change
  useEffect(() => {
    calculatePartnerAnalytics();
  }, [calculatePartnerAnalytics]);

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
    if (bookingTypeFilter !== 'all') {
      result = result.filter(b => 
        (b.bookingType || b.serviceType || b.type)?.toLowerCase() === bookingTypeFilter.toLowerCase()
      );
    }
    if (bookingSearch) {
      const search = bookingSearch.toLowerCase();
      result = result.filter(b =>
        b.bookingId?.toLowerCase().includes(search) ||
        b.customerName?.toLowerCase().includes(search) ||
        b.customerEmail?.toLowerCase().includes(search) ||
        b.partnerName?.toLowerCase().includes(search) ||
        b.partnerId?.toLowerCase().includes(search)
      );
    }
    setFilteredBookings(result);
  }, [bookingSearch, bookingStatusFilter, bookingTypeFilter, bookings]);

  // Calculate Bookings Dashboard Analytics
  const bookingsAnalytics = useMemo(() => {
    const COMMISSION_RATE = 0.10; // 10% commission per booking
    
    // Total revenue and commission
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);
    const totalCommission = totalRevenue * COMMISSION_RATE;
    
    // Bookings by type
    const vehicleBookings = bookings.filter(b => 
      ['vehicle', 'fleet', 'car'].includes((b.bookingType || b.serviceType || b.type)?.toLowerCase())
    );
    const holidayBookings = bookings.filter(b => 
      ['holiday', 'tour', 'package'].includes((b.bookingType || b.serviceType || b.type)?.toLowerCase())
    );
    const hotelBookings = bookings.filter(b => 
      ['hotel', 'accommodation'].includes((b.bookingType || b.serviceType || b.type)?.toLowerCase())
    );
    
    // Bookings by status
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    
    // Partner-wise breakdown
    const partnerBookingsMap = {};
    bookings.forEach(booking => {
      const partnerId = booking.partnerId || booking.partnerEmail || 'Direct';
      if (!partnerBookingsMap[partnerId]) {
        partnerBookingsMap[partnerId] = {
          partnerId,
          partnerName: booking.partnerName || booking.partnerCompany || (partnerId === 'Direct' ? 'Direct Booking' : 'Unknown Partner'),
          bookings: [],
          totalRevenue: 0,
          commission: 0,
          customerSet: new Set()
        };
      }
      partnerBookingsMap[partnerId].bookings.push(booking);
      const amount = booking.totalAmount || booking.amount || 0;
      partnerBookingsMap[partnerId].totalRevenue += amount;
      partnerBookingsMap[partnerId].commission += amount * COMMISSION_RATE;
      if (booking.customerEmail || booking.userId) {
        partnerBookingsMap[partnerId].customerSet.add(booking.customerEmail || booking.userId);
      }
    });
    
    // Top partners by revenue
    const topPartnersByRevenue = Object.values(partnerBookingsMap)
      .map(p => ({ ...p, customerCount: p.customerSet.size }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
    
    // Monthly bookings trend (last 6 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[key] = { month: key, bookings: 0, revenue: 0, commission: 0 };
    }
    
    bookings.forEach(b => {
      const date = new Date(b.createdAt || b.bookingDate);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlyData[key]) {
        monthlyData[key].bookings++;
        monthlyData[key].revenue += (b.totalAmount || b.amount || 0);
        monthlyData[key].commission += (b.totalAmount || b.amount || 0) * COMMISSION_RATE;
      }
    });
    
    // Recent bookings with partner info
    const recentWithPartner = [...bookings]
      .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
      .slice(0, 10)
      .map(b => ({
        ...b,
        commission: (b.totalAmount || b.amount || 0) * COMMISSION_RATE
      }));
    
    return {
      totalBookings: bookings.length,
      totalRevenue,
      totalCommission,
      commissionRate: COMMISSION_RATE * 100,
      vehicleBookings: vehicleBookings.length,
      holidayBookings: holidayBookings.length,
      hotelBookings: hotelBookings.length,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      topPartnersByRevenue,
      monthlyData: Object.values(monthlyData),
      recentWithPartner,
      partnerCount: Object.keys(partnerBookingsMap).length
    };
  }, [bookings]);

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
    
    // Calculate partner-specific bookings
    const partnerEmail = partner.email?.toLowerCase();
    const partnerIdValue = partner.partnerId;
    
    const partnerBookings = bookings.filter(b => {
      const bookingPartnerId = b.partnerId || b.partnerEmail || '';
      return (
        bookingPartnerId.toLowerCase() === partnerEmail ||
        bookingPartnerId === partnerIdValue ||
        b.partnerEmail?.toLowerCase() === partnerEmail
      );
    });
    
    setSelectedPartnerBookings(partnerBookings);
    
    // Extract unique customers from partner bookings
    const customerMap = {};
    partnerBookings.forEach(b => {
      const customerId = b.customerEmail || b.userEmail || b.userId || 'Unknown';
      if (!customerMap[customerId] && customerId !== 'Unknown') {
        customerMap[customerId] = {
          id: customerId,
          name: b.customerName || b.userName || b.guestName || 'Unknown Customer',
          email: b.customerEmail || b.userEmail || '',
          phone: b.customerPhone || b.userPhone || b.phone || '',
          bookingsCount: 0,
          totalSpent: 0,
          lastBooking: null
        };
      }
      if (customerMap[customerId]) {
        customerMap[customerId].bookingsCount++;
        customerMap[customerId].totalSpent += (b.totalAmount || b.amount || 0);
        const bookingDate = b.createdAt || b.bookingDate;
        if (!customerMap[customerId].lastBooking || new Date(bookingDate) > new Date(customerMap[customerId].lastBooking)) {
          customerMap[customerId].lastBooking = bookingDate;
        }
      }
    });
    
    setSelectedPartnerCustomers(Object.values(customerMap).sort((a, b) => b.bookingsCount - a.bookingsCount));
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

  // Handle partner deactivate button click - show modal
  const handlePartnerDeactivateClick = (e, partner) => {
    if (e) e.stopPropagation();
    setPartnerToDeactivate(partner);
    setPartnerDeactivateReason('');
    setShowPartnerDeactivateModal(true);
  };

  // Handle partner activate button click - show modal
  const handlePartnerActivateClick = (e, partner) => {
    if (e) e.stopPropagation();
    setPartnerToActivate(partner);
    setPartnerActivateReason('');
    setShowPartnerActivateModal(true);
  };

  // Confirm partner deactivation with reason
  const confirmPartnerDeactivation = async () => {
    if (!partnerToDeactivate || !partnerDeactivateReason.trim()) return;
    
    setActionLoading(true);
    try {
      const partnerRef = doc(db, 'partners', partnerToDeactivate.id);
      
      // Create history entry
      const historyEntry = {
        action: 'deactivated',
        reason: partnerDeactivateReason.trim(),
        actionBy: profile?.name || profile?.email || 'Admin',
        actionAt: new Date().toISOString()
      };
      
      // Get existing history or create new array
      const existingHistory = partnerToDeactivate.statusHistory || [];
      
      await updateDoc(partnerRef, {
        status: 'suspended',
        deactivationReason: partnerDeactivateReason.trim(),
        deactivatedBy: profile?.name || profile?.email || 'Admin',
        statusUpdatedAt: new Date().toISOString(),
        statusHistory: [...existingHistory, historyEntry]
      });
      
      showNotification(`Partner "${partnerToDeactivate.companyName}" has been deactivated`, 'success');
      setShowPartnerDeactivateModal(false);
      setPartnerToDeactivate(null);
      setPartnerDeactivateReason('');
      fetchPartners();
      
      // Update selected partner if viewing
      if (selectedPartner && selectedPartner.id === partnerToDeactivate.id) {
        setSelectedPartner({
          ...selectedPartner,
          status: 'suspended',
          deactivationReason: partnerDeactivateReason.trim(),
          deactivatedBy: profile?.name || profile?.email || 'Admin',
          statusUpdatedAt: new Date().toISOString(),
          statusHistory: [...existingHistory, historyEntry]
        });
      }
    } catch (error) {
      console.error('Error deactivating partner:', error);
      showNotification('Failed to deactivate partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm partner activation with reason
  const confirmPartnerActivation = async () => {
    if (!partnerToActivate || !partnerActivateReason.trim()) return;
    
    setActionLoading(true);
    try {
      const partnerRef = doc(db, 'partners', partnerToActivate.id);
      
      // Create history entry
      const historyEntry = {
        action: 'activated',
        reason: partnerActivateReason.trim(),
        actionBy: profile?.name || profile?.email || 'Admin',
        actionAt: new Date().toISOString()
      };
      
      // Get existing history or create new array
      const existingHistory = partnerToActivate.statusHistory || [];
      
      await updateDoc(partnerRef, {
        status: 'approved',
        activationReason: partnerActivateReason.trim(),
        activatedBy: profile?.name || profile?.email || 'Admin',
        statusUpdatedAt: new Date().toISOString(),
        deactivationReason: null,
        deactivatedBy: null,
        statusHistory: [...existingHistory, historyEntry]
      });
      
      showNotification(`Partner "${partnerToActivate.companyName}" has been activated`, 'success');
      setShowPartnerActivateModal(false);
      setPartnerToActivate(null);
      setPartnerActivateReason('');
      fetchPartners();
      
      // Update selected partner if viewing
      if (selectedPartner && selectedPartner.id === partnerToActivate.id) {
        setSelectedPartner({
          ...selectedPartner,
          status: 'approved',
          activationReason: partnerActivateReason.trim(),
          activatedBy: profile?.name || profile?.email || 'Admin',
          statusUpdatedAt: new Date().toISOString(),
          deactivationReason: null,
          deactivatedBy: null,
          statusHistory: [...existingHistory, historyEntry]
        });
      }
    } catch (error) {
      console.error('Error activating partner:', error);
      showNotification('Failed to activate partner', 'error');
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

  // Render Dashboard Overview - Role-Based Modern Design
  const renderOverview = () => {
    // Calculate advanced analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Customer Analytics
    const newCustomers30Days = customers.filter(c => {
      const createdAt = c.createdAt?.toDate?.() || new Date(c.createdAt);
      return createdAt > thirtyDaysAgo;
    }).length;
    
    const newCustomers7Days = customers.filter(c => {
      const createdAt = c.createdAt?.toDate?.() || new Date(c.createdAt);
      return createdAt > sevenDaysAgo;
    }).length;

    const activeCustomers = customers.filter(c => c.status !== 'inactive').length;
    
    // Partner Analytics
    const approvedPartners = partners.filter(p => p.status === 'approved').length;
    const pendingPartners = partners.filter(p => p.status === 'pending').length;
    const rejectedPartners = partners.filter(p => p.status === 'rejected').length;
    
    const newPartners30Days = partners.filter(p => {
      const createdAt = p.createdAt?.toDate?.() || new Date(p.createdAt);
      return createdAt > thirtyDaysAgo;
    }).length;
    
    // Booking Analytics
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const vehicleBookings = bookings.filter(b => 
      b.bookingType === 'vehicle' || b.bookingType === 'fleet' || b.bookingType === 'car'
    ).length;
    const holidayBookings = bookings.filter(b => 
      b.bookingType === 'holiday' || b.bookingType === 'tour' || b.bookingType === 'package'
    ).length;
    const hotelBookings = bookings.filter(b => 
      b.bookingType === 'hotel' || b.bookingType === 'accommodation'
    ).length;
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);
    const totalCommission = totalRevenue * 0.10;
    
    // Monthly data for chart
    const getMonthlyData = () => {
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
        
        const monthBookings = bookings.filter(b => {
          const date = b.createdAt?.toDate?.() || new Date(b.createdAt || b.bookingDate);
          return date >= monthStart && date <= monthEnd;
        });
        
        const monthCustomers = customers.filter(c => {
          const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
          return date >= monthStart && date <= monthEnd;
        }).length;
        
        const monthPartners = partners.filter(p => {
          const date = p.createdAt?.toDate?.() || new Date(p.createdAt);
          return date >= monthStart && date <= monthEnd;
        }).length;
        
        months.push({
          month: monthName,
          bookings: monthBookings.length,
          revenue: monthBookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0),
          customers: monthCustomers,
          partners: monthPartners
        });
      }
      return months;
    };
    
    const monthlyData = getMonthlyData();
    const maxMonthlyBookings = Math.max(...monthlyData.map(m => m.bookings), 1);
    const maxMonthlyRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
    
    // Top performing partners
    const partnerBookingCounts = {};
    bookings.forEach(b => {
      const partnerId = b.partnerId || b.operatorId;
      if (partnerId) {
        partnerBookingCounts[partnerId] = (partnerBookingCounts[partnerId] || 0) + 1;
      }
    });
    
    const topPartners = Object.entries(partnerBookingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([partnerId, count]) => {
        const partner = partners.find(p => p.id === partnerId || p.partnerId === partnerId);
        return { 
          id: partnerId, 
          name: partner?.companyName || partner?.businessName || 'Unknown Partner',
          count,
          revenue: bookings.filter(b => (b.partnerId || b.operatorId) === partnerId)
            .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0)
        };
      });

    return (
      <div className="admin-overview-modern">
        {/* Welcome Header */}
        <div className="overview-welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>Welcome back, {profile?.name || 'Admin'}!</h1>
              <p>Here's what's happening with your platform today</p>
            </div>
            <div className="welcome-meta">
              <div className="role-indicator" style={{ backgroundColor: roleInfo.color + '15', borderColor: roleInfo.color }}>
                <i className={roleInfo.icon} style={{ color: roleInfo.color }}></i>
                <span style={{ color: roleInfo.color }}>{roleInfo.label}</span>
              </div>
              <div className="last-updated">
                <i className="fas fa-clock"></i>
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators - Role Based & Rearranged */}
        <div className="overview-kpi-grid">
          {/* For admin-customers: Customers first */}
          {userRole === 'admin-customers' && (
            <>
              <div className="kpi-card customers-kpi primary-kpi" onClick={() => setActiveSection('customers')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon customers">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Customers</span>
                  <h2 className="kpi-value">{customers.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat">
                      <i className="fas fa-user-plus"></i>
                      +{newCustomers7Days} this week
                    </span>
                  </div>
                </div>
                <div className="kpi-trend positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>{newCustomers30Days}</span>
                </div>
              </div>
              <div className="kpi-card revenue-kpi">
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon revenue">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Revenue</span>
                  <h2 className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-commission">
                      <i className="fas fa-percentage"></i>
                      ₹{totalCommission.toLocaleString('en-IN')} Commission
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* For admin-partners: Partners first */}
          {userRole === 'admin-partners' && (
            <>
              <div className="kpi-card partners-kpi primary-kpi" onClick={() => setActiveSection('partners')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon partners">
                    <i className="fas fa-handshake"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Partners</span>
                  <h2 className="kpi-value">{partners.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat approved">
                      <i className="fas fa-check-circle"></i>
                      {approvedPartners} Active
                    </span>
                    {pendingPartners > 0 && (
                      <span className="kpi-substat pending">
                        <i className="fas fa-clock"></i>
                        {pendingPartners} Pending
                      </span>
                    )}
                  </div>
                </div>
                {pendingPartners > 0 && (
                  <div className="kpi-alert">
                    <span>{pendingPartners}</span>
                  </div>
                )}
              </div>
              <div className="kpi-card revenue-kpi">
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon revenue">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Revenue</span>
                  <h2 className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-commission">
                      <i className="fas fa-percentage"></i>
                      ₹{totalCommission.toLocaleString('en-IN')} Commission
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* For admin-bookings: Bookings first */}
          {userRole === 'admin-bookings' && (
            <>
              <div className="kpi-card bookings-kpi primary-kpi" onClick={() => setActiveSection('bookings')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon bookings">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Bookings</span>
                  <h2 className="kpi-value">{bookings.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat confirmed">
                      <i className="fas fa-check"></i>
                      {confirmedBookings} Confirmed
                    </span>
                    <span className="kpi-substat completed">
                      <i className="fas fa-flag-checkered"></i>
                      {completedBookings} Completed
                    </span>
                  </div>
                </div>
                <div className="kpi-trend neutral">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
              <div className="kpi-card revenue-kpi">
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon revenue">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Revenue</span>
                  <h2 className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-commission">
                      <i className="fas fa-percentage"></i>
                      ₹{totalCommission.toLocaleString('en-IN')} Commission
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* For super-admin, delegated-admin, and admin: Show all KPIs */}
          {(isSuperAdmin || isDelegatedAdmin || isFullAdmin) && (
            <>
              <div className="kpi-card revenue-kpi">
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon revenue">
                    <i className="fas fa-rupee-sign"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Revenue</span>
                  <h2 className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-commission">
                      <i className="fas fa-percentage"></i>
                      ₹{totalCommission.toLocaleString('en-IN')} Commission
                    </span>
                  </div>
                </div>
                <div className="kpi-trend positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>12%</span>
                </div>
              </div>

              <div className="kpi-card customers-kpi" onClick={() => setActiveSection('customers')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon customers">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Customers</span>
                  <h2 className="kpi-value">{customers.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat">
                      <i className="fas fa-user-plus"></i>
                      +{newCustomers7Days} this week
                    </span>
                  </div>
                </div>
                <div className="kpi-trend positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>{newCustomers30Days}</span>
                </div>
              </div>

              <div className="kpi-card partners-kpi" onClick={() => setActiveSection('partners')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon partners">
                    <i className="fas fa-handshake"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Partners</span>
                  <h2 className="kpi-value">{partners.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat approved">
                      <i className="fas fa-check-circle"></i>
                      {approvedPartners} Active
                    </span>
                    {pendingPartners > 0 && (
                      <span className="kpi-substat pending">
                        <i className="fas fa-clock"></i>
                        {pendingPartners} Pending
                      </span>
                    )}
                  </div>
                </div>
                {pendingPartners > 0 && (
                  <div className="kpi-alert">
                    <span>{pendingPartners}</span>
                  </div>
                )}
              </div>

              <div className="kpi-card bookings-kpi" onClick={() => setActiveSection('bookings')}>
                <div className="kpi-icon-wrapper">
                  <div className="kpi-icon bookings">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Bookings</span>
                  <h2 className="kpi-value">{bookings.length.toLocaleString()}</h2>
                  <div className="kpi-footer">
                    <span className="kpi-substat confirmed">
                      <i className="fas fa-check"></i>
                      {confirmedBookings} Confirmed
                    </span>
                    <span className="kpi-substat completed">
                      <i className="fas fa-flag-checkered"></i>
                      {completedBookings} Completed
                    </span>
                  </div>
                </div>
                <div className="kpi-trend neutral">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Analytics Grid - Role Based & Rearranged */}
        <div className="overview-analytics-grid">
          
          {/* Left Column - Rearranged based on role */}
          <div className="analytics-column left">
            
            {/* For admin-customers: Customer-focused chart first */}
            {userRole === 'admin-customers' && (
              <div className="analytics-card customer-growth-card">
                <div className="card-header">
                  <h3><i className="fas fa-user-plus"></i> Customer Growth</h3>
                </div>
                <div className="customer-growth-content">
                  <div className="growth-stats">
                    <div className="growth-stat">
                      <div className="growth-number">{newCustomers30Days}</div>
                      <div className="growth-label">New (30 days)</div>
                    </div>
                    <div className="growth-stat">
                      <div className="growth-number">{newCustomers7Days}</div>
                      <div className="growth-label">This Week</div>
                    </div>
                    <div className="growth-stat">
                      <div className="growth-number">{activeCustomers}</div>
                      <div className="growth-label">Active</div>
                    </div>
                  </div>
                  <div className="growth-chart">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="growth-bar-wrapper">
                        <div 
                          className="growth-bar" 
                          style={{ height: `${(data.customers / Math.max(...monthlyData.map(m => m.customers), 1)) * 100}%` }}
                        >
                          <span className="growth-value">{data.customers}</span>
                        </div>
                        <span className="growth-month">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* For admin-partners: Partner-focused section first */}
            {userRole === 'admin-partners' && pendingPartners > 0 && (
              <div className="analytics-card pending-card large">
                <div className="card-header">
                  <h3><i className="fas fa-hourglass-half"></i> Pending Partner Approvals</h3>
                  <span className="pending-count">{pendingPartners}</span>
                </div>
                <div className="pending-list">
                  {partners.filter(p => p.status === 'pending').slice(0, 6).map(partner => (
                    <div key={partner.id} className="pending-item" onClick={() => handleViewPartner(partner)}>
                      <div className="pending-avatar">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="pending-info">
                        <strong>{partner.companyName || partner.businessName}</strong>
                        <small>{partner.email}</small>
                      </div>
                      <button className="review-action-btn">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  ))}
                </div>
                {pendingPartners > 6 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}
                  >
                    View All ({pendingPartners})
                  </button>
                )}
              </div>
            )}

            {/* For admin-bookings: Booking distribution first */}
            {userRole === 'admin-bookings' && (
              <div className="analytics-card distribution-card">
                <div className="card-header">
                  <h3><i className="fas fa-pie-chart"></i> Booking Distribution</h3>
                </div>
                <div className="distribution-grid">
                  <div className="distribution-item vehicle">
                    <div className="dist-icon">
                      <i className="fas fa-car"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{vehicleBookings}</h4>
                      <p>Vehicle Rentals</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((vehicleBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div className="distribution-item holiday">
                    <div className="dist-icon">
                      <i className="fas fa-umbrella-beach"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{holidayBookings}</h4>
                      <p>Holiday Packages</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((holidayBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div className="distribution-item hotel">
                    <div className="dist-icon">
                      <i className="fas fa-hotel"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{hotelBookings}</h4>
                      <p>Hotel Bookings</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((hotelBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trend Chart - All roles (shown for super-admin/delegated-admin/admin or as secondary for others) */}
            {(isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-bookings') && (
              <div className="analytics-card trend-card">
                <div className="card-header">
                  <h3><i className="fas fa-chart-area"></i> Monthly Overview</h3>
                  <div className="chart-legend">
                    {canAccessBookings && <span className="legend-item bookings"><span className="dot"></span> Bookings</span>}
                    {canAccessCustomers && <span className="legend-item customers"><span className="dot"></span> Customers</span>}
                    {canAccessPartners && <span className="legend-item partners"><span className="dot"></span> Partners</span>}
                  </div>
                </div>
                <div className="trend-chart">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="chart-column">
                      <div className="bars-container">
                        {canAccessBookings && (
                          <div 
                            className="bar bookings-bar" 
                            style={{ height: `${(data.bookings / maxMonthlyBookings) * 100}%` }}
                            title={`${data.bookings} Bookings`}
                          >
                            <span className="bar-value">{data.bookings}</span>
                          </div>
                        )}
                        {canAccessCustomers && (
                          <div 
                            className="bar customers-bar" 
                            style={{ height: `${(data.customers / Math.max(...monthlyData.map(m => m.customers), 1)) * 100}%` }}
                            title={`${data.customers} Customers`}
                          >
                            <span className="bar-value">{data.customers}</span>
                          </div>
                        )}
                        {canAccessPartners && (
                          <div 
                            className="bar partners-bar" 
                            style={{ height: `${(data.partners / Math.max(...monthlyData.map(m => m.partners), 1)) * 100}%` }}
                            title={`${data.partners} Partners`}
                          >
                            <span className="bar-value">{data.partners}</span>
                          </div>
                        )}
                      </div>
                      <span className="month-label">{data.month}</span>
                      {canAccessBookings && <span className="revenue-label">₹{(data.revenue / 1000).toFixed(0)}K</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Distribution - For super-admin/delegated-admin/admin only (others see it above) */}
            {(isSuperAdmin || isDelegatedAdmin || isFullAdmin) && (
              <div className="analytics-card distribution-card">
                <div className="card-header">
                  <h3><i className="fas fa-pie-chart"></i> Booking Distribution</h3>
                </div>
                <div className="distribution-grid">
                  <div className="distribution-item vehicle">
                    <div className="dist-icon">
                      <i className="fas fa-car"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{vehicleBookings}</h4>
                      <p>Vehicle Rentals</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((vehicleBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div className="distribution-item holiday">
                    <div className="dist-icon">
                      <i className="fas fa-umbrella-beach"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{holidayBookings}</h4>
                      <p>Holiday Packages</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((holidayBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div className="distribution-item hotel">
                    <div className="dist-icon">
                      <i className="fas fa-hotel"></i>
                    </div>
                    <div className="dist-info">
                      <h4>{hotelBookings}</h4>
                      <p>Hotel Bookings</p>
                    </div>
                    <div className="dist-percentage">
                      {bookings.length > 0 ? ((hotelBookings / bookings.length) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Rearranged based on role */}
          <div className="analytics-column right">
            
            {/* Quick Actions Card - Rearranged based on role */}
            <div className="analytics-card actions-card">
              <div className="card-header">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                {/* Role-specific primary action first */}
                {userRole === 'admin-customers' && (
                  <button 
                    className="action-btn customers primary-action"
                    onClick={() => setActiveSection('customers')}
                  >
                    <div className="action-icon">
                      <i className="fas fa-users-cog"></i>
                    </div>
                    <span>Manage Customers</span>
                  </button>
                )}
                {userRole === 'admin-partners' && pendingPartners > 0 && (
                  <button 
                    className="action-btn urgent primary-action"
                    onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}
                  >
                    <div className="action-icon">
                      <i className="fas fa-user-clock"></i>
                      <span className="badge">{pendingPartners}</span>
                    </div>
                    <span>Review Partners</span>
                  </button>
                )}
                {userRole === 'admin-bookings' && (
                  <button 
                    className="action-btn bookings primary-action"
                    onClick={() => setActiveSection('bookings')}
                  >
                    <div className="action-icon">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <span>View Bookings</span>
                  </button>
                )}
                
                {/* For super-admin/delegated-admin/admin: Show all actions */}
                {(isSuperAdmin || isDelegatedAdmin || isFullAdmin) && (
                  <>
                    {pendingPartners > 0 && (
                      <button 
                        className="action-btn urgent"
                        onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}
                      >
                        <div className="action-icon">
                          <i className="fas fa-user-clock"></i>
                          <span className="badge">{pendingPartners}</span>
                        </div>
                        <span>Review Partners</span>
                      </button>
                    )}
                    <button 
                      className="action-btn customers"
                      onClick={() => setActiveSection('customers')}
                    >
                      <div className="action-icon">
                        <i className="fas fa-users-cog"></i>
                      </div>
                      <span>Manage Customers</span>
                    </button>
                    <button 
                      className="action-btn bookings"
                      onClick={() => setActiveSection('bookings')}
                    >
                      <div className="action-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <span>View Bookings</span>
                    </button>
                    <button 
                      className="action-btn partners"
                      onClick={() => setActiveSection('partners')}
                    >
                      <div className="action-icon">
                        <i className="fas fa-handshake"></i>
                      </div>
                      <span>Partner Management</span>
                    </button>
                    <button 
                      className="action-btn complaints"
                      onClick={() => setActiveSection('complaints')}
                    >
                      <div className="action-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <span>Complaints</span>
                    </button>
                  </>
                )}

                {/* Secondary actions for role-specific admins */}
                {userRole === 'admin-partners' && (
                  <button 
                    className="action-btn partners"
                    onClick={() => setActiveSection('partners')}
                  >
                    <div className="action-icon">
                      <i className="fas fa-handshake"></i>
                    </div>
                    <span>All Partners</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pending Partners - For super-admin/delegated-admin/admin (partners admin sees it in left column) */}
            {(isSuperAdmin || isDelegatedAdmin || isFullAdmin) && pendingPartners > 0 && (
              <div className="analytics-card pending-card">
                <div className="card-header">
                  <h3><i className="fas fa-hourglass-half"></i> Pending Approvals</h3>
                  <span className="pending-count">{pendingPartners}</span>
                </div>
                <div className="pending-list">
                  {partners.filter(p => p.status === 'pending').slice(0, 4).map(partner => (
                    <div key={partner.id} className="pending-item" onClick={() => handleViewPartner(partner)}>
                      <div className="pending-avatar">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="pending-info">
                        <strong>{partner.companyName || partner.businessName}</strong>
                        <small>{partner.email}</small>
                      </div>
                      <button className="review-action-btn">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  ))}
                </div>
                {pendingPartners > 4 && (
                  <button 
                    className="view-all-btn"
                    onClick={() => { setActiveSection('partners'); setPartnerStatusFilter('pending'); }}
                  >
                    View All ({pendingPartners})
                  </button>
                )}
              </div>
            )}

            {/* Top Partners - For super-admin/delegated-admin/admin/bookings */}
            {(isSuperAdmin || isDelegatedAdmin || isFullAdmin || userRole === 'admin-bookings') && topPartners.length > 0 && (
              <div className="analytics-card top-partners-card">
                <div className="card-header">
                  <h3><i className="fas fa-trophy"></i> Top Partners</h3>
                </div>
                <div className="top-partners-list">
                  {topPartners.map((partner, index) => (
                    <div key={partner.id} className={`top-partner-item rank-${index + 1}`}>
                      <div className="rank-badge">{index + 1}</div>
                      <div className="partner-info">
                        <strong>{partner.name}</strong>
                        <small>{partner.count} bookings</small>
                      </div>
                      <div className="partner-revenue">
                        ₹{partner.revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner Stats - For admin-partners */}
            {userRole === 'admin-partners' && (
              <div className="analytics-card partner-stats-overview">
                <div className="card-header">
                  <h3><i className="fas fa-chart-bar"></i> Partner Overview</h3>
                </div>
                <div className="partner-stats-grid">
                  <div className="partner-stat-item approved">
                    <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                    <div className="stat-details">
                      <h4>{approvedPartners}</h4>
                      <p>Approved</p>
                    </div>
                  </div>
                  <div className="partner-stat-item pending">
                    <div className="stat-icon"><i className="fas fa-clock"></i></div>
                    <div className="stat-details">
                      <h4>{pendingPartners}</h4>
                      <p>Pending</p>
                    </div>
                  </div>
                  <div className="partner-stat-item rejected">
                    <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
                    <div className="stat-details">
                      <h4>{rejectedPartners}</h4>
                      <p>Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Insights - All Roles */}
            <div className="analytics-card revenue-insights-card">
              <div className="card-header">
                <h3><i className="fas fa-chart-pie"></i> Revenue Insights</h3>
              </div>
              <div className="revenue-insights-content">
                <div className="revenue-summary">
                  <div className="revenue-total">
                    <span className="label">Total Earnings</span>
                    <h2>₹{totalRevenue.toLocaleString('en-IN')}</h2>
                  </div>
                  <div className="revenue-commission">
                    <span className="label">Commission (10%)</span>
                    <h3>₹{totalCommission.toLocaleString('en-IN')}</h3>
                  </div>
                </div>
                <div className="revenue-breakdown">
                  <div className="breakdown-item">
                    <div className="breakdown-bar vehicle" style={{ width: `${bookings.length > 0 ? (vehicleBookings / bookings.length) * 100 : 0}%` }}></div>
                    <div className="breakdown-info">
                      <span className="type"><i className="fas fa-car"></i> Vehicle</span>
                      <span className="amount">₹{bookings.filter(b => b.bookingType === 'vehicle' || b.bookingType === 'fleet' || b.bookingType === 'car').reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-bar holiday" style={{ width: `${bookings.length > 0 ? (holidayBookings / bookings.length) * 100 : 0}%` }}></div>
                    <div className="breakdown-info">
                      <span className="type"><i className="fas fa-umbrella-beach"></i> Holiday</span>
                      <span className="amount">₹{bookings.filter(b => b.bookingType === 'holiday' || b.bookingType === 'tour' || b.bookingType === 'package').reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-bar hotel" style={{ width: `${bookings.length > 0 ? (hotelBookings / bookings.length) * 100 : 0}%` }}></div>
                    <div className="breakdown-info">
                      <span className="type"><i className="fas fa-hotel"></i> Hotel</span>
                      <span className="amount">₹{bookings.filter(b => b.bookingType === 'hotel' || b.bookingType === 'accommodation').reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="revenue-footer">
                  <div className="stat-mini">
                    <i className="fas fa-receipt"></i>
                    <span>{bookings.length} Total Bookings</span>
                  </div>
                  <div className="stat-mini">
                    <i className="fas fa-calculator"></i>
                    <span>Avg: ₹{bookings.length > 0 ? Math.round(totalRevenue / bookings.length).toLocaleString('en-IN') : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary Cards - Role Based & Rearranged */}
        <div className="overview-status-row">
          {/* For admin-customers: Customer stats first */}
          {userRole === 'admin-customers' && (
            <div className="status-summary-card customer-stats primary-status">
              <h4><i className="fas fa-users"></i> Customer Stats</h4>
              <div className="status-items">
                <div className="status-item active">
                  <span className="status-dot"></span>
                  <span className="status-name">Active</span>
                  <span className="status-count">{activeCustomers}</span>
                </div>
                <div className="status-item new">
                  <span className="status-dot"></span>
                  <span className="status-name">New (30 days)</span>
                  <span className="status-count">{newCustomers30Days}</span>
                </div>
                <div className="status-item weekly">
                  <span className="status-dot"></span>
                  <span className="status-name">This Week</span>
                  <span className="status-count">{newCustomers7Days}</span>
                </div>
              </div>
            </div>
          )}

          {/* For admin-partners: Partner status first */}
          {userRole === 'admin-partners' && (
            <div className="status-summary-card partner-status primary-status">
              <h4><i className="fas fa-building"></i> Partner Status</h4>
              <div className="status-items">
                <div className="status-item approved">
                  <span className="status-dot"></span>
                  <span className="status-name">Approved</span>
                  <span className="status-count">{approvedPartners}</span>
                </div>
                <div className="status-item pending">
                  <span className="status-dot"></span>
                  <span className="status-name">Pending</span>
                  <span className="status-count">{pendingPartners}</span>
                </div>
                <div className="status-item rejected">
                  <span className="status-dot"></span>
                  <span className="status-name">Rejected</span>
                  <span className="status-count">{rejectedPartners}</span>
                </div>
              </div>
            </div>
          )}

          {/* For admin-bookings: Booking status first */}
          {userRole === 'admin-bookings' && (
            <div className="status-summary-card booking-status primary-status">
              <h4><i className="fas fa-clipboard-list"></i> Booking Status</h4>
              <div className="status-items">
                <div className="status-item confirmed">
                  <span className="status-dot"></span>
                  <span className="status-name">Confirmed</span>
                  <span className="status-count">{confirmedBookings}</span>
                </div>
                <div className="status-item completed">
                  <span className="status-dot"></span>
                  <span className="status-name">Completed</span>
                  <span className="status-count">{completedBookings}</span>
                </div>
                <div className="status-item pending">
                  <span className="status-dot"></span>
                  <span className="status-name">Pending</span>
                  <span className="status-count">{pendingBookingsCount}</span>
                </div>
                <div className="status-item cancelled">
                  <span className="status-dot"></span>
                  <span className="status-name">Cancelled</span>
                  <span className="status-count">{cancelledBookings}</span>
                </div>
              </div>
            </div>
          )}

          {/* For super-admin/delegated-admin/admin: Show all in order */}
          {(isSuperAdmin || isDelegatedAdmin || isFullAdmin) && (
            <>
              <div className="status-summary-card booking-status">
                <h4><i className="fas fa-clipboard-list"></i> Booking Status</h4>
                <div className="status-items">
                  <div className="status-item confirmed">
                    <span className="status-dot"></span>
                    <span className="status-name">Confirmed</span>
                    <span className="status-count">{confirmedBookings}</span>
                  </div>
                  <div className="status-item completed">
                    <span className="status-dot"></span>
                    <span className="status-name">Completed</span>
                    <span className="status-count">{completedBookings}</span>
                  </div>
                  <div className="status-item pending">
                    <span className="status-dot"></span>
                    <span className="status-name">Pending</span>
                    <span className="status-count">{pendingBookingsCount}</span>
                  </div>
                  <div className="status-item cancelled">
                    <span className="status-dot"></span>
                    <span className="status-name">Cancelled</span>
                    <span className="status-count">{cancelledBookings}</span>
                  </div>
                </div>
              </div>

              <div className="status-summary-card partner-status">
                <h4><i className="fas fa-building"></i> Partner Status</h4>
                <div className="status-items">
                  <div className="status-item approved">
                    <span className="status-dot"></span>
                    <span className="status-name">Approved</span>
                    <span className="status-count">{approvedPartners}</span>
                  </div>
                  <div className="status-item pending">
                    <span className="status-dot"></span>
                    <span className="status-name">Pending</span>
                    <span className="status-count">{pendingPartners}</span>
                  </div>
                  <div className="status-item rejected">
                    <span className="status-dot"></span>
                    <span className="status-name">Rejected</span>
                    <span className="status-count">{rejectedPartners}</span>
                  </div>
                </div>
              </div>

              <div className="status-summary-card customer-stats">
                <h4><i className="fas fa-users"></i> Customer Stats</h4>
                <div className="status-items">
                  <div className="status-item active">
                    <span className="status-dot"></span>
                    <span className="status-name">Active</span>
                    <span className="status-count">{activeCustomers}</span>
                  </div>
                  <div className="status-item new">
                    <span className="status-dot"></span>
                    <span className="status-name">New (30 days)</span>
                    <span className="status-count">{newCustomers30Days}</span>
                  </div>
                  <div className="status-item weekly">
                    <span className="status-dot"></span>
                    <span className="status-name">This Week</span>
                    <span className="status-count">{newCustomers7Days}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  // Old renderOverview backup - removed


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
      {partnerViewMode === 'dashboard' ? (
        <>
          {/* Partner Dashboard Overview - Similar to Customer Dashboard */}
          <div className="partner-dashboard-overview">
            <div className="overview-header">
              <div className="overview-header-left">
                <h2><i className="fas fa-handshake"></i> Partner Overview</h2>
                <p>Summary of all registered partners and booking analytics</p>
              </div>
              <div className="overview-header-right">
                <div className="view-toggle">
                  <button 
                    className={`toggle-btn ${partnerViewMode === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setPartnerViewMode('dashboard')}
                  >
                    <i className="fas fa-chart-pie"></i> Dashboard
                  </button>
                  <button 
                    className={`toggle-btn ${partnerViewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setPartnerViewMode('list')}
                  >
                    <i className="fas fa-list"></i> Partners
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards - Same as Customer Dashboard */}
            <div className="partner-overview-stats">
              <div className="overview-stat-card primary" onClick={() => { setPartnerViewMode('list'); setPartnerStatusFilter('all'); }}>
                <div className="stat-icon-large">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="stat-content">
                  <h3>{partners.length}</h3>
                  <p>Total Partners</p>
                  <span className="stat-subtitle">All registered partners</span>
                </div>
              </div>

              <div className="overview-stat-card success" onClick={() => { setPartnerViewMode('list'); setPartnerStatusFilter('approved'); }}>
                <div className="stat-icon-large">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{partners.filter(p => p.status === 'approved').length}</h3>
                  <p>Active Partners</p>
                  <span className="stat-subtitle">Approved & operating</span>
                </div>
              </div>

              <div className="overview-stat-card warning" onClick={() => { setPartnerViewMode('list'); setPartnerStatusFilter('pending'); }}>
                <div className="stat-icon-large">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>{partners.filter(p => p.status === 'pending').length}</h3>
                  <p>Pending Approval</p>
                  <span className="stat-subtitle">Awaiting review</span>
                </div>
              </div>

              <div className="overview-stat-card danger" onClick={() => { setPartnerViewMode('list'); setPartnerStatusFilter('suspended'); }}>
                <div className="stat-icon-large">
                  <i className="fas fa-ban"></i>
                </div>
                <div className="stat-content">
                  <h3>{partners.filter(p => p.status === 'suspended').length}</h3>
                  <p>Suspended</p>
                  <span className="stat-subtitle">Inactive partners</span>
                </div>
              </div>
            </div>

            {/* Charts Section - Same Layout as Customer Dashboard */}
            <div className="partner-charts-section">
              {/* Service Type Distribution */}
              <div className="chart-card">
                <div className="chart-header">
                  <h4><i className="fas fa-car"></i> Vehicle Bookings</h4>
                  <span className="chart-subtitle">{partnerAnalytics.vehicleBookings} total</span>
                </div>
                <div className="service-stat-card vehicle">
                  <div className="service-stat-icon">
                    <i className="fas fa-car-side"></i>
                  </div>
                  <div className="service-stat-details">
                    <div className="service-stat-value">{partnerAnalytics.vehicleBookings}</div>
                    <div className="service-stat-bar">
                      <div 
                        className="service-stat-progress" 
                        style={{ width: `${partnerAnalytics.totalBookings ? (partnerAnalytics.vehicleBookings / partnerAnalytics.totalBookings * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="service-stat-percent">
                      {partnerAnalytics.totalBookings ? Math.round(partnerAnalytics.vehicleBookings / partnerAnalytics.totalBookings * 100) : 0}% of total
                    </span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4><i className="fas fa-umbrella-beach"></i> Holiday Packages</h4>
                  <span className="chart-subtitle">{partnerAnalytics.holidayBookings} total</span>
                </div>
                <div className="service-stat-card holiday">
                  <div className="service-stat-icon">
                    <i className="fas fa-suitcase-rolling"></i>
                  </div>
                  <div className="service-stat-details">
                    <div className="service-stat-value">{partnerAnalytics.holidayBookings}</div>
                    <div className="service-stat-bar">
                      <div 
                        className="service-stat-progress" 
                        style={{ width: `${partnerAnalytics.totalBookings ? (partnerAnalytics.holidayBookings / partnerAnalytics.totalBookings * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="service-stat-percent">
                      {partnerAnalytics.totalBookings ? Math.round(partnerAnalytics.holidayBookings / partnerAnalytics.totalBookings * 100) : 0}% of total
                    </span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4><i className="fas fa-hotel"></i> Hotel Bookings</h4>
                  <span className="chart-subtitle">{partnerAnalytics.hotelBookings} total</span>
                </div>
                <div className="service-stat-card hotel">
                  <div className="service-stat-icon">
                    <i className="fas fa-bed"></i>
                  </div>
                  <div className="service-stat-details">
                    <div className="service-stat-value">{partnerAnalytics.hotelBookings}</div>
                    <div className="service-stat-bar">
                      <div 
                        className="service-stat-progress" 
                        style={{ width: `${partnerAnalytics.totalBookings ? (partnerAnalytics.hotelBookings / partnerAnalytics.totalBookings * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="service-stat-percent">
                      {partnerAnalytics.totalBookings ? Math.round(partnerAnalytics.hotelBookings / partnerAnalytics.totalBookings * 100) : 0}% of total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Grid - Revenue & Monthly Trends */}
          <div className="partner-analytics-grid">
            {/* Monthly Booking Trends */}
            <div className="analytics-card monthly-chart">
              <div className="chart-header">
                <h4><i className="fas fa-chart-line"></i> Monthly Booking Trends</h4>
                <span className="chart-subtitle">Last 6 months</span>
              </div>
              <div className="bar-chart">
                {partnerAnalytics.monthlyBookings.map((month, idx) => {
                  const maxCount = Math.max(...partnerAnalytics.monthlyBookings.map(m => m.count), 1);
                  return (
                    <div key={idx} className="bar-column">
                      <div className="bar-value">{month.count}</div>
                      <div 
                        className="bar" 
                        style={{ height: `${Math.max(10, (month.count / maxCount) * 100)}%` }}
                      ></div>
                      <div className="bar-label">{month.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="analytics-card revenue-overview">
              <div className="chart-header">
                <h4><i className="fas fa-rupee-sign"></i> Revenue Overview</h4>
                <span className="chart-subtitle">Total earnings</span>
              </div>
              <div className="revenue-display">
                <div className="revenue-main-value">
                  <span className="currency">₹</span>
                  <span className="amount">{partnerAnalytics.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="revenue-meta">
                  <div className="revenue-meta-item">
                    <i className="fas fa-receipt"></i>
                    <span>{partnerAnalytics.totalBookings} Total Bookings</span>
                  </div>
                  <div className="revenue-meta-item">
                    <i className="fas fa-calculator"></i>
                    <span>₹{partnerAnalytics.totalBookings ? Math.round(partnerAnalytics.totalRevenue / partnerAnalytics.totalBookings).toLocaleString('en-IN') : 0} Avg. Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboards Section */}
          <div className="partner-leaderboards">
            <div className="leaderboard-card">
              <div className="chart-header">
                <h4><i className="fas fa-trophy"></i> Top Partners</h4>
                <span className="chart-subtitle">By revenue generated</span>
              </div>
              <div className="leaderboard-list">
                {partnerAnalytics.topPartners.length > 0 ? (
                  partnerAnalytics.topPartners.map((partner, idx) => (
                    <div key={idx} className={`leaderboard-item rank-${idx + 1}`}>
                      <div className="rank-badge">#{idx + 1}</div>
                      <div className="leader-info">
                        <div className="leader-avatar partner">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="leader-details">
                          <h5>{partner.partnerName}</h5>
                          <span>{partner.bookings.length} bookings</span>
                        </div>
                      </div>
                      <div className="leader-stats">
                        <span className="revenue">₹{partner.totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-leaderboard">
                    <i className="fas fa-chart-bar"></i>
                    <p>No booking data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="leaderboard-card">
              <div className="chart-header">
                <h4><i className="fas fa-star"></i> Top Customers</h4>
                <span className="chart-subtitle">By total bookings</span>
              </div>
              <div className="leaderboard-list">
                {partnerAnalytics.topCustomers.length > 0 ? (
                  partnerAnalytics.topCustomers.map((customer, idx) => (
                    <div key={idx} className={`leaderboard-item rank-${idx + 1}`}>
                      <div className="rank-badge">#{idx + 1}</div>
                      <div className="leader-info">
                        <div className="leader-avatar customer">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="leader-details">
                          <h5>{customer.customerName}</h5>
                          <span>{customer.customerEmail}</span>
                        </div>
                      </div>
                      <div className="leader-stats">
                        <span className="bookings">{customer.bookings.length} bookings</span>
                        <span className="spent">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-leaderboard">
                    <i className="fas fa-users"></i>
                    <p>No customer data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="recent-bookings-card">
            <div className="chart-header">
              <h4><i className="fas fa-clock"></i> Recent Bookings</h4>
              <span className="chart-subtitle">Latest 5 transactions</span>
            </div>
            <div className="recent-bookings-list">
              {partnerAnalytics.recentBookings.length > 0 ? (
                partnerAnalytics.recentBookings.map((booking, idx) => (
                  <div key={idx} className="recent-booking-item">
                    <div className="booking-type-icon">
                      <i className={`fas ${
                        booking.bookingType === 'vehicle' || booking.type === 'vehicle' || booking.type === 'fleet' ? 'fa-car' :
                        booking.bookingType === 'hotel' || booking.type === 'hotel' ? 'fa-hotel' :
                        booking.bookingType === 'flight' || booking.type === 'flight' ? 'fa-plane' :
                        'fa-umbrella-beach'
                      }`}></i>
                    </div>
                    <div className="booking-details">
                      <h5>{booking.customerName || booking.userName || 'Customer'}</h5>
                      <p>{booking.bookingType || booking.type || 'Service'} • {booking.partnerName || booking.partnerCompany || 'Partner'}</p>
                    </div>
                    <div className="booking-amount">
                      <span className="amount">₹{(booking.totalAmount || booking.amount || 0).toLocaleString('en-IN')}</span>
                      <span className={`status ${booking.status}`}>{booking.status || 'pending'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-bookings">
                  <i className="fas fa-calendar-times"></i>
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* List View Header */}
          <div className="section-header partner-header">
            <h2 className="section-title"><i className="fas fa-handshake"></i> Partner Management</h2>
            <div className="section-actions">
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${partnerViewMode === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setPartnerViewMode('dashboard')}
                >
                  <i className="fas fa-chart-pie"></i> Dashboard
                </button>
                <button 
                  className={`toggle-btn ${partnerViewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setPartnerViewMode('list')}
                >
                  <i className="fas fa-list"></i> Partners
                </button>
              </div>
            </div>
          </div>

          {/* List View - Original Table */}
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
                              onClick={(e) => partner.status === 'approved' ? handlePartnerDeactivateClick(e, partner) : handlePartnerActivateClick(e, partner)}
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
        </>
      )}
    </div>
  );

  // Render Bookings Tab
  const renderBookings = () => (
    <div className="admin-bookings">
      {bookingViewMode === 'dashboard' ? (
        <>
          {/* Bookings Dashboard Header */}
          <div className="bookings-dashboard-overview">
            <div className="overview-header">
              <div className="overview-header-left">
                <h2><i className="fas fa-calendar-check"></i> Bookings Dashboard</h2>
                <p>Track all bookings, partner performance, and commission earnings</p>
              </div>
              <div className="overview-header-right">
                <div className="view-toggle">
                  <button 
                    className={`toggle-btn ${bookingViewMode === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setBookingViewMode('dashboard')}
                  >
                    <i className="fas fa-chart-pie"></i> Dashboard
                  </button>
                  <button 
                    className={`toggle-btn ${bookingViewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setBookingViewMode('list')}
                  >
                    <i className="fas fa-list"></i> All Bookings
                  </button>
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="bookings-key-metrics">
              <div className="metric-card primary">
                <div className="metric-icon"><i className="fas fa-calendar-check"></i></div>
                <div className="metric-content">
                  <h3>{bookingsAnalytics.totalBookings}</h3>
                  <p>Total Bookings</p>
                  <span className="metric-detail">{bookingsAnalytics.confirmedBookings} confirmed</span>
                </div>
              </div>
              <div className="metric-card success">
                <div className="metric-icon"><i className="fas fa-rupee-sign"></i></div>
                <div className="metric-content">
                  <h3>₹{bookingsAnalytics.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <span className="metric-detail">From all partners</span>
                </div>
              </div>
              <div className="metric-card warning">
                <div className="metric-icon"><i className="fas fa-coins"></i></div>
                <div className="metric-content">
                  <h3>₹{bookingsAnalytics.totalCommission.toLocaleString()}</h3>
                  <p>Commission Earned</p>
                  <span className="metric-detail">{bookingsAnalytics.commissionRate}% per booking</span>
                </div>
              </div>
              <div className="metric-card info">
                <div className="metric-icon"><i className="fas fa-handshake"></i></div>
                <div className="metric-content">
                  <h3>{bookingsAnalytics.partnerCount}</h3>
                  <p>Active Partners</p>
                  <span className="metric-detail">Contributing bookings</span>
                </div>
              </div>
            </div>

            {/* Service Type Breakdown */}
            <div className="bookings-service-breakdown">
              <div className="service-card vehicle">
                <div className="service-icon"><i className="fas fa-car"></i></div>
                <div className="service-info">
                  <h4>{bookingsAnalytics.vehicleBookings}</h4>
                  <p>Vehicle Bookings</p>
                </div>
                <div className="service-percentage">
                  {bookingsAnalytics.totalBookings ? Math.round(bookingsAnalytics.vehicleBookings / bookingsAnalytics.totalBookings * 100) : 0}%
                </div>
              </div>
              <div className="service-card holiday">
                <div className="service-icon"><i className="fas fa-umbrella-beach"></i></div>
                <div className="service-info">
                  <h4>{bookingsAnalytics.holidayBookings}</h4>
                  <p>Holiday Packages</p>
                </div>
                <div className="service-percentage">
                  {bookingsAnalytics.totalBookings ? Math.round(bookingsAnalytics.holidayBookings / bookingsAnalytics.totalBookings * 100) : 0}%
                </div>
              </div>
              <div className="service-card hotel">
                <div className="service-icon"><i className="fas fa-hotel"></i></div>
                <div className="service-info">
                  <h4>{bookingsAnalytics.hotelBookings}</h4>
                  <p>Hotel Bookings</p>
                </div>
                <div className="service-percentage">
                  {bookingsAnalytics.totalBookings ? Math.round(bookingsAnalytics.hotelBookings / bookingsAnalytics.totalBookings * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Partner Commission Section */}
          <div className="bookings-analytics-grid">
            {/* Top Partners by Commission */}
            <div className="analytics-card partner-commission-card">
              <div className="card-header">
                <h3><i className="fas fa-trophy"></i> Top Partners by Revenue</h3>
                <span className="card-subtitle">Commission earned from each partner</span>
              </div>
              <div className="partner-commission-list">
                {bookingsAnalytics.topPartnersByRevenue.length > 0 ? (
                  bookingsAnalytics.topPartnersByRevenue.map((partner, index) => (
                    <div key={partner.partnerId} className={`commission-item rank-${index + 1}`}>
                      <div className="rank-badge">{index + 1}</div>
                      <div className="partner-info">
                        <h4>{partner.partnerName}</h4>
                        <p>{partner.bookings.length} bookings • {partner.customerCount} customers</p>
                      </div>
                      <div className="commission-details">
                        <div className="revenue">
                          <span className="label">Revenue</span>
                          <span className="value">₹{partner.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="commission">
                          <span className="label">Commission</span>
                          <span className="value highlight">₹{partner.commission.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <i className="fas fa-chart-bar"></i>
                    <p>No partner data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="analytics-card monthly-trend-card">
              <div className="card-header">
                <h3><i className="fas fa-chart-line"></i> Monthly Booking Trend</h3>
                <span className="card-subtitle">Last 6 months performance</span>
              </div>
              <div className="monthly-chart">
                {bookingsAnalytics.monthlyData.map((month, index) => (
                  <div key={month.month} className="month-bar">
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${Math.max(10, (month.bookings / Math.max(...bookingsAnalytics.monthlyData.map(m => m.bookings || 1))) * 100)}%` 
                        }}
                      >
                        <span className="bar-value">{month.bookings}</span>
                      </div>
                    </div>
                    <span className="month-label">{month.month}</span>
                    <span className="month-revenue">₹{(month.revenue / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings with Commission */}
          <div className="recent-bookings-commission">
            <div className="card-header">
              <h3><i className="fas fa-history"></i> Recent Bookings</h3>
              <span className="card-subtitle">Latest transactions with commission details</span>
            </div>
            <div className="bookings-table-wrapper">
              <table className="bookings-commission-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Partner</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Commission (10%)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsAnalytics.recentWithPartner.map((booking, index) => (
                    <tr key={booking.id || index}>
                      <td>
                        <span className="booking-id">{booking.bookingId || booking.id?.slice(0, 8)}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="name">{booking.customerName || 'N/A'}</span>
                          <span className="email">{booking.customerEmail || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="partner-cell">
                          <span className="name">{booking.partnerName || booking.partnerCompany || 'Direct'}</span>
                          <span className="id">{booking.partnerId || ''}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`service-badge ${(booking.bookingType || booking.serviceType || booking.type || '').toLowerCase()}`}>
                          <i className={getBookingTypeIcon(booking.bookingType || booking.serviceType || booking.type)}></i>
                          {booking.bookingType || booking.serviceType || booking.type || 'N/A'}
                        </span>
                      </td>
                      <td><span className="amount">₹{(booking.totalAmount || booking.amount || 0).toLocaleString()}</span></td>
                      <td><span className="commission-amount">₹{booking.commission.toLocaleString()}</span></td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td><span className="date">{formatDate(booking.createdAt || booking.bookingDate)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookingsAnalytics.recentWithPartner.length === 0 && (
                <div className="no-bookings">
                  <i className="fas fa-calendar-times"></i>
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* List View Header */}
          <div className="bookings-list-header">
            <div className="header-left">
              <h2><i className="fas fa-calendar-check"></i> All Bookings</h2>
              <p>{filteredBookings.length} of {bookings.length} bookings</p>
            </div>
            <div className="header-right">
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${bookingViewMode === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setBookingViewMode('dashboard')}
                >
                  <i className="fas fa-chart-pie"></i> Dashboard
                </button>
                <button 
                  className={`toggle-btn ${bookingViewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setBookingViewMode('list')}
                >
                  <i className="fas fa-list"></i> All Bookings
                </button>
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="booking-status-pills">
            <button className={`pill ${bookingStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('all')}>
              All ({bookings.length})
            </button>
            <button className={`pill confirmed ${bookingStatusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('confirmed')}>
              Confirmed ({bookingsAnalytics.confirmedBookings})
            </button>
            <button className={`pill completed ${bookingStatusFilter === 'completed' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('completed')}>
              Completed ({bookingsAnalytics.completedBookings})
            </button>
            <button className={`pill pending ${bookingStatusFilter === 'pending' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('pending')}>
              Pending ({bookingsAnalytics.pendingBookings})
            </button>
            <button className={`pill cancelled ${bookingStatusFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setBookingStatusFilter('cancelled')}>
              Cancelled ({bookingsAnalytics.cancelledBookings})
            </button>
          </div>

          {/* Search and Type Filter */}
          <div className="booking-filters-row">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by booking ID, customer, partner..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <div className="type-filter">
              <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="vehicle">Vehicle</option>
                <option value="holiday">Holiday</option>
                <option value="hotel">Hotel</option>
              </select>
            </div>
          </div>

          {/* Full Bookings Table */}
          <div className="admin-table-container bookings-full-table">
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
              <table className="admin-table enhanced-bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Partner</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Commission</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => {
                    const commission = (booking.totalAmount || booking.amount || 0) * 0.10;
                    return (
                      <tr key={booking.id}>
                        <td><strong className="booking-id-cell">{booking.bookingId || booking.id?.slice(0, 8)}</strong></td>
                        <td>
                          <div className="customer-cell">
                            <strong>{booking.customerName || 'N/A'}</strong>
                            <small>{booking.customerEmail || ''}</small>
                          </div>
                        </td>
                        <td>
                          <div className="partner-cell">
                            <strong>{booking.partnerName || booking.partnerCompany || 'Direct'}</strong>
                            <small>{booking.partnerId || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`booking-type-badge ${(booking.bookingType || booking.serviceType || booking.type || '').toLowerCase()}`}>
                            <i className={getBookingTypeIcon(booking.bookingType || booking.serviceType || booking.type)}></i>
                            {booking.bookingType || booking.serviceType || booking.type || 'N/A'}
                          </span>
                        </td>
                        <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                        <td><strong className="amount-cell">₹{(booking.totalAmount || booking.amount || 0).toLocaleString()}</strong></td>
                        <td><span className="commission-cell">₹{commission.toLocaleString()}</span></td>
                        <td>{getStatusBadge(booking.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Render Complaints Section
  const renderComplaints = () => {
    // Calculate complaint stats
    const openComplaints = complaints.filter(c => c.status === 'open').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const customerComplaints = complaints.filter(c => c.type === 'customer');
    const partnerComplaints = complaints.filter(c => c.type === 'partner');
    
    // Customer complaint categories
    const bookingComplaints = customerComplaints.filter(c => c.category === 'booking').length;
    const refundComplaints = customerComplaints.filter(c => c.category === 'refund').length;
    const vehicleComplaints = customerComplaints.filter(c => c.category === 'vehicle').length;
    const holidayComplaints = customerComplaints.filter(c => c.category === 'holiday').length;
    
    // Partner complaint categories
    const paymentComplaints = partnerComplaints.filter(c => c.category === 'payment').length;
    const technicalComplaints = partnerComplaints.filter(c => c.category === 'technical').length;
    const partnerBookingComplaints = partnerComplaints.filter(c => c.category === 'booking').length;
    
    // High priority complaints
    const highPriorityOpen = complaints.filter(c => c.priority === 'high' && c.status === 'open').length;

    const getComplaintStatusBadge = (status) => {
      const statusConfig = {
        'open': { class: 'status-open', label: 'Open', icon: 'fas fa-exclamation-circle' },
        'in-progress': { class: 'status-in-progress', label: 'In Progress', icon: 'fas fa-clock' },
        'resolved': { class: 'status-resolved', label: 'Resolved', icon: 'fas fa-check-circle' }
      };
      const config = statusConfig[status] || statusConfig['open'];
      return <span className={`complaint-status-badge ${config.class}`}><i className={config.icon}></i> {config.label}</span>;
    };

    const getPriorityBadge = (priority) => {
      const priorityConfig = {
        'high': { class: 'priority-high', label: 'High' },
        'medium': { class: 'priority-medium', label: 'Medium' },
        'low': { class: 'priority-low', label: 'Low' }
      };
      const config = priorityConfig[priority] || priorityConfig['medium'];
      return <span className={`priority-badge ${config.class}`}>{config.label}</span>;
    };

    const getCategoryIcon = (category) => {
      const icons = {
        'booking': 'fas fa-calendar-check',
        'refund': 'fas fa-undo-alt',
        'vehicle': 'fas fa-car',
        'payment': 'fas fa-credit-card',
        'technical': 'fas fa-cog'
      };
      return icons[category] || 'fas fa-exclamation-circle';
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getTimeAgo = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    };

    return (
      <div className="admin-complaints-section">
        {/* View Mode Toggle */}
        <div className="complaints-header">
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${complaintViewMode === 'dashboard' ? 'active' : ''}`}
              onClick={() => setComplaintViewMode('dashboard')}
            >
              <i className="fas fa-th-large"></i> Dashboard
            </button>
            <button 
              className={`view-mode-btn ${complaintViewMode === 'list' ? 'active' : ''}`}
              onClick={() => setComplaintViewMode('list')}
            >
              <i className="fas fa-list"></i> All Complaints
            </button>
          </div>
        </div>

        {complaintViewMode === 'dashboard' ? (
          <>
            {/* Complaints Overview Stats */}
            <div className="complaints-stats-grid">
              <div className="complaint-stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="stat-info">
                  <h3>{complaints.length}</h3>
                  <p>Total Complaints</p>
                </div>
              </div>
              <div className="complaint-stat-card open">
                <div className="stat-icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{openComplaints}</h3>
                  <p>Open</p>
                </div>
                {highPriorityOpen > 0 && (
                  <span className="urgent-badge">{highPriorityOpen} High Priority</span>
                )}
              </div>
              <div className="complaint-stat-card inprogress">
                <div className="stat-icon">
                  <i className="fas fa-spinner"></i>
                </div>
                <div className="stat-info">
                  <h3>{inProgressComplaints}</h3>
                  <p>In Progress</p>
                </div>
              </div>
              <div className="complaint-stat-card resolved">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{resolvedComplaints}</h3>
                  <p>Resolved</p>
                </div>
              </div>
            </div>

            {/* Customer vs Partner Complaints */}
            <div className="complaints-category-section">
              <div className="complaints-category-card customer">
                <div className="category-header">
                  <div className="category-icon customer">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="category-title">
                    <h3>Customer Complaints</h3>
                    <span className="category-count">{customerComplaints.length} Total</span>
                  </div>
                </div>
                <div className="category-breakdown">
                  <div className="breakdown-item">
                    <i className="fas fa-car"></i>
                    <span className="breakdown-label">Vehicle Related</span>
                    <span className="breakdown-count">{vehicleComplaints}</span>
                  </div>
                  <div className="breakdown-item">
                    <i className="fas fa-umbrella-beach"></i>
                    <span className="breakdown-label">Holiday Related</span>
                    <span className="breakdown-count">{holidayComplaints}</span>
                  </div>
                  <div className="breakdown-item">
                    <i className="fas fa-hand-holding-usd"></i>
                    <span className="breakdown-label">Refund Related</span>
                    <span className="breakdown-count">{refundComplaints}</span>
                  </div>
                  <div className="breakdown-item">
                    <i className="fas fa-calendar-check"></i>
                    <span className="breakdown-label">Booking Related</span>
                    <span className="breakdown-count">{bookingComplaints}</span>
                  </div>
                </div>
                <div className="category-status-bar">
                  <div className="status-bar-item open" style={{width: `${(customerComplaints.filter(c => c.status === 'open').length / Math.max(customerComplaints.length, 1)) * 100}%`}}>
                    <span>Open: {customerComplaints.filter(c => c.status === 'open').length}</span>
                  </div>
                  <div className="status-bar-item inprogress" style={{width: `${(customerComplaints.filter(c => c.status === 'in-progress').length / Math.max(customerComplaints.length, 1)) * 100}%`}}>
                    <span>In Progress: {customerComplaints.filter(c => c.status === 'in-progress').length}</span>
                  </div>
                  <div className="status-bar-item resolved" style={{width: `${(customerComplaints.filter(c => c.status === 'resolved').length / Math.max(customerComplaints.length, 1)) * 100}%`}}>
                    <span>Resolved: {customerComplaints.filter(c => c.status === 'resolved').length}</span>
                  </div>
                </div>
              </div>

              <div className="complaints-category-card partner">
                <div className="category-header">
                  <div className="category-icon partner">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <div className="category-title">
                    <h3>Partner Complaints</h3>
                    <span className="category-count">{partnerComplaints.length} Total</span>
                  </div>
                </div>
                <div className="category-breakdown">
                  <div className="breakdown-item">
                    <i className="fas fa-credit-card"></i>
                    <span className="breakdown-label">Payment Issues</span>
                    <span className="breakdown-count">{paymentComplaints}</span>
                  </div>
                  <div className="breakdown-item">
                    <i className="fas fa-cog"></i>
                    <span className="breakdown-label">Technical Issues</span>
                    <span className="breakdown-count">{technicalComplaints}</span>
                  </div>
                  <div className="breakdown-item">
                    <i className="fas fa-calendar-check"></i>
                    <span className="breakdown-label">Booking Issues</span>
                    <span className="breakdown-count">{partnerBookingComplaints}</span>
                  </div>
                </div>
                <div className="category-status-bar">
                  <div className="status-bar-item open" style={{width: `${(partnerComplaints.filter(c => c.status === 'open').length / Math.max(partnerComplaints.length, 1)) * 100}%`}}>
                    <span>Open: {partnerComplaints.filter(c => c.status === 'open').length}</span>
                  </div>
                  <div className="status-bar-item inprogress" style={{width: `${(partnerComplaints.filter(c => c.status === 'in-progress').length / Math.max(partnerComplaints.length, 1)) * 100}%`}}>
                    <span>In Progress: {partnerComplaints.filter(c => c.status === 'in-progress').length}</span>
                  </div>
                  <div className="status-bar-item resolved" style={{width: `${(partnerComplaints.filter(c => c.status === 'resolved').length / Math.max(partnerComplaints.length, 1)) * 100}%`}}>
                    <span>Resolved: {partnerComplaints.filter(c => c.status === 'resolved').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Open Complaints */}
            <div className="recent-complaints-section">
              <div className="section-header">
                <h3><i className="fas fa-exclamation-triangle"></i> Recent Open Complaints</h3>
                <button className="view-all-btn" onClick={() => setComplaintViewMode('list')}>
                  View All <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              <div className="complaints-cards-grid">
                {complaints
                  .filter(c => c.status === 'open')
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 6)
                  .map(complaint => (
                    <div 
                      key={complaint.id} 
                      className={`complaint-card ${complaint.type} ${complaint.priority}`}
                      onClick={() => { setSelectedComplaint(complaint); setShowComplaintModal(true); }}
                    >
                      <div className="complaint-card-header">
                        <span className={`complaint-type-badge ${complaint.type}`}>
                          <i className={complaint.type === 'customer' ? 'fas fa-user' : 'fas fa-handshake'}></i>
                          {complaint.type === 'customer' ? 'Customer' : 'Partner'}
                        </span>
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <h4 className="complaint-subject">{complaint.subject}</h4>
                      <p className="complaint-preview">{complaint.description?.substring(0, 80)}...</p>
                      <div className="complaint-meta">
                        <span className="complaint-from">
                          <i className="fas fa-user-circle"></i>
                          {complaint.type === 'customer' ? complaint.customerName : complaint.partnerName}
                        </span>
                        <span className="complaint-time">
                          <i className="fas fa-clock"></i>
                          {getTimeAgo(complaint.createdAt)}
                        </span>
                      </div>
                      <div className="complaint-category">
                        <i className={getCategoryIcon(complaint.category)}></i>
                        {complaint.category} - {complaint.subCategory}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Filters */}
            <div className="complaints-filters">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select value={complaintSourceFilter} onChange={(e) => setComplaintSourceFilter(e.target.value)}>
                  <option value="all">All Sources</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Partner</option>
                </select>
                <select value={complaintStatusFilter} onChange={(e) => setComplaintStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select value={complaintTypeFilter} onChange={(e) => setComplaintTypeFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="booking">Booking</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="holiday">Holiday</option>
                  <option value="refund">Refund</option>
                  <option value="payment">Payment</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="admin-table-container complaints-table">
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading complaints...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-clipboard-check"></i>
                  <p>No complaints found</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Source</th>
                      <th>From</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map(complaint => (
                      <tr key={complaint.id} onClick={() => { setSelectedComplaint(complaint); setShowComplaintModal(true); }}>
                        <td className="complaint-id" title={complaint.id}>#{complaint.id.substring(0, 8)}...</td>
                        <td>
                          <span className={`source-badge ${complaint.type}`}>
                            <i className={complaint.type === 'customer' ? 'fas fa-user' : 'fas fa-handshake'}></i>
                            {complaint.type === 'customer' ? 'Customer' : 'Partner'}
                          </span>
                        </td>
                        <td className="complaint-from-cell">
                          <div className="from-info">
                            <span className="from-name">{complaint.type === 'customer' ? complaint.customerName : complaint.partnerName}</span>
                            <span className="from-email">{complaint.type === 'customer' ? complaint.customerEmail : complaint.partnerEmail}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag">
                            <i className={getCategoryIcon(complaint.category)}></i>
                            {complaint.category}
                          </span>
                        </td>
                        <td className="complaint-subject-cell">{complaint.subject}</td>
                        <td>{getPriorityBadge(complaint.priority)}</td>
                        <td>{getComplaintStatusBadge(complaint.status)}</td>
                        <td className="complaint-date">{formatDate(complaint.createdAt)}</td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn view"
                            onClick={(e) => { e.stopPropagation(); setSelectedComplaint(complaint); setShowComplaintModal(true); }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {complaint.status !== 'resolved' && (
                            <button 
                              className="action-btn resolve"
                              onClick={(e) => { e.stopPropagation(); handleResolveComplaint(complaint); }}
                              disabled={actionLoading}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Complaint Detail Modal */}
        {showComplaintModal && selectedComplaint && createPortal(
          <div className="admin-modal-overlay" onClick={() => setShowComplaintModal(false)}>
            <div className="admin-modal complaint-detail-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowComplaintModal(false)}>
                <i className="fas fa-times"></i>
              </button>
              
              <div className="complaint-modal-header">
                <div className={`complaint-type-icon ${selectedComplaint.type}`}>
                  <i className={selectedComplaint.type === 'customer' ? 'fas fa-user' : 'fas fa-handshake'}></i>
                </div>
                <div className="complaint-header-info">
                  <h2>{selectedComplaint.subject}</h2>
                  <div className="complaint-header-meta">
                    <span className={`source-badge ${selectedComplaint.type}`}>
                      {selectedComplaint.type === 'customer' ? 'Customer Complaint' : 'Partner Complaint'}
                    </span>
                    {getPriorityBadge(selectedComplaint.priority)}
                    {getComplaintStatusBadge(selectedComplaint.status)}
                  </div>
                </div>
              </div>

              <div className="complaint-modal-body">
                {/* Complaint Info */}
                <div className="complaint-info-section">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Complaint ID</label>
                      <span>{selectedComplaint.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Category</label>
                      <span><i className={getCategoryIcon(selectedComplaint.category)}></i> {selectedComplaint.category} - {selectedComplaint.subCategory}</span>
                    </div>
                    <div className="info-item">
                      <label>Created</label>
                      <span>{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                    {selectedComplaint.resolvedAt && (
                      <div className="info-item">
                        <label>Resolved</label>
                        <span>{formatDate(selectedComplaint.resolvedAt)}</span>
                      </div>
                    )}
                    {selectedComplaint.bookingId && (
                      <div className="info-item">
                        <label>Booking ID</label>
                        <span>{selectedComplaint.bookingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complainant Info */}
                <div className="complainant-info-section">
                  <h3><i className="fas fa-user-circle"></i> {selectedComplaint.type === 'customer' ? 'Customer' : 'Partner'} Details</h3>
                  <div className="complainant-card">
                    <div className="complainant-avatar">
                      <i className={selectedComplaint.type === 'customer' ? 'fas fa-user' : 'fas fa-building'}></i>
                    </div>
                    <div className="complainant-details">
                      <h4>{selectedComplaint.type === 'customer' ? selectedComplaint.customerName : selectedComplaint.partnerName}</h4>
                      <p><i className="fas fa-envelope"></i> {selectedComplaint.type === 'customer' ? selectedComplaint.customerEmail : selectedComplaint.partnerEmail}</p>
                      <p><i className="fas fa-phone"></i> {selectedComplaint.type === 'customer' ? selectedComplaint.customerPhone : selectedComplaint.partnerPhone}</p>
                      <p><i className="fas fa-id-badge"></i> ID: {selectedComplaint.type === 'customer' ? selectedComplaint.customerId : selectedComplaint.partnerId}</p>
                    </div>
                  </div>
                </div>

                {/* Complaint Description */}
                <div className="complaint-description-section">
                  <h3><i className="fas fa-align-left"></i> Complaint Description</h3>
                  <div className="description-box">
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Response History */}
                <div className="response-history-section">
                  <h3><i className="fas fa-comments"></i> Response History ({selectedComplaint.responses?.length || 0})</h3>
                  <div className="responses-timeline">
                    {selectedComplaint.responses?.length > 0 ? (
                      selectedComplaint.responses.map((response, index) => (
                        <div key={index} className="response-item">
                          <div className="response-avatar">
                            <i className="fas fa-user-shield"></i>
                          </div>
                          <div className="response-content">
                            <div className="response-header">
                              <span className="responder-name">{response.respondedBy}</span>
                              <span className="response-time">{formatDate(response.respondedAt)}</span>
                            </div>
                            <p className="response-message">{response.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-responses">
                        <i className="fas fa-inbox"></i>
                        <p>No responses yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Response */}
                {selectedComplaint.status !== 'resolved' && (
                  <div className="add-response-section">
                    <h3><i className="fas fa-reply"></i> Add Response</h3>
                    <div className="response-form">
                      <textarea
                        value={complaintResponse}
                        onChange={(e) => setComplaintResponse(e.target.value)}
                        placeholder="Type your response here..."
                        rows={4}
                      />
                      <div className="response-actions">
                        <button 
                          className="send-response-btn"
                          onClick={handleComplaintResponse}
                          disabled={actionLoading || !complaintResponse.trim()}
                        >
                          {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                          Send Response
                        </button>
                        <button 
                          className="resolve-btn"
                          onClick={() => handleResolveComplaint(selectedComplaint)}
                          disabled={actionLoading}
                        >
                          <i className="fas fa-check-circle"></i>
                          Mark as Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

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
      case 'complaints':
        return canAccessComplaints ? renderComplaints() : renderAccessDenied('Complaints');
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
    return <LoadingSpinner size="fullpage" text="Loading admin portal..." overlay />;
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
          {(isSuperAdmin || isDelegatedAdmin) && (
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
              <button className={`tab-btn ${partnerActiveTab === 'bookings' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('bookings')}>
                <i className="fas fa-calendar-check"></i><span>Bookings</span>
                {selectedPartnerBookings.length > 0 && (
                  <span className="tab-badge">{selectedPartnerBookings.length}</span>
                )}
              </button>
              <button className={`tab-btn ${partnerActiveTab === 'documents' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('documents')}>
                <i className="fas fa-file-alt"></i><span>Documents</span>
              </button>
              <button className={`tab-btn ${partnerActiveTab === 'status' ? 'active' : ''}`} onClick={() => setPartnerActiveTab('status')}>
                <i className={`fas ${selectedPartner.status === 'suspended' ? 'fa-user-slash' : 'fa-user-check'}`}></i><span>Status</span>
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

              {/* Partner Bookings Tab */}
              {partnerActiveTab === 'bookings' && (
                <div className="tab-content partner-bookings-tab">
                  {/* Booking Stats Overview */}
                  <div className="partner-booking-stats">
                    <div className="booking-stat-card total">
                      <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                      <div className="stat-info">
                        <span className="stat-number">{selectedPartnerBookings.length}</span>
                        <span className="stat-label">Total Bookings</span>
                      </div>
                    </div>
                    <div className="booking-stat-card customers">
                      <div className="stat-icon"><i className="fas fa-users"></i></div>
                      <div className="stat-info">
                        <span className="stat-number">{selectedPartnerCustomers.length}</span>
                        <span className="stat-label">Unique Customers</span>
                      </div>
                    </div>
                    <div className="booking-stat-card revenue">
                      <div className="stat-icon"><i className="fas fa-rupee-sign"></i></div>
                      <div className="stat-info">
                        <span className="stat-number">₹{selectedPartnerBookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0).toLocaleString()}</span>
                        <span className="stat-label">Total Revenue</span>
                      </div>
                    </div>
                    <div className="booking-stat-card services">
                      <div className="stat-icon"><i className="fas fa-concierge-bell"></i></div>
                      <div className="stat-info">
                        <span className="stat-number">
                          {[...new Set(selectedPartnerBookings.map(b => b.bookingType || b.serviceType || b.type))].length}
                        </span>
                        <span className="stat-label">Service Types</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer List */}
                  <div className="partner-customers-section">
                    <div className="section-header-small">
                      <h4><i className="fas fa-users"></i> Customers Who Booked Through This Partner</h4>
                      <span className="customer-count">{selectedPartnerCustomers.length} customers</span>
                    </div>
                    
                    {selectedPartnerCustomers.length > 0 ? (
                      <div className="partner-customers-list">
                        {selectedPartnerCustomers.map((customer, index) => (
                          <div key={customer.id} className="partner-customer-card">
                            <div className="customer-rank">#{index + 1}</div>
                            <div className="customer-avatar">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="customer-details">
                              <h5>{customer.name}</h5>
                              <p className="customer-email"><i className="fas fa-envelope"></i> {customer.email || 'N/A'}</p>
                              {customer.phone && <p className="customer-phone"><i className="fas fa-phone"></i> {customer.phone}</p>}
                            </div>
                            <div className="customer-stats">
                              <div className="customer-stat">
                                <span className="stat-value">{customer.bookingsCount}</span>
                                <span className="stat-label">Bookings</span>
                              </div>
                              <div className="customer-stat">
                                <span className="stat-value">₹{customer.totalSpent.toLocaleString()}</span>
                                <span className="stat-label">Spent</span>
                              </div>
                            </div>
                            <div className="customer-last-booking">
                              <span className="label">Last Booking</span>
                              <span className="date">{customer.lastBooking ? formatDateTime(customer.lastBooking) : 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-customers-message">
                        <i className="fas fa-users-slash"></i>
                        <p>No customers have booked through this partner yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Bookings List */}
                  {selectedPartnerBookings.length > 0 && (
                    <div className="partner-bookings-section">
                      <div className="section-header-small">
                        <h4><i className="fas fa-history"></i> Recent Bookings</h4>
                        <span className="booking-count">{selectedPartnerBookings.length} total</span>
                      </div>
                      <div className="partner-bookings-list">
                        {selectedPartnerBookings
                          .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
                          .slice(0, 10)
                          .map((booking, index) => (
                            <div key={booking.id || index} className="partner-booking-item">
                              <div className="booking-type-icon">
                                <i className={getBookingTypeIcon(booking.bookingType || booking.serviceType || booking.type)}></i>
                              </div>
                              <div className="booking-info">
                                <h5>{booking.customerName || booking.userName || booking.guestName || 'Customer'}</h5>
                                <p className="booking-service">{booking.bookingType || booking.serviceType || booking.type || 'Service'}</p>
                                <p className="booking-date">{formatDateTime(booking.createdAt || booking.bookingDate)}</p>
                              </div>
                              <div className="booking-amount">
                                <span className="amount">₹{(booking.totalAmount || booking.amount || 0).toLocaleString()}</span>
                                <span className={`status ${booking.status?.toLowerCase() || 'pending'}`}>
                                  {booking.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                      {selectedPartnerBookings.length > 10 && (
                        <div className="view-more-note">
                          <i className="fas fa-info-circle"></i> Showing 10 of {selectedPartnerBookings.length} bookings
                        </div>
                      )}
                    </div>
                  )}
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

              {/* Account Status Tab */}
              {partnerActiveTab === 'status' && (
                <div className="tab-content">
                  {/* Account Status Section */}
                  <div className={`profile-section account-status-section ${selectedPartner.status === 'suspended' ? 'inactive' : 'active'}`}>
                    <h3>
                      <i className={`fas ${selectedPartner.status === 'suspended' ? 'fa-user-slash' : 'fa-user-check'}`}></i> 
                      Account Status
                    </h3>
                    <div className="account-status-content">
                      <div className="status-badge-large">
                        <span className={`status-indicator ${selectedPartner.status === 'suspended' ? 'inactive' : selectedPartner.status === 'approved' ? 'active' : selectedPartner.status}`}>
                          <i className={`fas ${selectedPartner.status === 'suspended' ? 'fa-ban' : selectedPartner.status === 'approved' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                          {selectedPartner.status === 'suspended' ? 'Deactivated' : selectedPartner.status === 'approved' ? 'Active' : selectedPartner.status?.charAt(0).toUpperCase() + selectedPartner.status?.slice(1)}
                        </span>
                      </div>
                      
                      {selectedPartner.status === 'suspended' && (
                        <div className="deactivation-details">
                          <div className="deactivation-reason-box">
                            <label><i className="fas fa-exclamation-triangle"></i> Reason for Deactivation</label>
                            <p>{selectedPartner.deactivationReason || 'No reason provided'}</p>
                          </div>
                          <div className="deactivation-meta">
                            <span><i className="fas fa-user-tie"></i> Deactivated by: {selectedPartner.deactivatedBy || 'Unknown'}</span>
                            <span><i className="fas fa-clock"></i> On: {formatDateTime(selectedPartner.statusUpdatedAt)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="status-actions">
                        {selectedPartner.status === 'suspended' ? (
                          <button 
                            className="status-action-btn activate"
                            onClick={(e) => handlePartnerActivateClick(e, selectedPartner)}
                          >
                            <i className="fas fa-user-check"></i> Activate Partner
                          </button>
                        ) : selectedPartner.status === 'approved' && (
                          <button 
                            className="status-action-btn deactivate"
                            onClick={(e) => handlePartnerDeactivateClick(e, selectedPartner)}
                          >
                            <i className="fas fa-user-slash"></i> Deactivate Partner
                          </button>
                        )}
                      </div>

                      {/* Status History */}
                      {selectedPartner.statusHistory && selectedPartner.statusHistory.length > 0 && (
                        <div className="status-history-section">
                          <h4><i className="fas fa-history"></i> Account Status History</h4>
                          <div className="status-history-timeline">
                            {selectedPartner.statusHistory
                              .sort((a, b) => new Date(b.actionAt) - new Date(a.actionAt))
                              .map((history, index) => (
                                <div key={index} className={`history-item ${history.action}`}>
                                  <div className="history-icon">
                                    <i className={`fas ${history.action === 'activated' ? 'fa-user-check' : 'fa-user-slash'}`}></i>
                                  </div>
                                  <div className="history-content">
                                    <div className="history-header">
                                      <span className={`history-action ${history.action}`}>
                                        {history.action === 'activated' ? 'Partner Activated' : 'Partner Deactivated'}
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
                  onClick={(e) => selectedPartner.status === 'approved' ? handlePartnerDeactivateClick(e, selectedPartner) : handlePartnerActivateClick(e, selectedPartner)}
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

      {/* Deactivate Partner Modal */}
      {showPartnerDeactivateModal && partnerToDeactivate && createPortal(
        <div className="modal-overlay" onClick={() => setShowPartnerDeactivateModal(false)}>
          <div className="deactivate-modal partner-deactivate-modal" onClick={e => e.stopPropagation()}>
            <div className="deactivate-modal-header">
              <div className="deactivate-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Deactivate Partner</h3>
              <p>You are about to deactivate the following partner:</p>
            </div>
            
            <div className="deactivate-customer-info">
              <div className="deactivate-avatar partner-avatar">
                <i className="fas fa-building"></i>
              </div>
              <div className="deactivate-details">
                <h4>{partnerToDeactivate.companyName || 'Unknown Partner'}</h4>
                <p>{partnerToDeactivate.email}</p>
                <small>{partnerToDeactivate.city}, {partnerToDeactivate.state}</small>
              </div>
            </div>

            <div className="deactivate-reason-input">
              <label><i className="fas fa-comment-alt"></i> Reason for Deactivation <span className="required">*</span></label>
              <textarea
                placeholder="Please provide a reason for deactivating this partner (e.g., Violation of terms, Non-compliance, Partner request, etc.)"
                value={partnerDeactivateReason}
                onChange={(e) => setPartnerDeactivateReason(e.target.value)}
                rows={4}
              ></textarea>
              <span className="char-count">{partnerDeactivateReason.length}/500 characters</span>
            </div>

            <div className="deactivate-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>This action will immediately suspend the partner's account. They will not be able to access partner services. You can reactivate the account later from the admin panel.</p>
            </div>

            <div className="deactivate-modal-actions">
              <button className="btn-cancel" onClick={() => setShowPartnerDeactivateModal(false)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                className="btn-deactivate" 
                onClick={confirmPartnerDeactivation}
                disabled={!partnerDeactivateReason.trim() || actionLoading}
              >
                {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-user-slash"></i>}
                Deactivate Partner
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Activate Partner Modal */}
      {showPartnerActivateModal && partnerToActivate && createPortal(
        <div className="modal-overlay" onClick={() => setShowPartnerActivateModal(false)}>
          <div className="deactivate-modal activate-modal partner-activate-modal" onClick={e => e.stopPropagation()}>
            <div className="deactivate-modal-header activate-header">
              <div className="deactivate-icon activate-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Activate Partner</h3>
              <p>You are about to activate the following partner:</p>
            </div>
            
            <div className="deactivate-customer-info">
              <div className="deactivate-avatar partner-avatar activate-avatar">
                <i className="fas fa-building"></i>
              </div>
              <div className="deactivate-details">
                <h4>{partnerToActivate.companyName || 'Unknown Partner'}</h4>
                <p>{partnerToActivate.email}</p>
                <small>{partnerToActivate.city}, {partnerToActivate.state}</small>
              </div>
            </div>

            {partnerToActivate.deactivationReason && (
              <div className="previous-deactivation-info">
                <label><i className="fas fa-exclamation-circle"></i> Previous Deactivation Reason</label>
                <p>{partnerToActivate.deactivationReason}</p>
              </div>
            )}

            <div className="deactivate-reason-input activate-reason-input">
              <label><i className="fas fa-comment-alt"></i> Reason for Activation <span className="required">*</span></label>
              <textarea
                placeholder="Please provide a reason for activating this partner (e.g., Issue resolved, Verification completed, Appeal approved, etc.)"
                value={partnerActivateReason}
                onChange={(e) => setPartnerActivateReason(e.target.value)}
                rows={4}
              ></textarea>
              <span className="char-count">{partnerActivateReason.length}/500 characters</span>
            </div>

            <div className="activate-info">
              <i className="fas fa-info-circle"></i>
              <p>This action will immediately restore the partner's access. They will be able to log in and use partner services again.</p>
            </div>

            <div className="deactivate-modal-actions">
              <button className="btn-cancel" onClick={() => setShowPartnerActivateModal(false)}>
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                className="btn-activate" 
                onClick={confirmPartnerActivation}
                disabled={!partnerActivateReason.trim() || actionLoading}
              >
                {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-user-check"></i>}
                Activate Partner
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
