import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/managementLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [noSuperAdmin, setNoSuperAdmin] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Check if super admin exists
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const superAdmins = snapshot.docs.filter(doc => doc.data().role === 'super-admin');
        setNoSuperAdmin(superAdmins.length === 0);
      } catch (error) {
        console.error('Error checking super admin:', error);
      } finally {
        setCheckingSetup(false);
      }
    };
    checkSuperAdmin();
  }, []);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (authLoading) return;
    
    if (user && profile) {
      const role = profile.role || '';
      if (role === 'super-admin' || role.startsWith('admin')) {
        navigate('/admin-portal', { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin/super-admin
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (!userDoc.exists()) {
        setError('Account not found. Please contact administrator.');
        await auth.signOut();
        setSubmitting(false);
        return;
      }

      const userData = userDoc.data();
      const role = userData.role || '';

      // Check for valid admin roles including delegated-super-admin
      const validRoles = ['super-admin', 'delegated-super-admin'];
      const isValidAdmin = validRoles.includes(role) || role.startsWith('admin');

      if (!isValidAdmin) {
        setError('Access denied. This portal is for admin users only.');
        await auth.signOut();
        setSubmitting(false);
        return;
      }

      if (userData.status === 'inactive') {
        setError('Your account has been deactivated. Please contact super admin.');
        await auth.signOut();
        setSubmitting(false);
        return;
      }

      // Successful login - redirect to admin portal
      navigate('/admin-portal', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Show loading while checking setup
  if (checkingSetup || authLoading) {
    return <LoadingSpinner size="fullpage" text="Loading admin portal..." overlay />;
  }

  // Redirect to setup if no super admin exists
  if (noSuperAdmin) {
    return (
      <div className="mgmt-login-page">
        <div className="mgmt-login-container">
          <div className="mgmt-login-card">
            <div className="mgmt-login-header">
              <div className="mgmt-login-icon setup">
                <i className="fas fa-user-shield"></i>
              </div>
              <h2>Initial Setup Required</h2>
              <p>No super admin exists in the system. Please complete the initial setup first.</p>
            </div>
            
            <Link to="/management-portal" className="mgmt-setup-btn">
              <i className="fas fa-cog"></i>
              Go to Setup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mgmt-login-page">
      <div className="mgmt-login-container">
        <div className="mgmt-login-card">
          <div className="mgmt-login-header">
            <div className="mgmt-login-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <h2>Admin Portal</h2>
            <p>Sign in to access the administration dashboard</p>
          </div>

          {error && (
            <div className="mgmt-login-alert">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mgmt-login-form">
            <div className="mgmt-input-group">
              <label>Email Address</label>
              <div className="mgmt-input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mgmt-input-group">
              <label>Password</label>
              <div className="mgmt-input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="mgmt-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mgmt-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="mgmt-btn-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="mgmt-login-footer">
            <Link to="/" className="mgmt-back-link">
              <i className="fas fa-arrow-left"></i>
              Back to Main Website
            </Link>
          </div>

          <div className="mgmt-trust-badges">
            <div className="mgmt-trust-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Secure Access</span>
            </div>
            <div className="mgmt-trust-badge">
              <i className="fas fa-user-shield"></i>
              <span>Admin Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
