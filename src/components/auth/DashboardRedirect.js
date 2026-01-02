import React from 'react';
import { Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { useAuth } from '../../context/AuthContext';

export default function DashboardRedirect() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const { role } = useAuth();

  if (role === 'operator') return <Navigate to="/operator" replace />;
  if (role === 'customer') return <Navigate to="/customer" replace />;

  return <Navigate to="/" replace />;
}
