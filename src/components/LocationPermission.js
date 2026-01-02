import React, { useState, useEffect } from 'react';
import './LocationPermission.css';

export default function LocationPermission() {
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Check if location permission was already handled
    const locationPermission = localStorage.getItem('locationPermission');
    
    if (!locationPermission) {
      // Show modal after a short delay for better UX
      setTimeout(() => {
        setShowModal(true);
      }, 1000);
    }
  }, []);

  const handleAllowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
          
          setLocation(userLocation);
          localStorage.setItem('locationPermission', 'granted');
          localStorage.setItem('userLocation', JSON.stringify(userLocation));
          setShowModal(false);
          
          console.log('User location:', userLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          localStorage.setItem('locationPermission', 'denied');
          setShowModal(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setShowModal(false);
    }
  };

  const handleDenyLocation = () => {
    localStorage.setItem('locationPermission', 'denied');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="location-modal-overlay">
      <div className="location-modal">
        <div className="location-icon">
          <i className="fas fa-map-marker-alt"></i>
        </div>
        
        <h2>Enable Location Services</h2>
        <p>
          We'd like to access your location to provide you with personalized travel recommendations 
          and show nearby destinations, hotels, and attractions.
        </p>
        
        <div className="location-benefits">
          <div className="benefit-item">
            <i className="fas fa-check-circle"></i>
            <span>Find nearby destinations</span>
          </div>
          <div className="benefit-item">
            <i className="fas fa-check-circle"></i>
            <span>Get personalized recommendations</span>
          </div>
          <div className="benefit-item">
            <i className="fas fa-check-circle"></i>
            <span>View accurate distances</span>
          </div>
        </div>

        <div className="location-actions">
          <button className="btn-allow" onClick={handleAllowLocation}>
            <i className="fas fa-location-arrow"></i>
            Allow Location
          </button>
          <button className="btn-deny" onClick={handleDenyLocation}>
            Not Now
          </button>
        </div>

        <p className="privacy-note">
          <i className="fas fa-shield-alt"></i>
          Your privacy is important to us. We only use your location to enhance your experience.
        </p>
      </div>
    </div>
  );
}
