import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, ChevronDown, User, LogOut, Shield, Briefcase, Layers, Navigation, Check, Menu, X } from 'lucide-react';
import SabFixBrand from './SabFixBrand';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    currentCity,
    userLocation,
    setManualLocation,
    detectLocation,
    isDetecting,
    popularCities,
  } = useLocationContext();

  const navigate = useNavigate();
  const location = useLocation();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowLocationMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'professional':
        return 'badge-professional';
      default:
        return 'badge-customer';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'professional':
        return '/professional';
      default:
        return '/customer';
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo - SabFix with Logo Mark and Styled Text */}
        <SabFixBrand size="md" layout="horizontal" />

        {/* Center Navigation Links with Underline Indicator */}
        <ul className="nav-links-desktop" style={{ alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
          <li>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: location.pathname === '/' ? 800 : 600,
                color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-muted)',
                paddingBottom: '6px',
                borderBottom: location.pathname === '/' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/services"
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: location.pathname.startsWith('/services') ? 800 : 600,
                color: location.pathname.startsWith('/services') ? 'var(--primary)' : 'var(--text-muted)',
                paddingBottom: '6px',
                borderBottom: location.pathname.startsWith('/services') ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Services
            </Link>
          </li>

          <li>
            <a
              href="/#how-it-works"
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                paddingBottom: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              How It Works
            </a>
          </li>

          <li>
            <a
              href="/#about"
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                paddingBottom: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              About
            </a>
          </li>

          {isAuthenticated && (
            <li>
              <Link
                to={getDashboardPath()}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 750,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Layers size={15} /> Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right Actions: Theme Toggle + Location Dropdown + Login & Sign Up Pills (Desktop) */}
        <div className="nav-actions-desktop" style={{ alignItems: 'center', gap: '1rem' }}>
          {/* Theme Mode Toggle (Light / Dark / System) */}
          <ThemeToggle variant="segmented" size="sm" />

          {/* Location Selector Pill */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                padding: '0.35rem 0.5rem',
                borderRadius: '8px',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ color: 'var(--primary)', display: 'flex' }}>
                <MapPin size={20} />
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-light)', fontWeight: 600 }}>
                  Location
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {currentCity}
                  <ChevronDown size={14} color="var(--text-muted)" />
                </span>
              </div>
            </div>

            {showLocationMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '270px',
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)',
                  padding: '0.85rem',
                  zIndex: 200,
                }}
              >
                {/* Current Active Location Info */}
                <div style={{ paddingBottom: '0.65rem', borderBottom: '1px solid var(--border)', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Location
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{currentCity}</span>
                  </div>
                  {userLocation?.address && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userLocation.address}
                    </div>
                  )}
                </div>

                {/* Detect GPS Button */}
                <button
                  onClick={async () => {
                    await detectLocation(false);
                    setShowLocationMenu(false);
                  }}
                  disabled={isDetecting}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary)',
                    borderRadius: '10px',
                    color: 'var(--primary)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Navigation size={14} className={isDetecting ? 'spin' : ''} />
                  <span>{isDetecting ? 'Detecting GPS...' : 'Detect My Location (GPS)'}</span>
                </button>

                {/* Popular Cities Header */}
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Popular Cities
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {popularCities.map((c) => (
                    <div
                      key={c.name}
                      onClick={() => {
                        setManualLocation(c.name, {
                          latitude: c.latitude,
                          longitude: c.longitude,
                          city: c.name,
                          address: c.defaultAddress,
                        });
                        setShowLocationMenu(false);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: currentCity === c.name ? 750 : 500,
                        color: currentCity === c.name ? 'var(--primary)' : 'var(--text-main)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: currentCity === c.name ? 'var(--primary-light)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{c.name}</span>
                      {currentCity === c.name && <Check size={14} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth Action Buttons */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {user.role === 'admin' && <Shield size={12} />}
                {user.role === 'professional' && <Briefcase size={12} />}
                {user.role === 'customer' && <User size={12} />}
                {user.role}
              </span>

              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '9999px', padding: '0.4rem 0.85rem' }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  padding: '0.55rem 1.35rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: 650,
                  fontSize: '0.9rem',
                  background: 'var(--bg-card)',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  textDecoration: 'none',
                  padding: '0.55rem 1.45rem',
                  borderRadius: '9999px',
                  fontWeight: 750,
                  fontSize: '0.9rem',
                  display: 'inline-block',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Wrapper */}
        <div className="nav-mobile-toggle-wrapper">
          {/* Mobile City Indicator */}
          <div
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '999px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.785rem',
              fontWeight: 750,
              cursor: 'pointer',
            }}
          >
            <MapPin size={13} />
            <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentCity}
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {/* Theme Mode Selector in Mobile Drawer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: '12px', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>Appearance</span>
            <ThemeToggle variant="segmented" size="sm" />
          </div>

          {/* Location Bar with GPS Button */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Your Location
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="var(--primary)" />
                  <span>{currentCity}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await detectLocation(false);
                }}
                disabled={isDetecting}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  borderRadius: '999px',
                  color: 'var(--primary)',
                  fontSize: '0.785rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Navigation size={13} className={isDetecting ? 'spin' : ''} />
                <span>{isDetecting ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>

            {/* Quick City Switcher Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              {popularCities.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setManualLocation(c.name, {
                      latitude: c.latitude,
                      longitude: c.longitude,
                      city: c.name,
                      address: c.defaultAddress,
                    });
                  }}
                  style={{
                    background: currentCity === c.name ? 'var(--primary)' : 'var(--bg-card)',
                    color: currentCity === c.name ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid',
                    borderColor: currentCity === c.name ? 'var(--primary)' : 'var(--border)',
                    borderRadius: '999px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: location.pathname === '/' ? 800 : 650,
                color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)',
                background: location.pathname === '/' ? 'var(--primary-light)' : 'transparent',
                fontSize: '0.95rem',
              }}
            >
              <span>Home</span>
            </Link>

            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: location.pathname.startsWith('/services') ? 800 : 650,
                color: location.pathname.startsWith('/services') ? 'var(--primary)' : 'var(--text-main)',
                background: location.pathname.startsWith('/services') ? 'var(--primary-light)' : 'transparent',
                fontSize: '0.95rem',
              }}
            >
              <span>Services (Map &amp; Specialists)</span>
            </Link>

            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 650,
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
            >
              How It Works
            </a>

            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 650,
                color: 'var(--text-main)',
                fontSize: '0.95rem',
              }}
            >
              About
            </a>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  fontSize: '0.95rem',
                }}
              >
                <Layers size={17} /> Dashboard
              </Link>
            )}
          </div>

          {/* Auth Action Buttons */}
          <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</strong>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '999px', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '0.65rem 1rem',
                    borderRadius: '999px',
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    background: 'var(--bg-card)',
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '0.65rem 1rem',
                    borderRadius: '999px',
                    fontWeight: 750,
                    fontSize: '0.9rem',
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
