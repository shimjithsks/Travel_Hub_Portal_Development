import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5">
      <h2 className="mb-2">Page not found</h2>
      <Link to="/">Go home</Link>
    </div>
  );
}
