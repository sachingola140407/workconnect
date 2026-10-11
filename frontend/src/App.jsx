import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import LocationModal from './components/LocationModal';
import InstallAppModal from './components/InstallAppModal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomerBottomNav from './components/CustomerBottomNav';
import RoleSelectionPage from './pages/RoleSelectionPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCapacitor =
    typeof window !== 'undefined' &&
    (window.Capacitor !== undefined || window.location.protocol === 'capacitor:');

  const isCleanMobileRoute =
    location.pathname === '/role-select' ||
    location.pathname === '/join' ||
    location.pathname === '/professional/setup' ||
    location.pathname === '/professional' ||
    location.pathname.startsWith('/track/');

  const isCustomerBottomNavRoute =
    !isAdminRoute &&
    !isCleanMobileRoute &&
    (location.pathname === '/' ||
      location.pathname === '/services' ||
      location.pathname === '/customer' ||
      location.pathname === '/orders' ||
      location.pathname === '/support' ||
      location.pathname === '/profile');

  return (
    <div className="app-container">
      <LocationModal />
      <InstallAppModal />

      {!isAdminRoute && !isCleanMobileRoute && !isCapacitor && <Navbar />}

      <main className="main-content" style={{ padding: 0 }}>
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/track/:bookingId" element={<LiveTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/role-select" element={<RoleSelectionPage />} />
          <Route path="/join" element={<RoleSelectionPage />} />
          <Route path="/professional/setup" element={<CompleteProfilePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Customer Dashboard & Navigation Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/orders" element={<CustomerDashboard initialTab="orders" />} />
          <Route path="/support" element={<CustomerDashboard initialTab="support" />} />
          <Route path="/profile" element={<CustomerDashboard initialTab="profile" />} />

          {/* Professional Dashboard (Screens 5-10 from Reference Image 2) */}
          <Route
            path="/professional"
            element={
              <ProtectedRoute allowedRoles={['professional']}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Command Center (Phase 3) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Persistent Customer Bottom Navigation (Always Visible on Home, Orders, Support, Profile) */}
      {isCustomerBottomNavRoute && <CustomerBottomNav />}

      {!isAdminRoute && !isCleanMobileRoute && !isCapacitor && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
