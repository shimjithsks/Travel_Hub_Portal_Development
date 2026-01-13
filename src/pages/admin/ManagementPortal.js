import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
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
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'admin',
    department: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role options
  const roleOptions = [
    { value: 'super-admin', label: 'Super Admin', description: 'Full access to all features', color: '#dc2626' },
    { value: 'admin', label: 'Admin', description: 'Access to all admin features', color: '#7c3aed' },
    { value: 'admin-customers', label: 'Admin - Customers', description: 'Access only to customer management', color: '#0891b2' },
    { value: 'admin-partners', label: 'Admin - Partners', description: 'Access only to partner management', color: '#059669' },
    { value: 'admin-bookings', label: 'Admin - Bookings', description: 'Access only to booking management', color: '#d97706' }
  ];

  // Check if any super admin exists
  const checkSuperAdminExists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const superAdmins = snapshot.docs.filter(doc => doc.data().role === 'super-admin');
      return superAdmins.length > 0;
    } catch (error) {
      console.error('Error checking super admin:', error);
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

  // Fetch all employees (admin users)
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const employeesList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role && user.role.startsWith('admin') || user.role === 'super-admin');
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

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
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

      // Create user document in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        role: formData.role,
        department: formData.department || '',
        isEmployee: true,
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
      setFormError(error.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', selectedEmployee.id), {
        name: formData.name,
        phone: formData.phone || '',
        role: formData.role,
        department: formData.department || '',
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });

      showNotification(`Employee ${formData.name} updated successfully!`, 'success');
      setShowEditModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      setFormError(error.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Are you sure you want to remove ${employee.name} from the system?`)) {
      return;
    }

    try {
      // Update role to 'customer' instead of deleting
      await updateDoc(doc(db, 'users', employee.id), {
        role: 'customer',
        isEmployee: false,
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
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'users', employee.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showNotification(`${employee.name} is now ${newStatus}`, 'success');
      fetchEmployees();
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      confirmPassword: '',
      phone: employee.phone || '',
      role: employee.role || 'admin',
      department: employee.department || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'admin',
      department: ''
    });
    setFormError('');
    setSelectedEmployee(null);
  };

  const getRoleInfo = (role) => {
    return roleOptions.find(r => r.value === role) || { label: role, color: '#64748b' };
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

      // Create user document in Firestore as super-admin
      await setDoc(doc(db, 'users', cred.user.uid), {
        employeeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        role: 'super-admin',
        department: 'Management',
        isEmployee: true,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      showNotification('Super Admin account created! You are now logged in.', 'success');
      
      // Refresh the profile to get the new role
      await refreshProfile();
      
      setSetupMode(false);
      setNoSuperAdmin(false);
      resetForm();
      fetchEmployees();
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
    return (
      <div className="management-portal">
        <div className="mp-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#14b8a6' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only super-admin can access this page
  if (profile?.role !== 'super-admin') {
    return (
      <div className="management-portal">
        <div className="access-denied">
          <i className="fas fa-lock"></i>
          <h2>Access Denied</h2>
          <p>Only Super Admins can access the Management Portal.</p>
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
        {/* Stats Cards */}
        <div className="mp-stats">
          <div className="mp-stat-card total">
            <div className="stat-icon"><i className="fas fa-users"></i></div>
            <div className="stat-info">
              <h3>{employees.length}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="mp-stat-card super-admin">
            <div className="stat-icon"><i className="fas fa-crown"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.role === 'super-admin').length}</h3>
              <p>Super Admins</p>
            </div>
          </div>
          <div className="mp-stat-card admin">
            <div className="stat-icon"><i className="fas fa-user-shield"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.role === 'admin').length}</h3>
              <p>Admins</p>
            </div>
          </div>
          <div className="mp-stat-card active">
            <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="stat-info">
              <h3>{employees.filter(e => e.status === 'active').length}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>

        {/* Employees Section */}
        <div className="mp-section">
          <div className="mp-section-header">
            <h2><i className="fas fa-id-badge"></i> Employee Directory</h2>
            <button className="mp-add-btn" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              <i className="fas fa-plus"></i>
              <span>Add Employee</span>
            </button>
          </div>

          {/* Role Legend */}
          <div className="mp-role-legend">
            {roleOptions.map(role => (
              <div key={role.value} className="legend-item">
                <span className="legend-dot" style={{ background: role.color }}></span>
                <span>{role.label}</span>
              </div>
            ))}
          </div>

          {/* Employees List */}
          <div className="mp-employees-grid">
            {loading ? (
              <div className="mp-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="mp-empty">
                <i className="fas fa-user-plus"></i>
                <p>No employees found. Add your first employee!</p>
              </div>
            ) : (
              employees.map(employee => {
                const roleInfo = getRoleInfo(employee.role);
                return (
                  <div key={employee.id} className={`mp-employee-card ${employee.status === 'inactive' ? 'inactive' : ''}`}>
                    <div className="employee-header">
                      <div className="employee-avatar" style={{ background: roleInfo.color }}>
                        {employee.name?.charAt(0) || '?'}
                      </div>
                      <div className="employee-basic">
                        <h3>{employee.name}</h3>
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
                        <i className="fas fa-building"></i>
                        <span>{employee.department || 'Not assigned'}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Joined {formatDate(employee.createdAt)}</span>
                      </div>
                    </div>

                    <div className="employee-role">
                      <span className="role-badge" style={{ background: roleInfo.color }}>
                        <i className={`fas ${employee.role === 'super-admin' ? 'fa-crown' : 'fa-user-shield'}`}></i>
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="employee-actions">
                      <button className="action-btn edit" onClick={() => openEditModal(employee)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className={`action-btn ${employee.status === 'active' ? 'deactivate' : 'activate'}`} 
                        onClick={() => handleToggleStatus(employee)}
                        title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${employee.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                      </button>
                      {profile?.role === 'super-admin' && employee.role !== 'super-admin' && (
                        <button className="action-btn delete" onClick={() => handleDeleteEmployee(employee)} title="Remove">
                          <i className="fas fa-trash"></i>
                        </button>
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
            {roleOptions.map(role => (
              <div key={role.value} className="permission-card" style={{ borderColor: role.color }}>
                <div className="permission-header" style={{ background: role.color }}>
                  <i className={`fas ${role.value === 'super-admin' ? 'fa-crown' : 'fa-user-shield'}`}></i>
                  <h3>{role.label}</h3>
                </div>
                <div className="permission-body">
                  <p>{role.description}</p>
                  <ul>
                    {role.value === 'super-admin' && (
                      <>
                        <li><i className="fas fa-check"></i> All Dashboard Access</li>
                        <li><i className="fas fa-check"></i> Manage Employees</li>
                        <li><i className="fas fa-check"></i> Manage Customers</li>
                        <li><i className="fas fa-check"></i> Manage Partners</li>
                        <li><i className="fas fa-check"></i> Manage Bookings</li>
                        <li><i className="fas fa-check"></i> System Settings</li>
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
                    {role.value === 'admin-customers' && (
                      <>
                        <li><i className="fas fa-check"></i> View Dashboard</li>
                        <li><i className="fas fa-check"></i> Manage Customers</li>
                        <li><i className="fas fa-times"></i> No Partner Access</li>
                        <li><i className="fas fa-times"></i> No Booking Access</li>
                      </>
                    )}
                    {role.value === 'admin-partners' && (
                      <>
                        <li><i className="fas fa-check"></i> View Dashboard</li>
                        <li><i className="fas fa-check"></i> Manage Partners</li>
                        <li><i className="fas fa-times"></i> No Customer Access</li>
                        <li><i className="fas fa-times"></i> No Booking Access</li>
                      </>
                    )}
                    {role.value === 'admin-bookings' && (
                      <>
                        <li><i className="fas fa-check"></i> View Dashboard</li>
                        <li><i className="fas fa-check"></i> Manage Bookings</li>
                        <li><i className="fas fa-times"></i> No Customer Access</li>
                        <li><i className="fas fa-times"></i> No Partner Access</li>
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
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2><i className="fas fa-user-plus"></i> Add New Employee</h2>
              <button className="mp-modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
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
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Operations, Support"
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Role *</label>
                  <div className="role-select-grid">
                    {roleOptions.map(role => (
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
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
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
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Operations, Support"
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Role *</label>
                  <div className="role-select-grid">
                    {roleOptions.map(role => (
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
