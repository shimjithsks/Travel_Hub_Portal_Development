import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { loading, user, role: currentRole } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!currentRole) return <Navigate to="/dashboard" replace />;
  if (currentRole !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
