import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { loading, user, role: currentRole } = useAuth();
  const location = useLocation();

  // Store the intended destination when user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      // Save the path user tried to access so we can redirect after login
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [loading, user, location]);

  if (loading) return null;
  
  // Redirect to home if not logged in - the login modal will handle authentication
  if (!user) return <Navigate to="/" replace state={{ showLogin: true, from: location.pathname + location.search }} />;
  
  // If user exists but role is not loaded yet, show loading or wait
  if (!currentRole) {
    // Check if still loading profile - give it a moment
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#1CA8CB' }}></i>
        <p style={{ color: '#64748b' }}>Loading your profile...</p>
      </div>
    );
  }
  
  if (currentRole !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
