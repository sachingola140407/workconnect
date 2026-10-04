import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Laptop,
  LayoutGrid,
  ShieldCheck,
  Tag,
  Star,
  Clock,
  ArrowRight,
  ChevronRight,
  List,
  Users,
  CheckCircle,
  Navigation,
  Search,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [searchLocation, setSearchLocation] = useState('Delhi NCR');
  const [selectedService, setSelectedService] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    let url = '/services';
    const params = new URLSearchParams();
    if (selectedService && selectedService !== 'all') {
      params.append('category', selectedService);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    navigate(url);
  };

  const handleCategoryClick = (category) => {
    if (category === 'all') {
      navigate('/services');
    } else {
      navigate(`/services?category=${encodeURIComponent(category)}`);
    }
  };

  // 9 Pastel Categories matching the image
  const categories = [
    {
      name: 'Plumbing',
      category: 'Plumber',
      bg: '#e0f2fe',
      border: '#bae6fd',
      iconColor: '#0284c7',
      icon: <Wrench size={26} color="#0284c7" />,
    },
    {
      name: 'Electrician',
      category: 'Electrician',
      bg: '#fef3c7',
      border: '#fde68a',
      iconColor: '#d97706',
      icon: <Zap size={26} color="#d97706" />,
    },
    {
      name: 'AC Repair',
      category: 'AC Repairer',
      bg: '#ecfeff',
      border: '#cffafe',
      iconColor: '#0891b2',
      icon: <Wind size={26} color="#0891b2" />,
    },
    {
      name: 'Carpenter',
      category: 'Carpenter',
      bg: '#fee2e2',
      border: '#fecaca',
      iconColor: '#dc2626',
      icon: <Hammer size={26} color="#dc2626" />,
    },
    {
      name: 'Painter',
      category: 'Painter',
      bg: '#faf5ff',
      border: '#f3e8ff',
      iconColor: '#9333ea',
      icon: <Paintbrush size={26} color="#9333ea" />,
    },
    {
      name: 'Cleaner',
      category: 'Cleaner',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      iconColor: '#16a34a',
      icon: <Sparkles size={26} color="#16a34a" />,
    },
    {
      name: 'Mechanic',
      category: 'Mechanic',
      bg: '#fff1f2',
      border: '#ffe4e6',
      iconColor: '#e11d48',
      icon: <Car size={26} color="#e11d48" />,
    },
    {
      name: 'Computer Repair',
      category: 'Appliance Repairer',
      bg: '#f5f3ff',
      border: '#ede9fe',
      iconColor: '#4f46e5',
      icon: <Laptop size={26} color="#4f46e5" />,
    },
    {
      name: 'More',
      category: 'all',
      bg: '#f8fafc',
      border: '#e2e8f0',
      iconColor: '#64748b',
      icon: <LayoutGrid size={26} color="#64748b" />,
    },
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ===================== HERO SECTION ===================== */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          padding: '3rem 0 3.5rem',
          position: 'relative',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
              alignItems: 'center',
              gap: '2.5rem',
            }}
          >
            {/* Left Column: Headlines, Search Pill & Trust Badges */}
            <div>
              {/* Pill Badge with Green Dot */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                  }}
                />
                Trusted Professionals &bull; Verified &amp; Rated
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: '3.4rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: '1.12',
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                Find Skilled Professionals <br />
                <span style={{ color: '#2563eb' }}>Near You, Instantly</span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '1.1rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  marginBottom: '2rem',
                }}
              >
                From plumbing to AC repair, electricians to cleaners &mdash; get trusted professionals for all your home and business needs, right at your doorstep.
              </p>

              {/* Floating Search / Booking Capsule Card */}
              <form
                onSubmit={handleSearch}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '22px',
                  boxShadow: '0 12px 35px -5px rgba(15, 23, 42, 0.08)',
                  padding: '0.65rem 0.85rem 0.65rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  maxWidth: '630px',
                }}
              >
                {/* Location Input */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <MapPin size={22} color="#2563eb" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>
                      Enter your location
                    </span>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Delhi NCR, Connaught Place..."
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.925rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        padding: 0,
                        background: 'transparent',
                      }}
                    />
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

                {/* Service Select */}
                <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Wrench size={22} color="#2563eb" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8', fontWeight: 600 }}>
                      Select service
                    </span>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.925rem',
                        fontWeight: 700,
                        color: selectedService ? '#0f172a' : '#64748b',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">e.g. Plumber, Electrician...</option>
                      <option value="Plumber">Plumber (From ₹99 Visiting)</option>
                      <option value="Electrician">Electrician (From ₹99 Visiting)</option>
                      <option value="AC Repairer">AC Repairer</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Painter">Painter</option>
                      <option value="Cleaner">Deep Cleaning</option>
                      <option value="Mechanic">Mechanic</option>
                      <option value="Appliance Repairer">Appliance Repair</option>
                    </select>
                  </div>
                </div>

                {/* Submit Find Professionals Button */}
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '0.85rem 1.6rem',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <Search size={18} /> Find Professionals
                </button>
              </form>

              {/* 4 Trust Feature Badges below search bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  marginTop: '1.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={18} color="#16a34a" />
                  <span>Verified Professionals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Tag size={17} color="#2563eb" />
                  <span>Affordable Rates (Visiting ₹99)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Star size={17} color="#f59e0b" fill="#f59e0b" />
                  <span>Real Reviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Zap size={17} color="#0284c7" fill="#0284c7" />
                  <span>Quick Booking</span>
                </div>
              </div>

              {/* Live Availability & Popular Search Badges */}
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '1.75rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1rem 1.25rem',
                  maxWidth: '630px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', fontWeight: 750, color: '#15803d' }}>
                    <span
                      className="animate-pulse-green"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#16a34a',
                        display: 'inline-block',
                      }}
                    />
                    Specialists Online Now in {searchLocation}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    ⚡ Instant Booking
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: '🔧 Plumbers', cat: 'Plumbing' },
                    { label: '⚡ Electricians', cat: 'Electrical' },
                    { label: '❄️ AC Repair', cat: 'Appliances' },
                    { label: '🔨 Carpenters', cat: 'Carpentry' },
                    { label: '🎨 Painters', cat: 'Painting' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCategoryClick(p.cat)}
                      className="btn btn-secondary btn-sm interactive-pill"
                      style={{
                        fontSize: '0.8rem',
                        borderRadius: '9999px',
                        padding: '0.35rem 0.85rem',
                        fontWeight: 650,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic with Floating Animated Badges */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="/hero-technician.png"
                alt="Fixigo Verified Professionals and Map Tracking"
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 20px 35px rgba(15, 23, 42, 0.1))',
                }}
              />

              {/* Floating Top Badge */}
              <div
                className="animate-float glass-card"
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '10px',
                  padding: '0.65rem 1rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: 750,
                  color: '#0f172a',
                  zIndex: 2,
                }}
              >
                <div style={{ background: '#fef3c7', padding: '0.3rem', borderRadius: '8px', display: 'flex' }}>
                  <Star size={16} color="#d97706" fill="#d97706" />
                </div>
                <div>
                  <div>4.9 / 5 Rating</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>12,500+ Homes Served</div>
                </div>
              </div>

              {/* Floating Bottom Badge */}
              <div
                className="animate-float glass-card"
                style={{
                  position: 'absolute',
                  bottom: '25px',
                  right: '10px',
                  padding: '0.65rem 1rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: 750,
                  color: '#0f172a',
                  animationDelay: '1.5s',
                  zIndex: 2,
                }}
              >
                <div style={{ background: '#ecfdf5', padding: '0.35rem', borderRadius: '8px', display: 'flex' }}>
                  <Navigation size={16} color="#059669" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Live GPS Map</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Turn-by-turn Navigation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== POPULAR SERVICE CATEGORIES ===================== */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff' }}>
        <div className="container">
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}
              >
                OUR SERVICES
              </span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Popular Service Categories
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem', margin: 0 }}>
                Choose from a wide range of services and find the right professional near you.
              </p>
            </div>

            <Link
              to="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              View All Services <ArrowRight size={16} />
            </Link>
          </div>

          {/* 9 Pastel Category Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: '1rem',
            }}
          >
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.category)}
                style={{
                  background: cat.bg,
                  border: `1px solid ${cat.border}`,
                  borderRadius: '16px',
                  padding: '1.25rem 0.75rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.65)',
                  }}
                >
                  {cat.icon}
                </div>
                <strong style={{ fontSize: '0.925rem', color: '#0f172a', fontWeight: 700 }}>
                  {cat.name}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== DUAL FEATURE CARDS (WHY CHOOSE & HOW IT WORKS) ===================== */}
      <section style={{ padding: '1rem 0 3.5rem', background: '#ffffff' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.25fr)',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}
          >
            {/* Left Card: WHY CHOOSE FIXIGO */}
            <div
              style={{
                background: '#f0f7ff',
                border: '1.5px solid #dbeafe',
                borderRadius: '22px',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
              }}
            >
              {/* Mini Map Graphic */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src="/mini-map.png"
                  alt="Nearby Specialists GPS Map"
                  style={{
                    width: '170px',
                    height: 'auto',
                    borderRadius: '14px',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)',
                    display: 'block',
                  }}
                />
              </div>

              {/* Text Information */}
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#64748b',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  WHY CHOOSE FIXIGO
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Fast. Reliable. Local.
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  We make it easy to find trusted professionals near you, with real reviews, transparent pricing and secure payments.
                </p>

                <Link
                  to="/services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Learn More <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Card: HOW IT WORKS (4 Simple Steps) */}
            <div
              id="how-it-works"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '22px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                HOW IT WORKS
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' }}>
                Get Your Work Done in 4 Simple Steps
              </h3>

              {/* 4 Steps Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.85rem',
                  position: 'relative',
                }}
              >
                {/* Step 1 */}
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                    1. Share Your Location
                  </strong>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    Allow location access or enter your area.
                  </p>
                </div>

                {/* Step 2 */}
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <List size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                    2. Choose a Service
                  </strong>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    Select the service you need from our categories.
                  </p>
                </div>

                {/* Step 3 */}
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#f3e8ff',
                      color: '#9333ea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                    3. Find &amp; Connect
                  </strong>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    View nearby professionals, compare ratings and prices.
                  </p>
                </div>

                {/* Step 4 */}
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <CheckCircle size={18} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                    4. Get It Done
                  </strong>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    Book, track, pay and rate the professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LIVE GPS MAP HIGHLIGHT ===================== */}
      <section id="about" style={{ padding: '0 0 3.5rem', background: '#ffffff' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '24px',
              padding: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.75rem',
              boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ maxWidth: '620px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f59e0b',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  marginBottom: '0.85rem',
                }}
              >
                🛵 Real-Time OpenStreetMap Tracking
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: '#ffffff' }}>
                Track Your Specialist Live to Your Doorstep
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.975rem', lineHeight: 1.6, margin: 0 }}>
                Once your service request is accepted, watch the specialist navigate straight to your address on an interactive live map, with live arrival countdown and transparent visiting fees.
              </p>
            </div>

            <div>
              <Link
                to="/services"
                className="btn"
                style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  fontWeight: 800,
                  padding: '0.9rem 1.75rem',
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                Explore Fixigo Services <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BOTTOM SOCIAL PROOF TRUST BAR ===================== */}
      <footer
        style={{
          background: '#0f172a',
          color: '#ffffff',
          padding: '1.15rem 0',
          textAlign: 'center',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Trusted by 1000+ happy customers</span>
          <div style={{ display: 'inline-flex', gap: '0.15rem', color: '#f59e0b' }}>
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
          </div>
          <span style={{ color: '#94a3b8' }}>4.8/5 (from 5K+ reviews)</span>
        </div>
      </footer>
    </div>
  );
}
