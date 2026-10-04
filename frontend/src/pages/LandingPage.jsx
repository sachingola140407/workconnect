import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  MapPin,
  ShieldCheck,
  Clock,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, role) => {
    try {
      await login(email, 'Password@123');
      if (role === 'admin') navigate('/admin');
      else if (role === 'professional') navigate('/professional');
      else navigate('/customer');
    } catch (err) {
      console.error('Quick login error:', err);
    }
  };

  const services = [
    { name: 'Electrician', icon: <Zap size={24} color="#f59e0b" />, count: '7 nearby' },
    { name: 'Plumber', icon: <Wrench size={24} color="#2563eb" />, count: '5 nearby' },
    { name: 'AC Repair', icon: <Wind size={24} color="#06b6d4" />, count: '4 nearby' },
    { name: 'Carpenter', icon: <Hammer size={24} color="#d97706" />, count: '6 nearby' },
    { name: 'Painter', icon: <Paintbrush size={24} color="#ec4899" />, count: '3 nearby' },
    { name: 'Deep Cleaning', icon: <Sparkles size={24} color="#10b981" />, count: '8 nearby' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Award size={16} /> 100% Free &amp; Open-Source Location Matching
          </div>
          <h1 className="hero-title">
            Connect with Skilled Local Experts <br />
            <span className="hero-highlight">Instantly in Your Neighborhood</span>
          </h1>
          <p className="hero-subtitle">
            WorkConnect matches you with verified electricians, plumbers, carpenters, and technicians using high-precision PostGIS spatial technology &mdash; completely free with zero paid APIs.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'professional' ? '/professional' : '/customer'}
                className="btn btn-primary btn-lg"
              >
                Go to Your {user?.role?.toUpperCase()} Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register?role=customer" className="btn btn-primary btn-lg">
                  Hire a Professional <ArrowRight size={18} />
                </Link>
                <Link to="/register?role=professional" className="btn btn-secondary btn-lg">
                  Join as a Service Partner
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Login Banner */}
          <div className="demo-box" style={{ maxWidth: '780px', margin: '2.5rem auto 0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '0.4rem' }}>
              ⚡ Instant Demo Credentials (Phase 1 Ready)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any role below to instantly log in and experience WorkConnect's role-based platform:
            </p>
            <div className="demo-buttons">
              <button
                onClick={() => handleQuickLogin('customer@workconnect.com', 'customer')}
                className="btn btn-secondary btn-sm"
              >
                👤 Customer Demo (Arun)
              </button>
              <button
                onClick={() => handleQuickLogin('rahul.electrician@workconnect.com', 'professional')}
                className="btn btn-secondary btn-sm"
              >
                ⚡ Electrician Demo (Rahul)
              </button>
              <button
                onClick={() => handleQuickLogin('admin@workconnect.com', 'admin')}
                className="btn btn-secondary btn-sm"
              >
                🛡️ Platform Admin Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Preview */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Popular Home &amp; Professional Services
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Discover trusted specialists ready to serve in your locality
            </p>
          </div>

          <div className="grid-3">
            {services.map((svc, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {svc.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{svc.name}</h3>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{svc.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Tailored Experiences for Three Core Roles
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              WorkConnect provides dedicated interfaces and security controls for each platform participant
            </p>
          </div>

          <div className="grid-3">
            {/* Customer Role */}
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-customer">Customer</span>
                <span style={{ fontWeight: 700 }}>Service Seeker</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Grant location access to instantly discover rated nearby professionals, compare prices, and request bookings.
              </p>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Browser geolocation detection
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> PostGIS radius matching &amp; ranking
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Interactive OpenStreetMap view
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Booking history &amp; reviews
                </li>
              </ul>
            </div>

            {/* Professional Role */}
            <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-professional">Professional</span>
                <span style={{ fontWeight: 700 }}>Service Partner</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Showcase skills, set base pricing, toggle real-time availability, and receive incoming local service requests.
              </p>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Professional profile &amp; verified badge
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> One-click live availability toggle
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Accept / reject service inquiries
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Track job lifecycle statuses
                </li>
              </ul>
            </div>

            {/* Admin Role */}
            <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-admin">Admin</span>
                <span style={{ fontWeight: 700 }}>Platform Moderator</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Oversee platform operations, audit users, verify professional credentials, and inspect system statistics.
              </p>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Platform user &amp; partner directory
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Verification workflow for professionals
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Account activation / deactivation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Aggregated system metrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section id="features" style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Engineered with 100% Open Technologies
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Zero proprietary dependencies or paid API keys required
            </p>
          </div>

          <div className="grid-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🗺️</div>
              <h4 style={{ fontWeight: 700 }}>PostGIS &amp; PostgreSQL</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Native spatial indexing &amp; distance calculations via ST_DWithin and ST_Distance.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📍</div>
              <h4 style={{ fontWeight: 700 }}>Leaflet &amp; OSM</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                OpenStreetMap tile layers and responsive Leaflet map controls with zero cost.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔐</div>
              <h4 style={{ fontWeight: 700 }}>JWT &amp; Bcrypt</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Hardened authentication with salted password hashes and role-based access control.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>⚡</div>
              <h4 style={{ fontWeight: 700 }}>React + Vite</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Lightning-fast single page application with modern components and state management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
