import React from 'react';
import './LoadingPage.css';

export default function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-container">
        {/* Animated Logo/Icon */}
        <div className="loading-icon">
          <div className="icon-circle">
            <i className="fas fa-compass"></i>
          </div>
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
        </div>

        {/* Loading Text */}
        <h1 className="loading-title">Travel Axis</h1>
        <p className="loading-subtitle">Preparing your journey...</p>

        {/* Animated Loader Dots */}
        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      {/* Background Animation Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
}
