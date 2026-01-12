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
const APP_VERSION = '1.0.1';

// Clear old cached data if version changed
const storedVersion = localStorage.getItem('appVersion');
if (storedVersion !== APP_VERSION) {
  console.log('App updated! Clearing old cached data...');
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('appVersion', APP_VERSION);
  // Clear service worker cache if exists
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<AuthProvider>
		<App />
	</AuthProvider>
);
