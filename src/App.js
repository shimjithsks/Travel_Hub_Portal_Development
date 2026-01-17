import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import PartnerNavbar from './components/PartnerNavbar';
import Footer from './components/FooterNew';
import PartnerFooter from './components/PartnerFooter';
import LocationPermission from './components/LocationPermission';
import LoadingPage from './components/LoadingPage';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Tours from './pages/Tours';
import Destination from './pages/Destination';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import TourDetails from './pages/TourDetails';
import TourGuide from './pages/TourGuide';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import TravelAgents from './pages/Partner/TravelAgents';
import AgentSignup from './pages/Partner/AgentSignup';
import PortalDashboard from './pages/Partner/PortalDashboard';
import AdminPortal from './pages/admin/AdminPortal';
import AdminLogin from './pages/admin/AdminLogin';
import ManagementPortal from './pages/admin/ManagementPortal';
import ManagementLogin from './pages/admin/ManagementLogin';
import PartnerDashboard from './pages/Partner/PartnerDashboard';
import SetPassword from './pages/Partner/SetPassword';
import ForgotPassword from './pages/Partner/ForgotPassword';
import NotFound from './pages/NotFound';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import HotelReview from './pages/HotelReview';
import Flights from './pages/Flights';
import FleetResults from './pages/FleetResults';
import VehicleDetails from './pages/VehicleDetails';
import SendEnquiry from './pages/SendEnquiry';
import BookVehicle from './pages/BookVehicle';
import DashboardRedirect from './components/auth/DashboardRedirect';
import RequireRole from './components/auth/RequireRole';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerForgotPassword from './pages/customer/CustomerForgotPassword';
import CompleteBooking from './pages/CompleteBooking';
import MakePayment from './pages/MakePayment';
import CompleteHoliday from './pages/CompleteHoliday';
import Offers from './pages/Offers';
import './App.css';

// Routes that should show PartnerNavbar and PartnerFooter
const partnerRoutes = ['/travel-agents', '/agent-login', '/agent-signup', '/set-password', '/forgot-password'];

// Routes that should have NO footer
const noFooterRoutes = [
  '/partner-dashboard',
  '/portal-dashboard',
  '/admin-portal',
  '/admin-login',
  '/management-portal',
  '/management-login'
];

// Routes that should have NO navbar
const noNavbarRoutes = [
  '/partner-dashboard',
  '/portal-dashboard',
  '/admin-portal',
  '/admin-login',
  '/management-portal',
  '/management-login'
];

// Navbar component that conditionally renders based on route
function ConditionalNavbar() {
  const location = useLocation();
  
  // No navbar for dashboard pages
  if (noNavbarRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))) {
    return null;
  }
  
  // Partner navbar for partner pages
  if (partnerRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))) {
    return <PartnerNavbar />;
  }
  
  // Default navbar for all other pages
  return <Navbar />;
}

// Footer component that conditionally renders based on route
function ConditionalFooter() {
  const location = useLocation();
  
  // No footer for these partner pages
  if (noFooterRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))) {
    return null;
  }
  
  // Partner footer for partner pages
  if (partnerRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'))) {
    return <PartnerFooter />;
  }
  
  // Default footer for all other pages
  return <Footer />;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    
    // Load Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(link);

    // Show loading page for minimum 2 seconds before rendering app
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <LocationPermission />
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        
        {/* Partner/Agent Routes */}
        <Route path="/travel-agents" element={<TravelAgents />} />
        <Route path="/agent-signup" element={<AgentSignup />} />
        <Route path="/agent-login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/portal-dashboard" element={<PortalDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
        <Route path="/management-login" element={<ManagementLogin />} />
        <Route path="/management-portal" element={<ManagementPortal />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/operator"
          element={
            <RequireRole role="operator">
              <OperatorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/customer"
          element={
            <RequireRole role="customer">
              <CustomerDashboard />
            </RequireRole>
          }
        />
        
        {/* Customer Auth Routes */}
        <Route path="/customer-forgot-password" element={<CustomerForgotPassword />} />
        
        <Route path="/complete-booking" element={<CompleteBooking />} />
        <Route path="/make-payment" element={<MakePayment />} />
        <Route path="/complete-holiday" element={<CompleteHoliday />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Services />} />
        <Route path="/tour" element={<Tours />} />
        <Route path="/destination" element={<Destination />} />
        <Route path="/destination/:id" element={<Destination />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel-detail/:id" element={<HotelDetail />} />
        <Route path="/hotel-review" element={<HotelReview />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/fleet-results" element={<FleetResults />} />
        <Route path="/vehicle-details/:id" element={<VehicleDetails />} />
        <Route path="/send-enquiry/:type/:id" element={<SendEnquiry />} />
        <Route path="/send-enquiry" element={<SendEnquiry />} />
        <Route path="/book-vehicle/:type/:id" element={<BookVehicle />} />
        <Route path="/book-vehicle" element={<BookVehicle />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tour-details" element={<TourDetails />} />
        <Route path="/tour-details/:id" element={<TourDetails />} />
        <Route path="/tour-guide/:id" element={<TourGuide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConditionalFooter />
    </HashRouter>
  );
}

export default App;
