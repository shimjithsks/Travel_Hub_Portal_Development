import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// App version - increment this to clear cached data on updates
const APP_VERSION = '1.1.0';

// Clear old cached data if version changed
const storedVersion = localStorage.getItem('appVersion');
if (storedVersion !== APP_VERSION) {
  console.log('App updated! Clearing old cached data...');
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Set new version
  localStorage.setItem('appVersion', APP_VERSION);
  
  // Clear service worker cache if exists
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Unregister any service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  // Clear IndexedDB (Firebase auth cache)
  if (window.indexedDB && indexedDB.databases) {
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    }).catch(() => {});
  }
  
  // Force reload to apply changes
  window.location.reload();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<AuthProvider>
		<App />
	</AuthProvider>
);
