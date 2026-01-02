import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const { user, profile } = useAuth();

  return (
    <div className="container py-5">
      <h2 className="mb-1">Customer Dashboard</h2>
      <div className="text-muted mb-4">Signed in as {profile?.name || user?.displayName || user?.email}</div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Next steps</h5>
          <ul className="mb-0">
            <li>Choose your location (coming next)</li>
            <li>Browse packages / vehicles by location</li>
            <li>Book with advance payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
