import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

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

  if (loading) return <LoadingSpinner size="fullpage" text="Authenticating..." />;
  
  // Redirect to home if not logged in - the login modal will handle authentication
  if (!user) return <Navigate to="/" replace state={{ showLogin: true, from: location.pathname + location.search }} />;
  
  // If user exists but role is not loaded yet, show loading
  if (!currentRole) {
    return <LoadingSpinner size="large" text="Loading your profile..." />;
  }
  
  if (currentRole !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
