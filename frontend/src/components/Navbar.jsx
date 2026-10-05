import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, ChevronDown, User, LogOut, Shield, Briefcase, Layers, Navigation, Search, Check } from 'lucide-react';

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
  const [citySearchInput, setCitySearchInput] = useState('');

  const handleLogout = async () => {
    await logout();
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

  const handleSelectCity = (city) => {
    setCurrentCity(city);
    setShowLocationMenu(false);
  };

  return (
    <nav className="navbar" style={{ background: '#ffffff', borderBottom: '1px solid #eef2f6', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        {/* Brand Logo - EXACT FIXORA / FIXIGO CIRCULAR PIN STYLE */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <MapPin size={22} color="#ffffff" fill="#ffffff" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Fixigo
          </span>
        </Link>

        {/* Center Navigation Links with Underline Indicator */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
          <li>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: location.pathname === '/' ? 700 : 600,
                color: location.pathname === '/' ? '#2563eb' : '#475569',
                paddingBottom: '6px',
                borderBottom: location.pathname === '/' ? '2.5px solid #2563eb' : '2.5px solid transparent',
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
                fontWeight: location.pathname.startsWith('/services') ? 700 : 600,
                color: location.pathname.startsWith('/services') ? '#2563eb' : '#475569',
                paddingBottom: '6px',
                borderBottom: location.pathname.startsWith('/services') ? '2.5px solid #2563eb' : '2.5px solid transparent',
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
                color: '#475569',
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
                color: '#475569',
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
                  fontWeight: 700,
                  color: '#2563eb',
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

        {/* Right Actions: Location Dropdown + Login & Sign Up Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
              <div style={{ color: '#2563eb', display: 'flex' }}>
                <MapPin size={20} />
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <span style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>
                  Current Location
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {currentCity}
                  <ChevronDown size={14} color="#64748b" />
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
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  padding: '0.85rem',
                  zIndex: 200,
                }}
              >
                {/* Current Active Location Info */}
                <div style={{ paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Location
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <MapPin size={14} color="#2563eb" />
                    <span>{currentCity}</span>
                  </div>
                  {userLocation?.address && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    color: '#1d4ed8',
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
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
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
                        fontWeight: currentCity === c.name ? 700 : 500,
                        color: currentCity === c.name ? '#2563eb' : '#334155',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: currentCity === c.name ? '#eff6ff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{c.name}</span>
                      {currentCity === c.name && <Check size={14} color="#2563eb" />}
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

              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  padding: '0.55rem 1.4rem',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: 'white',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  padding: '0.55rem 1.5rem',
                  borderRadius: '9999px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.15s ease',
                  display: 'inline-block',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
