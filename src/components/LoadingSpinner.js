import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable Loading Spinner Component
 * @param {string} size - 'small', 'medium', 'large', 'fullpage' (default: 'medium')
 * @param {string} text - Loading text to display (default: 'Loading...')
 * @param {boolean} overlay - Show as overlay (default: false)
 */
export default function LoadingSpinner({ size = 'medium', text = 'Loading...', overlay = false }) {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
    fullpage: 'spinner-fullpage'
  };

  if (size === 'fullpage' || overlay) {
    return (
      <div className={`loading-spinner-overlay ${overlay ? 'has-overlay' : ''}`}>
        <div className="loading-spinner-container">
          <div className="loading-spinner-icon">
            <div className="spinner-circle">
              <i className="fas fa-compass"></i>
            </div>
            <div className="spinner-orbit spinner-orbit-1"></div>
            <div className="spinner-orbit spinner-orbit-2"></div>
          </div>
          <h3 className="loading-spinner-title">Travel Axis</h3>
          <p className="loading-spinner-text">{text}</p>
          <div className="loading-spinner-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-inline ${sizeClasses[size]}`}>
      <div className="loading-spinner-icon-inline">
        <i className="fas fa-compass"></i>
      </div>
      <span className="loading-spinner-text-inline">{text}</span>
    </div>
  );
}

/**
 * Simple inline spinner for buttons
 */
export function ButtonSpinner() {
  return <i className="fas fa-circle-notch fa-spin"></i>;
}

/**
 * Card/Section loading placeholder
 */
export function CardLoader({ count = 1 }) {
  return (
    <div className="card-loader-container">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card-loader">
          <div className="card-loader-image"></div>
          <div className="card-loader-content">
            <div className="card-loader-line long"></div>
            <div className="card-loader-line medium"></div>
            <div className="card-loader-line short"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
