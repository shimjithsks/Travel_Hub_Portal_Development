import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/FooterNew';
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
import PartnerDashboard from './pages/Partner/PartnerDashboard';
import NotFound from './pages/NotFound';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import HotelReview from './pages/HotelReview';
import Flights from './pages/Flights';
import FleetResults from './pages/FleetResults';
import VehicleDetails from './pages/VehicleDetails';
import DashboardRedirect from './components/auth/DashboardRedirect';
import RequireRole from './components/auth/RequireRole';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookings from './pages/customer/MyBookings';
import MyRefund from './pages/customer/MyRefund';
import MyECash from './pages/customer/MyECash';
import MyProfile from './pages/customer/MyProfile';
import CompleteBooking from './pages/CompleteBooking';
import MakePayment from './pages/MakePayment';
import CompleteHoliday from './pages/CompleteHoliday';
import Offers from './pages/Offers';
import './App.css';

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
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        
        {/* Partner/Agent Routes */}
        <Route path="/travel-agents" element={<TravelAgents />} />
        <Route path="/agent-signup" element={<AgentSignup />} />
        <Route path="/agent-login" element={<Login />} />
        <Route path="/portal-dashboard" element={<PortalDashboard />} />
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
        <Route
          path="/customer/my-bookings"
          element={<MyBookings />}
        />
        <Route
          path="/customer/my-refund"
          element={<MyRefund />}
        />
        <Route
          path="/customer/my-ecash"
          element={<MyECash />}
        />
        <Route
          path="/customer/my-profile"
          element={<MyProfile />}
        />
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
      <Footer />
    </HashRouter>
  );
}

export default App;
