import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Store the intended destination when user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [loading, user, location]);

  if (loading) return null;
  // Redirect to home if not logged in - the login modal will handle authentication
  if (!user) return <Navigate to="/" replace state={{ showLogin: true, from: location.pathname + location.search }} />;
  return children;
}
