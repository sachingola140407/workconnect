import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Zap,
  Wrench,
  Wind,
  Car,
  Paintbrush,
  Hammer,
  Cpu,
  Sparkles,
  Timer,
  ChevronRight,
  ArrowRight,
  Layers,
  Smartphone,
  Download,
} from 'lucide-react';
import MobileStatusBar from '../components/MobileStatusBar';
import CustomerHeader from '../components/CustomerHeader';
import CustomerBottomNav from '../components/CustomerBottomNav';
import SabFixSplash from '../components/SabFixSplash';
import AllServicesModal from '../components/AllServicesModal';
import { useLocationContext } from '../context/LocationContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentCity } = useLocationContext();

  const isCapacitor =
    typeof window !== 'undefined' &&
    (window.Capacitor !== undefined || window.location.protocol === 'capacitor:');

  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen only once per session or if requested
    return !sessionStorage.getItem('sabfix_splash_shown');
  });
  const [showAllServices, setShowAllServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSplashDismiss = () => {
    setShowSplash(false);
    sessionStorage.setItem('sabfix_splash_shown', 'true');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleSelectServiceCategory = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  // 8 Quick Service Icons (Reference Image 1 Screen 2)
  const quickServices = [
    { name: 'Electrician', category: 'Electrician', icon: Zap, iconColor: '#ff6a00', bg: '#fff4ea' },
    { name: 'Plumber', category: 'Plumber', icon: Wrench, iconColor: '#0284c7', bg: '#e0f2fe' },
    { name: 'AC Repair', category: 'AC Repairer', icon: Wind, iconColor: '#0891b2', bg: '#ecfeff' },
    { name: 'Car Mechanic', category: 'Mechanic', icon: Car, iconColor: '#ef4444', bg: '#fef2f2' },
    { name: 'Painter', category: 'Painter', icon: Paintbrush, iconColor: '#9333ea', bg: '#faf5ff' },
    { name: 'Carpenter', category: 'Carpenter', icon: Hammer, iconColor: '#d97706', bg: '#fef3c7' },
    { name: 'Appliance Repair', category: 'Appliance Repairer', icon: Cpu, iconColor: '#10b981', bg: '#ecfdf5' },
    { name: 'Cleaning', category: 'Cleaner', icon: Sparkles, iconColor: '#eab308', bg: '#fefce8' },
  ];

  return (
    <>
      {showSplash && <SabFixSplash onDismiss={handleSplashDismiss} />}

      <div className="sabfix-app-wrapper">
        <div className="sabfix-mobile-shell">
          {/* Top Mobile Status Bar */}
          <MobileStatusBar />

          {/* Customer Header (Location, Theme Toggle, Avatar, SabFix Logo, Bell) */}
          <CustomerHeader />

          {/* Main Content Area */}
          <div style={{ padding: '0.75rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ==================== HERO PROMOTIONAL BANNER ==================== */}
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #fff2e4 0%, #ffe3cb 100%)',
                borderRadius: '22px',
                padding: '1.25rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                overflow: 'hidden',
                boxShadow: '0 6px 18px rgba(255, 106, 0, 0.08)',
                border: '1px solid #ffd7b5',
              }}
            >
              {/* Left Text Block */}
              <div style={{ flex: 1, zIndex: 2, paddingRight: '0.5rem' }}>
                <h1
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    lineHeight: 1.2,
                    color: '#0b1320',
                    margin: '0 0 0.35rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Get Home Services in{' '}
                  <span style={{ color: '#ff6a00' }}>Minutes!</span>
                </h1>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#475569',
                    margin: 0,
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  Verified professionals at your doorstep.
                </p>
              </div>

              {/* Right Architectural House Graphic */}
              <div
                style={{
                  width: '115px',
                  height: '95px',
                  flexShrink: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Modern Villa Vector Card */}
                <svg
                  viewBox="0 0 140 110"
                  width="100%"
                  height="100%"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))' }}
                >
                  <defs>
                    <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f1ede6" />
                    </linearGradient>
                    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                  {/* Sky/ground background subtle */}
                  <ellipse cx="70" cy="100" rx="65" ry="8" fill="#16a34a" opacity="0.3" />
                  {/* Main house building */}
                  <rect x="25" y="35" width="90" height="65" rx="6" fill="url(#wallGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                  {/* Wood accent facade */}
                  <rect x="25" y="35" width="35" height="65" rx="4" fill="url(#woodGrad)" />
                  {/* Top terrace cantilever */}
                  <rect x="55" y="22" width="65" height="28" rx="4" fill="url(#wallGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                  {/* Large modern glass window pane */}
                  <rect x="65" y="27" width="48" height="18" rx="2" fill="url(#glassGrad)" opacity="0.85" />
                  <line x1="89" y1="27" x2="89" y2="45" stroke="#ffffff" strokeWidth="1.2" />
                  {/* Lower window & entrance */}
                  <rect x="70" y="55" width="38" height="35" rx="3" fill="url(#glassGrad)" opacity="0.8" />
                  <line x1="89" y1="55" x2="89" y2="90" stroke="#ffffff" strokeWidth="1.2" />
                  {/* Modern front door */}
                  <rect x="35" y="58" width="16" height="42" rx="2" fill="#1e293b" />
                  <circle cx="48" cy="78" r="1.5" fill="#f59e0b" />
                  {/* Green bushes around house */}
                  <circle cx="18" cy="94" r="9" fill="#15803d" />
                  <circle cx="26" cy="96" r="7" fill="#16a34a" />
                  <circle cx="118" cy="95" r="8" fill="#16a34a" />
                  <circle cx="126" cy="96" r="6" fill="#22c55e" />
                </svg>
              </div>
            </div>

            {/* ==================== SEARCH BAR ==================== */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '10px 14px',
                border: '1px solid #eae5dd',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Search size={19} color="var(--text-light)" />
              <input
                type="text"
                placeholder='Search "electrician, plumber..."'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                }}
              />
              <button
                type="button"
                onClick={() => setShowAllServices(true)}
                title="View All Services"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SlidersHorizontal size={18} />
              </button>
            </form>

            {/* ==================== QUICK SERVICES 8-GRID ==================== */}
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px 8px',
                }}
              >
                {quickServices.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectServiceCategory(item.name)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 0',
                      }}
                    >
                      {/* Pastel Rounded Square Tile */}
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '18px',
                          backgroundColor: item.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.04)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <IconComp size={25} color={item.iconColor} strokeWidth={2.2} />
                      </div>

                      {/* Service Title */}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          textAlign: 'center',
                          lineHeight: 1.15,
                        }}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View All Services pill button */}
              <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAllServices(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6a00',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Layers size={14} />
                  <span>View All 15 Services &rarr;</span>
                </button>
              </div>
            </div>

            {/* ==================== EXPRESS SERVICE CARD ==================== */}
            <div
              onClick={() => handleSelectServiceCategory('Electrician')}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '14px 16px',
                border: '1px solid #eae5dd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#fff4ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff6a00',
                  }}
                >
                  <Timer size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      margin: '0 0 2px',
                    }}
                  >
                    Express Service
                  </h3>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    Get a professional at home in <span style={{ color: '#ff6a00', fontWeight: 800 }}>5, 10 or 15 minutes</span>
                  </p>
                </div>
              </div>

              <ChevronRight size={18} color="var(--text-light)" />
            </div>

            {/* ==================== INSTALL APP PROMO CARD (Web Only) ==================== */}
            {!isCapacitor && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #0b1320 0%, #1e293b 100%)',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(11, 19, 32, 0.12)',
                  border: '1px solid rgba(255, 106, 0, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                      boxShadow: '0 3px 10px rgba(255, 106, 0, 0.35)',
                    }}
                  >
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                      Install SabFix App
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 500 }}>
                      Faster booking & live GPS tracking
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('sabfix:open-install-modal'))}
                  style={{
                    backgroundColor: '#ff6a00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(255, 106, 0, 0.35)',
                  }}
                >
                  <Download size={13} />
                  <span>Install</span>
                </button>
              </div>
            )}

            {/* ==================== RECENTLY BOOKED SECTION ==================== */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  Recently Booked
                </h3>

                <button
                  type="button"
                  onClick={() => navigate('/customer?tab=orders')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6a00',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>See All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Recently Booked Card (Matching Reference Image 1 Screen 2) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '12px 14px',
                  border: '1px solid #eae5dd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Thumbnail AC unit */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#ecfeff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0891b2',
                    }}
                  >
                    <Wind size={24} />
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block' }}>
                      AC Service
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ₹499 &bull; 12 days ago
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectServiceCategory('AC Repairer')}
                  style={{
                    backgroundColor: '#ff6a00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(255, 106, 0, 0.25)',
                  }}
                >
                  Book Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Services Modal (Screen 3 in Reference Image 1) */}
      <AllServicesModal
        isOpen={showAllServices}
        onClose={() => setShowAllServices(false)}
        onSelectService={(service) => {
          navigate(`/services?category=${encodeURIComponent(service.name)}`);
        }}
      />
    </>
  );
}
