import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signOut, getAuth } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db, createSecondaryApp } from '../../firebase/firebase';
import { deleteApp } from 'firebase/app';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/managementPortal.css';

const ManagementPortal = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [noSuperAdmin, setNoSuperAdmin] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [justCreatedSuperAdmin, setJustCreatedSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // Filter tab
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    employeeType: 'regular', // 'regular' or 'portal-admin'
    department: '',
    designation: '',
    role: 'employee', // Default for regular employees
    adminAccess: [],
    joiningDate: '',
    salary: '',
    address: '',
    isDelegatedAdmin: false // For making any employee a delegated admin
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Department options
  const departmentOptions = [
    { value: 'management', label: 'Management', icon: 'fa-building', color: '#1e293b', description: 'Senior management & leadership' },
    { value: 'portal-management', label: 'Portal Management', icon: 'fa-laptop-code', color: '#7c3aed', description: 'Web portal & system management' },
    { value: 'finance', label: 'Finance & Accounts', icon: 'fa-calculator', color: '#059669', description: 'Financial operations & accounting' },
    { value: 'hr', label: 'Human Resources', icon: 'fa-user-tie', color: '#0891b2', description: 'HR & employee management' },
    { value: 'operations', label: 'Operations', icon: 'fa-cogs', color: '#ea580c', description: 'Day-to-day operations' },
    { value: 'sales', label: 'Sales & Marketing', icon: 'fa-chart-line', color: '#dc2626', description: 'Sales & marketing activities' },
    { value: 'customer-support', label: 'Customer Support', icon: 'fa-headset', color: '#2563eb', description: 'Customer service & support' },
    { value: 'travel-desk', label: 'Travel Desk', icon: 'fa-plane', color: '#8b5cf6', description: 'Travel bookings & coordination' },
    { value: 'fleet-management', label: 'Fleet Management', icon: 'fa-car', color: '#475569', description: 'Vehicle & fleet operations' }
  ];

  // Role options (only for Portal Management department)
  // Note: Super Admin is exclusive to Primary Super Admin and cannot be assigned to others
  const roleOptions = [
    { value: 'delegated-super-admin', label: 'Delegated Super Admin', description: 'Manage employees with restrictions', color: '#ea580c' },
    { value: 'admin', label: 'Admin', description: 'Access to all admin features', color: '#7c3aed' },
    { value: 'admin-custom', label: 'Custom Admin', description: 'Select specific access permissions', color: '#0891b2' }
  ];

  // Admin access options (checkboxes for custom admin)
  const adminAccessOptions = [
    { id: 'customers', label: 'Customer Management', icon: 'fa-users', description: 'View & manage customers' },
    { id: 'partners', label: 'Partner Management', icon: 'fa-handshake', description: 'View & manage partners' },
    { id: 'bookings', label: 'Booking Management', icon: 'fa-calendar-check', description: 'View & manage bookings' },
    { id: 'complaints', label: 'Complaints Management', icon: 'fa-headset', description: 'Handle customer complaints' },
    { id: 'holidays', label: 'Holiday Management', icon: 'fa-umbrella-beach', description: 'Manage holiday packages' },
    { id: 'vehicles', label: 'Vehicle Management', icon: 'fa-car', description: 'Manage fleet & vehicles' },
    { id: 'refunds', label: 'Refund Management', icon: 'fa-undo-alt', description: 'Process refund requests' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'fa-chart-bar', description: 'Access reports & analytics' },
    { id: 'payments', label: 'Payment Management', icon: 'fa-credit-card', description: 'View & manage payments' },
    { id: 'content', label: 'Content Management', icon: 'fa-edit', description: 'Manage website content' }
  ];

  // Check if any super admin exists
  const checkSuperAdminExists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      console.log('Total users found:', snapshot.docs.length);
      const superAdmins = snapshot.docs.filter(doc => doc.data().role === 'super-admin');
      console.log('Super admins found:', superAdmins.length);
      return superAdmins.length > 0;
    } catch (error) {
      console.error('Error checking super admin:', error);
      // If permission error, assume super admin might exist (user needs to login)
      if (error.code === 'permission-denied') {
        return true; // Assume exists, redirect to login
      }
      return false;
    }
  };

  // Check if current user is super admin
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    const checkAccess = async () => {
      try {
        const hasSuperAdmin = await checkSuperAdminExists();
        
        if (!hasSuperAdmin) {
          // No super admin exists - allow setup mode
          setNoSuperAdmin(true);
          setSetupMode(true);
          setLoading(false);
          setAccessChecked(true);
          return;
        }

        if (!user) {
          navigate('/management-login');
          return;
        }
        
        // Clear the justCreatedSuperAdmin flag once profile is properly loaded
        if (profile?.role === 'super-admin' || profile?.role === 'delegated-super-admin') {
          setJustCreatedSuperAdmin(false);
        }
        
        setAccessChecked(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setLoading(false);
        setAccessChecked(true);
      }
    };
    
    checkAccess();
  }, [user, profile, navigate, authLoading]);

  // Fetch all employees (both portal admins and regular employees)
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const employeesList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => {
          // Include users with isEmployee flag OR users with admin roles (for backward compatibility)
          const isAdminRole = ['super-admin', 'delegated-super-admin', 'admin', 'admin-custom'].includes(user.role);
          return user.isEmployee === true || isAdminRole;
        });
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showNotification('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleAccessChange = (accessId) => {
    setFormData(prev => {
      const currentAccess = prev.adminAccess || [];
      if (currentAccess.includes(accessId)) {
        return { ...prev, adminAccess: currentAccess.filter(id => id !== accessId) };
      } else {
        return { ...prev, adminAccess: [...currentAccess, accessId] };
      }
    });
  };

  const handleSelectAllAccess = () => {
    const allAccessIds = adminAccessOptions.map(opt => opt.id);
    setFormData(prev => ({ ...prev, adminAccess: allAccessIds }));
  };

  const handleClearAllAccess = () => {
    setFormData(prev => ({ ...prev, adminAccess: [] }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    // For Portal Management, validate role selection
    if (formData.department === 'portal-management' && !formData.role) {
      setFormError('Please select a portal access role');
      return;
    }
    
    // Validate custom admin has at least one access permission
    if (formData.role === 'admin-custom' && (!formData.adminAccess || formData.adminAccess.length === 0)) {
      setFormError('Please select at least one access permission for Custom Admin');
      return;
    }

    setSubmitting(true);
    let secondaryApp = null;
    let newUserUid = null;
    
    try {
      // Create a secondary Firebase app to create user without affecting current session
      secondaryApp = createSecondaryApp();
      const secondaryAuth = getAuth(secondaryApp);
      
      // Create user in Firebase Auth using secondary app
      const cred = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      newUserUid = cred.user.uid;
      await updateProfile(cred.user, { displayName: formData.name });
      
      // Sign out from secondary app (doesn't affect main session)
      await signOut(secondaryAuth);
      
      // Delete the secondary app
      await deleteApp(secondaryApp);
      secondaryApp = null;
      
      // Small delay to ensure auth state is settled
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate employee ID based on department
      const deptCode = formData.department.substring(0, 3).toUpperCase();
      const employeeId = `${deptCode}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Determine role based on department and delegated admin flag
      const isPortalAdmin = formData.department === 'portal-management';
      let finalRole;
      
      if (isPortalAdmin) {
        finalRole = formData.role;
      } else if (formData.isDelegatedAdmin && (profile?.role === 'super-admin' || profile?.isPrimarySuperAdmin)) {
        // Super admin can make anyone a delegated admin
        finalRole = 'delegated-super-admin';
      } else {
        finalRole = 'employee';
      }

      // Create user document in Firestore using the new user's UID
      console.log('Creating Firestore document for user:', newUserUid);
      console.log('Current user (Super Admin):', user.uid);
      console.log('Current user role:', profile?.role);
      
      await setDoc(doc(db, 'users', newUserUid), {
        employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        role: finalRole,
        department: formData.department,
        designation: formData.designation || '',
        adminAccess: (isPortalAdmin && formData.role === 'admin-custom') ? formData.adminAccess : [],
        isEmployee: true,
        isPortalAdmin: isPortalAdmin || finalRole === 'delegated-super-admin',
        joiningDate: formData.joiningDate || null,
        salary: formData.salary || '',
        address: formData.address || '',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'active'
      });

      showNotification(`Employee ${formData.name} created successfully!`, 'success');
      setShowCreateModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
      console.error('Error code:', error.code);
      console.error('New user UID was:', newUserUid);
      
      // Clean up secondary app if it wasn't deleted
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (e) {
          console.error('Error cleaning up secondary app:', e);
        }
      }
      
      // Provide helpful error messages
      if (error.code === 'auth/email-already-in-use') {
        setFormError('This email is already registered in Firebase Authentication. Please delete it from Firebase Console → Authentication → Users, or use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        setFormError('Invalid email address format.');
      } else if (error.code === 'auth/weak-password') {
        setFormError('Password is too weak. Please use at least 6 characters.');
      } else if (error.message?.includes('permission')) {
        setFormError(`Permission denied. Please check Firestore rules. The user was created in Auth but the profile could not be saved. User UID: ${newUserUid}`);
      } else {
        setFormError(error.message || 'Failed to create employee');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    // Users can always edit their own record
    const isOwnRecord = selectedEmployee.id === user?.uid;

    // Check if current user has permission to manage this employee
    if (!isOwnRecord && !canManageEmployee(selectedEmployee)) {
      setFormError('You do not have permission to edit this employee');
      return;
    }

    // Prevent modifying primary super admin by non-primary super admins (unless editing self)
    if (!isOwnRecord && selectedEmployee.isPrimarySuperAdmin && !profile?.isPrimarySuperAdmin) {
      setFormError('You cannot modify the Primary Super Admin');
      return;
    }

    // Prevent changing primary super admin's role
    if (selectedEmployee.isPrimarySuperAdmin && formData.role !== 'super-admin') {
      setFormError('Primary Super Admin role cannot be changed');
      return;
    }

    // For Portal Management, validate role selection
    const isPortalAdmin = formData.department === 'portal-management';
    
    // Validate custom admin has at least one access permission
    if (isPortalAdmin && formData.role === 'admin-custom' && (!formData.adminAccess || formData.adminAccess.length === 0)) {
      setFormError('Please select at least one access permission for Custom Admin');
      return;
    }

    setSubmitting(true);
    try {
      // IMPORTANT: Always preserve super-admin role for primary super admin
      // This should NEVER be changed
      let finalRole;
      
      if (selectedEmployee.isPrimarySuperAdmin) {
        // Primary Super Admin - role is ALWAYS super-admin, no exceptions
        finalRole = 'super-admin';
        console.log('Primary Super Admin detected - preserving super-admin role');
      } else if (selectedEmployee.role === 'super-admin') {
        // Any super-admin should stay super-admin
        finalRole = 'super-admin';
        console.log('Super Admin detected - preserving super-admin role');
      } else if (isPortalAdmin) {
        finalRole = formData.role;
      } else if (formData.isDelegatedAdmin && (profile?.role === 'super-admin' || profile?.isPrimarySuperAdmin)) {
        // Super admin can make anyone a delegated admin
        finalRole = 'delegated-super-admin';
      } else if (selectedEmployee.role === 'delegated-super-admin' && !formData.isDelegatedAdmin) {
        // Removing delegated admin status
        finalRole = 'employee';
      } else if (selectedEmployee.role === 'delegated-super-admin') {
        // Keep delegated admin role if already set
        finalRole = 'delegated-super-admin';
      } else {
        // Keep existing role or default to employee
        finalRole = selectedEmployee.role || 'employee';
      }
      
      console.log('Selected employee role:', selectedEmployee.role);
      console.log('Is Primary Super Admin:', selectedEmployee.isPrimarySuperAdmin);
      console.log('Final role to be saved:', finalRole);
      
      // Build update data - only include fields that exist
      const updateData = {
        name: formData.name || selectedEmployee.name,
        phone: formData.phone || '',
        role: finalRole,
        department: formData.department || '',
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      // Add optional fields if they have values
      if (formData.designation !== undefined) {
        updateData.designation = formData.designation || '';
      }
      
      if (formData.joiningDate !== undefined) {
        updateData.joiningDate = formData.joiningDate || null;
      }
      
      if (formData.salary !== undefined) {
        updateData.salary = formData.salary || '';
      }
      
      if (formData.address !== undefined) {
        updateData.address = formData.address || '';
      }

      // Only set admin access for portal management custom admins
      if (isPortalAdmin && formData.role === 'admin-custom') {
        updateData.adminAccess = formData.adminAccess || [];
      } else if (isPortalAdmin) {
        updateData.adminAccess = [];
      }
      
      // Set portal admin flag
      updateData.isPortalAdmin = isPortalAdmin || finalRole === 'delegated-super-admin';

      // Preserve isPrimarySuperAdmin flag if it exists
      if (selectedEmployee.isPrimarySuperAdmin) {
        updateData.isPrimarySuperAdmin = true;
        updateData.role = 'super-admin'; // Force super-admin role for primary
      }

      console.log('Updating employee with data:', updateData);
      console.log('Employee ID:', selectedEmployee.id);
      console.log('Final role being saved:', updateData.role);

      await updateDoc(doc(db, 'users', selectedEmployee.id), updateData);

      showNotification(`Employee ${formData.name} updated successfully!`, 'success');
      setShowEditModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      // Provide more helpful error message
      if (error.code === 'permission-denied') {
        setFormError('Permission denied. You may not have access to update this employee. Please contact the Super Admin.');
      } else {
        setFormError(error.message || 'Failed to update employee. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    // Prevent deletion of any super admin
    if (employee.role === 'super-admin') {
      showNotification('Super Admins cannot be removed from the system', 'error');
      return;
    }

    // Prevent deletion of primary super admin (extra safety)
    if (employee.isPrimarySuperAdmin) {
      showNotification('Primary Super Admin cannot be removed', 'error');
      return;
    }

    // Check if current user is trying to delete themselves
    if (employee.id === user.uid) {
      showNotification('You cannot remove yourself from the system', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${employee.name} from the system?`)) {
      return;
    }

    try {
      // Update role to 'customer' instead of deleting
      await updateDoc(doc(db, 'users', employee.id), {
        role: 'customer',
        isEmployee: false,
        adminAccess: [],
        removedAt: serverTimestamp(),
        removedBy: user.uid
      });

      showNotification(`${employee.name} removed from employees`, 'success');
      fetchEmployees();
    } catch (error) {
      console.error('Error removing employee:', error);
      showNotification('Failed to remove employee', 'error');
    }
  };

  const handleToggleStatus = async (employee) => {
    // Prevent self-deactivation
    if (employee.id === user?.uid) {
      showNotification('You cannot deactivate your own account', 'error');
      return;
    }

    // Prevent deactivating primary super admin
    if (employee.isPrimarySuperAdmin) {
      showNotification('Primary Super Admin account cannot be deactivated', 'error');
      return;
    }

    // Prevent non-primary from changing super admin status
    if (employee.role === 'super-admin' && !profile?.isPrimarySuperAdmin) {
      showNotification('Only Primary Super Admin can deactivate Super Admin accounts', 'error');
      return;
    }

    // Delegated admin cannot deactivate super admin
    if (employee.role === 'super-admin' && profile?.role === 'delegated-super-admin') {
      showNotification('Delegated Admin cannot deactivate Super Admin accounts', 'error');
      return;
    }

    const isActivating = employee.status !== 'active';
    const newStatus = isActivating ? 'active' : 'inactive';
    const actionText = isActivating ? 'activated' : 'deactivated';

    try {
      await updateDoc(doc(db, 'users', employee.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showNotification(`${employee.name} has been ${actionText} successfully`, 'success');
      fetchEmployees();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(`Failed to ${isActivating ? 'activate' : 'deactivate'} ${employee.name}. Please try again.`, 'error');
    }
  };

  const openEditModal = (employee) => {
    // Prevent editing primary super admin by non-primary super admins
    if (employee.isPrimarySuperAdmin && !profile?.isPrimarySuperAdmin) {
      showNotification('You cannot edit the Primary Super Admin', 'error');
      return;
    }

    // For Super Admin, get created date as joining date
    let joiningDate = employee.joiningDate || '';
    if ((employee.isPrimarySuperAdmin || employee.role === 'super-admin') && !joiningDate && employee.createdAt) {
      // Convert Firestore timestamp to date string
      const createdDate = employee.createdAt.toDate ? employee.createdAt.toDate() : new Date(employee.createdAt);
      joiningDate = createdDate.toISOString().split('T')[0];
    }

    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      confirmPassword: '',
      phone: employee.phone || '',
      employeeType: employee.department === 'portal-management' ? 'portal-admin' : 'regular',
      department: employee.department || '',
      designation: (employee.isPrimarySuperAdmin || employee.role === 'super-admin') ? (employee.designation || 'Founder') : (employee.designation || ''),
      role: employee.role || 'employee',
      adminAccess: employee.adminAccess || [],
      joiningDate: joiningDate,
      salary: employee.salary || '',
      address: employee.address || '',
      isDelegatedAdmin: employee.role === 'delegated-super-admin'
    });
    setShowEditModal(true);
  };

  // Helper function to check if current user can manage an employee
  const canManageEmployee = (employee) => {
    // Users can always edit their own record
    if (employee.id === user?.uid) return true;
    
    // Primary super admin can manage everyone
    if (profile?.isPrimarySuperAdmin) return true;
    
    // Non-primary cannot manage primary super admin
    if (employee.isPrimarySuperAdmin) return false;
    
    // Cannot manage real super admins (only primary can)
    if (employee.role === 'super-admin' && !profile?.isPrimarySuperAdmin) return false;
    
    // Super admins and delegated super admins can manage others (except primary and other super admins)
    if (profile?.role === 'super-admin' || profile?.role === 'delegated-super-admin') return true;
    
    return false;
  };

  // Helper function to check if employee can be deleted
  const canDeleteEmployee = (employee) => {
    // Cannot delete primary super admin ever
    if (employee.isPrimarySuperAdmin) return false;
    
    // Cannot delete yourself
    if (employee.id === user?.uid) return false;
    
    // Super admin (Primary) cannot be deleted
    if (employee.role === 'super-admin') return false;
    
    // Delegated super admins can only be deleted by the Primary Super Admin
    if (employee.role === 'delegated-super-admin') {
      return profile?.isPrimarySuperAdmin;
    }
    
    // Only super admin and delegated super admins can delete regular admins/employees
    if (profile?.role !== 'super-admin' && profile?.role !== 'delegated-super-admin') return false;
    
    return true;
  };

  // Helper function to check if current user can assign a specific role
  const canAssignRole = (roleValue) => {
    // Super Admin role is exclusive - cannot be assigned to anyone
    // Only the Primary Super Admin has this role
    if (roleValue === 'super-admin') return false;
    
    // Primary super admin can assign delegated-super-admin, admin, admin-custom
    if (profile?.isPrimarySuperAdmin) return true;
    
    // Super admins can assign delegated-super-admin, admin, admin-custom
    if (profile?.role === 'super-admin') return true;
    
    // Delegated super admins can only assign admin and admin-custom
    if (profile?.role === 'delegated-super-admin') {
      return roleValue === 'admin' || roleValue === 'admin-custom';
    }
    
    return false;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      employeeType: 'regular',
      department: '',
      designation: '',
      role: 'employee',
      adminAccess: [],
      joiningDate: '',
      salary: '',
      address: '',
      isDelegatedAdmin: false
    });
    setFormError('');
    setSelectedEmployee(null);
  };

  const getRoleInfo = (role) => {
    if (role === 'employee') return { label: 'Employee', color: '#64748b' };
    // Super Admin is exclusive to Primary Super Admin
    if (role === 'super-admin') return { label: 'Super Admin', color: '#dc2626', description: 'Full access to all features' };
    return roleOptions.find(r => r.value === role) || { label: role, color: '#64748b' };
  };

  const getDepartmentInfo = (dept) => {
    return departmentOptions.find(d => d.value === dept) || { label: dept || 'Not Assigned', color: '#64748b', icon: 'fa-building' };
  };

  // Filter employees based on active tab and search
  const getFilteredEmployees = () => {
    let filtered = employees;
    
    // Filter by tab
    if (activeTab === 'portal-admins') {
      filtered = filtered.filter(e => e.department === 'portal-management');
    } else if (activeTab !== 'all') {
      filtered = filtered.filter(e => e.department === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.name?.toLowerCase().includes(search) ||
        e.email?.toLowerCase().includes(search) ||
        e.employeeId?.toLowerCase().includes(search) ||
        e.designation?.toLowerCase().includes(search)
      );
    }
    
    // Sort: Super Admin first, then Delegated Super Admin, then others
    filtered.sort((a, b) => {
      // Primary Super Admin always first
      if (a.isPrimarySuperAdmin) return -1;
      if (b.isPrimarySuperAdmin) return 1;
      
      // Super Admin role second
      if (a.role === 'super-admin' && b.role !== 'super-admin') return -1;
      if (b.role === 'super-admin' && a.role !== 'super-admin') return 1;
      
      // Delegated Super Admin third
      if (a.role === 'delegated-super-admin' && b.role !== 'delegated-super-admin') return -1;
      if (b.role === 'delegated-super-admin' && a.role !== 'delegated-super-admin') return 1;
      
      // Then by name alphabetically
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return filtered;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle first super-admin creation
  const handleCreateFirstSuperAdmin = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(cred.user, { displayName: formData.name });

      // Generate employee ID
      const employeeId = `EMP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Create user document in Firestore as super-admin (Primary - cannot be deleted or modified by others)
      await setDoc(doc(db, 'users', cred.user.uid), {
        employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        role: 'super-admin',
        isPrimarySuperAdmin: true, // Mark as the original/primary super admin
        department: 'Management',
        designation: formData.designation || 'Founder',
        joiningDate: new Date().toISOString().split('T')[0], // Today's date as joining date
        isEmployee: true,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      showNotification('Super Admin account created! Refreshing...', 'success');
      
      // Small delay to show success message, then reload to let auth listener pick up the new user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the page to properly initialize the auth state
      window.location.reload();
    } catch (error) {
      console.error('Error creating super admin:', error);
      setFormError(error.message || 'Failed to create super admin');
    } finally {
      setSubmitting(false);
    }
  };

  // Show setup mode for first super admin
  if (setupMode && noSuperAdmin) {
    return (
      <div className="management-portal">
        <header className="mp-header">
          <div className="mp-header-left">
            <div className="mp-logo">
              <i className="fas fa-users-cog"></i>
              <div>
                <h1>Travel Axis</h1>
                <span>Initial Setup</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="mp-main">
          <div className="mp-section" style={{ maxWidth: '500px', margin: '40px auto' }}>
            <div className="mp-section-header">
              <h2><i className="fas fa-user-shield"></i> Create Super Admin</h2>
            </div>
            
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              No super admin exists in the system. Create the first super admin account to get started.
            </p>
            
            {formError && (
              <div className="mp-form-error">
                <i className="fas fa-exclamation-circle"></i>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleCreateFirstSuperAdmin}>
              <div className="mp-form-group" style={{ marginBottom: '16px' }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: '16px' }}>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: '16px' }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: '16px' }}>
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation || 'Founder'}
                  onChange={handleInputChange}
                  placeholder="e.g., Founder, CEO, Director"
                />
                <small style={{ color: '#64748b', fontSize: '0.8rem' }}>Default: Founder</small>
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: '16px' }}>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: '24px' }}>
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-submit" 
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                ) : (
                  <><i className="fas fa-user-shield"></i> Create Super Admin</>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (loading || authLoading || !accessChecked) {
    return <LoadingSpinner size="fullpage" text="Loading management portal..." overlay />;
  }

  // If we just created super admin, show loading while profile refreshes
  if (justCreatedSuperAdmin && profile?.role !== 'super-admin') {
    return <LoadingSpinner size="fullpage" text="Setting up your admin account..." overlay />;
  }

  // Only super-admin and delegated-super-admin can access this page
  if (profile?.role !== 'super-admin' && profile?.role !== 'delegated-super-admin') {
    return (
      <div className="management-portal">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Access Denied</h2>
          <p>Only Super Admins and Delegated Super Admins can access the Management Portal.</p>
          <button onClick={() => navigate('/admin-portal')}>Go to Admin Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="management-portal">
      {/* Header */}
      <header className="mp-header">
        <div className="mp-header-left">
          <button className="mp-back-btn" onClick={() => navigate('/admin-portal')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="mp-logo">
            <i className="fas fa-users-cog"></i>
            <div>
              <h1>Management Portal</h1>
              <span>Travel Axis Employee Management</span>
            </div>
          </div>
        </div>
        <div className="mp-header-right">
          <div className="mp-user-info">
            <span className="mp-user-name">{user?.displayName || 'Admin'}</span>
            <span className="mp-user-role">{getRoleInfo(profile?.role).label}</span>
          </div>
          <button 
            className="mp-back-btn" 
            onClick={async () => {
              await signOut(auth);
              navigate('/management-login');
            }}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification.show && (
        <div className={`mp-notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="mp-main">
        {/* Department Stats Cards */}
        <div className="mp-stats-grid">
          <div className="mp-stat-card total" onClick={() => setActiveTab('all')}>
            <div className="stat-icon"><i className="fas fa-users"></i></div>
            <div className="stat-info">
              <h3>{employees.length}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="mp-stat-card portal" onClick={() => setActiveTab('portal-admins')}>
            <div className="stat-icon"><i className="fas fa-laptop-code"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.department === 'portal-management').length}</h3>
              <p>Portal Admins</p>
            </div>
          </div>
          <div className="mp-stat-card finance" onClick={() => setActiveTab('finance')}>
            <div className="stat-icon"><i className="fas fa-calculator"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.department === 'finance').length}</h3>
              <p>Finance</p>
            </div>
          </div>
          <div className="mp-stat-card hr" onClick={() => setActiveTab('hr')}>
            <div className="stat-icon"><i className="fas fa-users"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.department === 'hr').length}</h3>
              <p>HR</p>
            </div>
          </div>
          <div className="mp-stat-card operations" onClick={() => setActiveTab('operations')}>
            <div className="stat-icon"><i className="fas fa-cogs"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.department === 'operations').length}</h3>
              <p>Operations</p>
            </div>
          </div>
          <div className="mp-stat-card active" onClick={() => setActiveTab('all')}>
            <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.status === 'active').length}</h3>
              <p>Active</p>
            </div>
          </div>
        </div>

        {/* Employees Section */}
        <div className="mp-section">
          <div className="mp-section-header">
            <div className="mp-section-title">
              <h2><i className="fas fa-id-badge"></i> Employee Directory</h2>
              <span className="employee-count">{getFilteredEmployees().length} employees</span>
            </div>
            <div className="mp-section-actions">
              <div className="mp-search-box">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button className="mp-add-btn" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                <i className="fas fa-plus"></i>
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="mp-filter-tabs">
            <button 
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-users"></i> All
            </button>
            <button 
              className={`filter-tab portal ${activeTab === 'portal-admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('portal-admins')}
            >
              <i className="fas fa-laptop-code"></i> Portal Admins
            </button>
            {departmentOptions.filter(d => d.value !== 'portal-management').map(dept => (
              <button 
                key={dept.value}
                className={`filter-tab ${activeTab === dept.value ? 'active' : ''}`}
                onClick={() => setActiveTab(dept.value)}
              >
                <i className={`fas ${dept.icon}`}></i> {dept.label}
              </button>
            ))}
          </div>

          {/* Employees List */}
          <div className="mp-employees-grid">
            {loading ? (
              <div className="mp-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading employees...</p>
              </div>
            ) : getFilteredEmployees().length === 0 ? (
              <div className="mp-empty">
                <i className="fas fa-user-plus"></i>
                <p>{searchTerm ? 'No employees match your search' : 'No employees found. Add your first employee!'}</p>
              </div>
            ) : (
              getFilteredEmployees().map(employee => {
                const roleInfo = getRoleInfo(employee.role);
                const deptInfo = getDepartmentInfo(employee.department);
                const isPrimary = employee.isPrimarySuperAdmin;
                const isDelegatedAdmin = employee.role === 'delegated-super-admin';
                const canEdit = canManageEmployee(employee);
                const canDelete = canDeleteEmployee(employee);
                const isCurrentUser = employee.id === user?.uid;
                const isPortalAdmin = employee.department === 'portal-management' || isDelegatedAdmin;
                
                return (
                  <div key={employee.id} className={`mp-employee-card ${employee.status === 'inactive' ? 'inactive' : ''} ${isPrimary ? 'primary-admin' : ''} ${isDelegatedAdmin ? 'delegated-admin' : ''}`}>
                    {/* Department Badge */}
                    <div className="employee-dept-badge" style={{ background: deptInfo.color }}>
                      <i className={`fas ${deptInfo.icon}`}></i>
                      {deptInfo.label}
                    </div>
                    
                    <div className="employee-header">
                      <div className="employee-avatar" style={{ background: isPortalAdmin ? roleInfo.color : deptInfo.color }}>
                        {employee.name?.charAt(0) || '?'}
                        {isPrimary && <span className="primary-crown"><i className="fas fa-crown"></i></span>}
                        {isDelegatedAdmin && !isPrimary && <span className="delegated-crown"><i className="fas fa-user-shield"></i></span>}
                      </div>
                      <div className="employee-basic">
                        <h3>
                          {employee.name}
                          {isPrimary && <span className="primary-badge">Primary</span>}
                          {isDelegatedAdmin && !isPrimary && <span className="delegated-badge">Delegated</span>}
                          {isCurrentUser && <span className="you-badge">You</span>}
                        </h3>
                        <span className="employee-designation">{employee.designation || 'Not specified'}</span>
                        <span className="employee-id">{employee.employeeId || 'N/A'}</span>
                      </div>
                      <span className="status-badge" data-status={employee.status || 'active'}>
                        {employee.status || 'active'}
                      </span>
                    </div>
                    
                    <div className="employee-details">
                      <div className="detail-item">
                        <i className="fas fa-envelope"></i>
                        <span>{employee.email}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-phone"></i>
                        <span>{employee.phone || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Joined {formatDate(employee.createdAt)}</span>
                      </div>
                    </div>

                    {/* Portal Role Badge - Only for Portal Management */}
                    {isPortalAdmin && (
                      <div className="employee-role">
                        <span className="role-badge" style={{ background: roleInfo.color }}>
                          <i className={`fas ${employee.role === 'super-admin' ? 'fa-crown' : 'fa-user-shield'}`}></i>
                          {roleInfo.label}
                        </span>
                      </div>
                    )}

                    {/* Show access permissions for custom admin */}
                    {employee.role === 'admin-custom' && employee.adminAccess?.length > 0 && (
                      <div className="employee-access-tags">
                        {employee.adminAccess.slice(0, 4).map(accessId => {
                          const accessOption = adminAccessOptions.find(opt => opt.id === accessId);
                          return accessOption ? (
                            <span key={accessId} className="access-tag" title={accessOption.description}>
                              <i className={`fas ${accessOption.icon}`}></i>
                              {accessOption.label}
                            </span>
                          ) : null;
                        })}
                        {employee.adminAccess.length > 4 && (
                          <span className="access-tag more">+{employee.adminAccess.length - 4} more</span>
                        )}
                      </div>
                    )}

                    <div className="employee-actions">
                      {canEdit ? (
                        <button className="action-btn edit" onClick={() => openEditModal(employee)} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                      ) : (
                        <button className="action-btn edit disabled" title="Cannot edit" disabled>
                          <i className="fas fa-lock"></i>
                        </button>
                      )}
                      {/* Deactivate/Activate Button - Hide for: own profile, primary super admin, super admin (if current user is delegated admin) */}
                      {!isPrimary && 
                       !isCurrentUser && 
                       canEdit && 
                       !(employee.role === 'super-admin' && profile?.role === 'delegated-super-admin') && (
                        <button 
                          className={`action-btn ${employee.status === 'active' ? 'deactivate' : 'activate'}`} 
                          onClick={() => handleToggleStatus(employee)}
                          title={employee.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <i className={`fas ${employee.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                      )}
                      {canDelete && (
                        <button className="action-btn delete" onClick={() => handleDeleteEmployee(employee)} title="Remove">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                      {isPrimary && !profile?.isPrimarySuperAdmin && (
                        <span className="protected-badge" title="Protected Account">
                          <i className="fas fa-shield-alt"></i> Protected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Role Permissions Info */}
        <div className="mp-section permissions-section">
          <div className="mp-section-header">
            <h2><i className="fas fa-key"></i> Role Permissions</h2>
          </div>
          <div className="permissions-grid">
            {/* Super Admin Card - Exclusive Role */}
            <div className="permission-card super-admin-exclusive" style={{ borderColor: '#dc2626' }}>
              <div className="permission-header" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}>
                <i className="fas fa-crown"></i>
                <h3>Super Admin</h3>
                <span className="exclusive-badge">Exclusive</span>
              </div>
              <div className="permission-body">
                <p>Full access to all features - Only one in system</p>
                <ul>
                  <li><i className="fas fa-check"></i> All Dashboard Access</li>
                  <li><i className="fas fa-check"></i> Manage All Employees</li>
                  <li><i className="fas fa-check"></i> Create Delegated Admins</li>
                  <li><i className="fas fa-check"></i> Manage Customers</li>
                  <li><i className="fas fa-check"></i> Manage Partners</li>
                  <li><i className="fas fa-check"></i> System Settings</li>
                  <li><i className="fas fa-lock"></i> Cannot be assigned to others</li>
                </ul>
              </div>
            </div>
            
            {roleOptions.map(role => (
              <div key={role.value} className="permission-card" style={{ borderColor: role.color }}>
                <div className="permission-header" style={{ background: role.color }}>
                  <i className={`fas ${role.value === 'delegated-super-admin' ? 'fa-user-cog' : 'fa-user-shield'}`}></i>
                  <h3>{role.label}</h3>
                </div>
                <div className="permission-body">
                  <p>{role.description}</p>
                  <ul>
                    {role.value === 'delegated-super-admin' && (
                      <>
                        <li><i className="fas fa-check"></i> Dashboard Access</li>
                        <li><i className="fas fa-check"></i> Add/Edit Employees</li>
                        <li><i className="fas fa-check"></i> Remove Regular Admins</li>
                        <li><i className="fas fa-times"></i> Cannot Delete Delegated Admins</li>
                        <li><i className="fas fa-times"></i> Cannot Modify Super Admin</li>
                        <li><i className="fas fa-shield-alt"></i> Restricted Access</li>
                      </>
                    )}
                    {role.value === 'admin' && (
                      <>
                        <li><i className="fas fa-check"></i> Dashboard Access</li>
                        <li><i className="fas fa-check"></i> Manage Customers</li>
                        <li><i className="fas fa-check"></i> Manage Partners</li>
                        <li><i className="fas fa-check"></i> Manage Bookings</li>
                        <li><i className="fas fa-times"></i> Cannot Manage Employees</li>
                      </>
                    )}
                    {role.value === 'admin-custom' && (
                      <>
                        <li><i className="fas fa-check"></i> Customizable Access</li>
                        <li><i className="fas fa-check"></i> Select Specific Modules</li>
                        <li><i className="fas fa-cog"></i> Granular Permissions</li>
                        <li><i className="fas fa-times"></i> Cannot Manage Employees</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="mp-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="mp-modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2><i className="fas fa-user-plus"></i> Add New Employee</h2>
              <button className="mp-modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="mp-modal-body">
                {formError && <div className="mp-form-error"><i className="fas fa-exclamation-circle"></i> {formError}</div>}
                
                {/* Show restriction notice for delegated super admin */}
                {profile?.role === 'delegated-super-admin' && (
                  <div className="mp-restriction-notice">
                    <i className="fas fa-info-circle"></i>
                    <span>As a Delegated Super Admin, you can only create Admin and Custom Admin roles.</span>
                  </div>
                )}
                
                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-group department-select-group full-width">
                  <label><i className="fas fa-building"></i> Department *</label>
                  <div className="department-grid">
                    {departmentOptions.map(dept => (
                      <label 
                        key={dept.value}
                        className={`department-option ${formData.department === dept.value ? 'selected' : ''}`}
                        style={{ '--dept-color': dept.color }}
                      >
                        <input
                          type="radio"
                          name="department"
                          value={dept.value}
                          checked={formData.department === dept.value}
                          onChange={handleInputChange}
                        />
                        <div className="dept-option-content">
                          <div className="dept-icon" style={{ background: dept.color }}>
                            <i className={`fas ${dept.icon}`}></i>
                          </div>
                          <div className="dept-info">
                            <span className="dept-name">{dept.label}</span>
                            <span className="dept-desc">{dept.description}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Designation *</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g., Manager, Executive, Lead"
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Salary (Monthly)</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="Enter monthly salary"
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {/* Portal Admin Role Selection - Only for Portal Management Department */}
                {formData.department === 'portal-management' && (
                  <div className="mp-form-group portal-role-section">
                    <label><i className="fas fa-user-shield"></i> Portal Access Role *</label>
                    <p className="form-hint">Since this employee is in Portal Management, assign a portal access role.</p>
                    <div className="role-select-grid">
                      {roleOptions.filter(role => canAssignRole(role.value)).map(role => (
                        <label 
                          key={role.value} 
                          className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                          style={{ '--role-color': role.color }}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={handleInputChange}
                          />
                          <div className="role-option-content">
                            <span className="role-name">{role.label}</span>
                            <span className="role-desc">{role.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Non-Portal Department Info */}
                {formData.department && formData.department !== 'portal-management' && (
                  <div className="mp-form-group non-portal-info">
                    <div className="info-box">
                      <i className="fas fa-info-circle"></i>
                      <div>
                        <strong>Regular Employee</strong>
                        <p>This employee will be added as a regular staff member without portal admin access. They can still log in to view their profile and basic features.</p>
                      </div>
                    </div>
                    
                    {/* Delegated Admin Toggle - Only for Super Admins */}
                    {(profile?.role === 'super-admin' || profile?.isPrimarySuperAdmin) && (
                      <div className="delegated-admin-toggle">
                        <label className={`toggle-option ${formData.isDelegatedAdmin ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={formData.isDelegatedAdmin}
                            onChange={(e) => setFormData(prev => ({ ...prev, isDelegatedAdmin: e.target.checked }))}
                          />
                          <div className="toggle-content">
                            <div className="toggle-icon">
                              <i className="fas fa-user-shield"></i>
                            </div>
                            <div className="toggle-info">
                              <span className="toggle-label">Make Delegated Admin</span>
                              <span className="toggle-desc">Grant this employee delegated super admin access to manage portal</span>
                            </div>
                            <div className="toggle-switch">
                              <span className="switch-track"></span>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Access Checkboxes - shown only for Custom Admin in Portal Management */}
                {formData.department === 'portal-management' && formData.role === 'admin-custom' && (
                  <div className="mp-form-group admin-access-section">
                    <div className="admin-access-header">
                      <label><i className="fas fa-key"></i> Select Admin Access Permissions</label>
                      <div className="access-quick-actions">
                        <button type="button" className="quick-action-btn" onClick={handleSelectAllAccess}>
                          <i className="fas fa-check-double"></i> Select All
                        </button>
                        <button type="button" className="quick-action-btn clear" onClick={handleClearAllAccess}>
                          <i className="fas fa-times"></i> Clear All
                        </button>
                      </div>
                    </div>
                    <div className="admin-access-grid">
                      {adminAccessOptions.map(option => (
                        <label 
                          key={option.id} 
                          className={`access-option ${formData.adminAccess?.includes(option.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.adminAccess?.includes(option.id) || false}
                            onChange={() => handleAccessChange(option.id)}
                          />
                          <div className="access-option-content">
                            <i className={`fas ${option.icon}`}></i>
                            <span className="access-label">{option.label}</span>
                            <span className="access-desc">{option.description}</span>
                          </div>
                          <span className="access-check"><i className="fas fa-check"></i></span>
                        </label>
                      ))}
                    </div>
                    {formData.adminAccess?.length === 0 && (
                      <div className="access-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        Please select at least one access permission
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mp-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Employee</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="mp-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="mp-modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2><i className="fas fa-user-edit"></i> Edit Employee</h2>
              <button className="mp-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="mp-modal-body">
                {formError && <div className="mp-form-error"><i className="fas fa-exclamation-circle"></i> {formError}</div>}
                
                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="disabled"
                    />
                    <small>Email cannot be changed</small>
                  </div>
                </div>

                {/* Super Admin Info - No department selection needed */}
                {(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') ? (
                  <div className="mp-form-group super-admin-info full-width">
                    <div className="info-box super-admin-box">
                      <i className="fas fa-crown"></i>
                      <div>
                        <strong>Primary Super Admin</strong>
                        <p>Super Admin has full access to all departments and portal features. Department selection is not required.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mp-form-group department-select-group full-width">
                    <label><i className="fas fa-building"></i> Department *</label>
                    <div className="department-grid">
                      {departmentOptions.map(dept => (
                        <label 
                          key={dept.value}
                          className={`department-option ${formData.department === dept.value ? 'selected' : ''}`}
                          style={{ '--dept-color': dept.color }}
                        >
                          <input
                            type="radio"
                            name="department"
                            value={dept.value}
                            checked={formData.department === dept.value}
                            onChange={handleInputChange}
                          />
                          <div className="dept-option-content">
                            <div className="dept-icon" style={{ background: dept.color }}>
                              <i className={`fas ${dept.icon}`}></i>
                            </div>
                            <div className="dept-info">
                              <span className="dept-name">{dept.label}</span>
                              <span className="dept-desc">{dept.description}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mp-form-row">
                  <div className="mp-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="mp-form-group">
                    <label>Designation {!(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') && '*'}</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g., Manager, Executive, Lead"
                      required={!(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin')}
                      disabled={selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin'}
                      className={selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin' ? 'disabled' : ''}
                    />
                    {(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') && (
                      <small>Designation cannot be changed for Super Admin</small>
                    )}
                  </div>
                  <div className="mp-form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      disabled={selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin'}
                      className={selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin' ? 'disabled' : ''}
                    />
                    {(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') && (
                      <small>Portal creation date</small>
                    )}
                  </div>
                </div>

                {/* Salary and Address - Hide salary for Super Admin */}
                {!(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') && (
                  <div className="mp-form-row">
                    <div className="mp-form-group">
                      <label>Salary (Monthly)</label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="Enter monthly salary"
                      />
                    </div>
                    <div className="mp-form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                )}

                {/* Address only for Super Admin */}
                {(selectedEmployee.isPrimarySuperAdmin || selectedEmployee.role === 'super-admin') && (
                  <div className="mp-form-row">
                    <div className="mp-form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                )}

                {/* Portal Admin Role Selection - Only for Portal Management Department */}
                {formData.department === 'portal-management' && (
                  <div className="mp-form-group portal-role-section">
                    <label><i className="fas fa-user-shield"></i> Portal Access Role *</label>
                    <p className="form-hint">Since this employee is in Portal Management, assign a portal access role.</p>
                    <div className="role-select-grid">
                      {roleOptions.filter(role => canAssignRole(role.value)).map(role => (
                        <label 
                          key={role.value} 
                          className={`role-option ${formData.role === role.value ? 'selected' : ''} ${!canAssignRole(role.value) ? 'disabled-role' : ''}`}
                          style={{ '--role-color': role.color }}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={handleInputChange}
                            disabled={!canAssignRole(role.value)}
                          />
                        <div className="role-option-content">
                          <span className="role-name">{role.label}</span>
                          <span className="role-desc">{role.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  </div>
                )}

                {/* Non-Portal Department Info - Hide for Super Admin */}
                {formData.department && formData.department !== 'portal-management' && 
                 !selectedEmployee.isPrimarySuperAdmin && selectedEmployee.role !== 'super-admin' && (
                  <div className="mp-form-group non-portal-info">
                    <div className="info-box">
                      <i className="fas fa-info-circle"></i>
                      <div>
                        <strong>Regular Employee</strong>
                        <p>This employee is a regular staff member without portal admin access. They can still log in to view their profile and basic features.</p>
                      </div>
                    </div>
                    
                    {/* Delegated Admin Toggle - Only for Super Admins editing non-super-admin employees */}
                    {(profile?.role === 'super-admin' || profile?.isPrimarySuperAdmin) && 
                     !selectedEmployee.isPrimarySuperAdmin && 
                     selectedEmployee.role !== 'super-admin' && (
                      <div className="delegated-admin-toggle">
                        <label className={`toggle-option ${formData.isDelegatedAdmin ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={formData.isDelegatedAdmin}
                            onChange={(e) => setFormData(prev => ({ ...prev, isDelegatedAdmin: e.target.checked }))}
                          />
                          <div className="toggle-content">
                            <div className="toggle-icon">
                              <i className="fas fa-user-shield"></i>
                            </div>
                            <div className="toggle-info">
                              <span className="toggle-label">Make Delegated Admin</span>
                              <span className="toggle-desc">Grant this employee delegated super admin access to manage portal</span>
                            </div>
                            <div className="toggle-switch">
                              <span className="switch-track"></span>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Access Checkboxes - shown only for Custom Admin in Portal Management */}
                {formData.department === 'portal-management' && formData.role === 'admin-custom' && (
                  <div className="mp-form-group admin-access-section">
                    <div className="admin-access-header">
                      <label><i className="fas fa-key"></i> Select Admin Access Permissions</label>
                      <div className="access-quick-actions">
                        <button type="button" className="quick-action-btn" onClick={handleSelectAllAccess}>
                          <i className="fas fa-check-double"></i> Select All
                        </button>
                        <button type="button" className="quick-action-btn clear" onClick={handleClearAllAccess}>
                          <i className="fas fa-times"></i> Clear All
                        </button>
                      </div>
                    </div>
                    <div className="admin-access-grid">
                      {adminAccessOptions.map(option => (
                        <label 
                          key={option.id} 
                          className={`access-option ${formData.adminAccess?.includes(option.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.adminAccess?.includes(option.id) || false}
                            onChange={() => handleAccessChange(option.id)}
                          />
                          <div className="access-option-content">
                            <i className={`fas ${option.icon}`}></i>
                            <span className="access-label">{option.label}</span>
                            <span className="access-desc">{option.description}</span>
                          </div>
                          <span className="access-check"><i className="fas fa-check"></i></span>
                        </label>
                      ))}
                    </div>
                    {formData.adminAccess?.length === 0 && (
                      <div className="access-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        Please select at least one access permission
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mp-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <><i className="fas fa-save"></i> Update Employee</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPortal;
