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
  ChevronRight,
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
    { name: 'Plumber', category: 'Plumber', icon: <Wrench size={26} color="#2563eb" />, count: '2 verified pros nearby', desc: 'Pipe leakages, taps, drainage, water tank lines' },
    { name: 'Electrician', category: 'Electrician', icon: <Zap size={26} color="#f59e0b" />, count: '2 verified pros nearby', desc: 'Short circuits, wiring, switchboards, MCB repair' },
    { name: 'AC Repair', category: 'AC Repairer', icon: <Wind size={26} color="#06b6d4" />, count: '1 verified pro nearby', desc: 'Cooling service, gas refill, compressor, installation' },
    { name: 'Carpenter', category: 'Carpenter', icon: <Hammer size={26} color="#d97706" />, count: '1 verified pro nearby', desc: 'Furniture repairs, modular woodwork, door locks' },
    { name: 'Painter', category: 'Painter', icon: <Paintbrush size={26} color="#ec4899" />, count: '1 verified pro nearby', desc: 'Interior & exterior wall painting, waterproof primer' },
    { name: 'Deep Cleaning', category: 'Cleaner', icon: <Sparkles size={26} color="#10b981" />, count: '1 verified pro nearby', desc: 'Bathroom sanitation, kitchen deep clean, sofa wash' },
  ];

  const handleServiceClick = (category) => {
    navigate(`/services?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Award size={16} /> 100% Free &amp; Open-Source Local Matching
          </div>
          <h1 className="hero-title">
            Connect with Trusted Local Experts <br />
            <span className="hero-highlight">Instantly on Fixigo</span>
          </h1>
          <p className="hero-subtitle">
            Fixigo connects customers with nearby plumbers, electricians, AC mechanics, carpenters, and technicians using real-time PostGIS location matching &mdash; with zero paid APIs.
          </p>

          <div className="hero-actions">
            <Link to="/services" className="btn btn-primary btn-lg">
              Find Services Now <ArrowRight size={18} />
            </Link>

            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'professional' ? '/professional' : '/customer'}
                className="btn btn-secondary btn-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register?role=professional" className="btn btn-secondary btn-lg">
                Join as a Fixigo Partner
              </Link>
            )}
          </div>

          {/* Quick Demo Login Banner */}
          <div className="demo-box" style={{ maxWidth: '780px', margin: '2.5rem auto 0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '0.4rem' }}>
              ⚡ Instant Demo Logins (Click to try Fixigo)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any account below to instantly log in and experience Fixigo's role-based platform:
            </p>
            <div className="demo-buttons">
              <button
                onClick={() => handleQuickLogin('customer@fixigo.com', 'customer')}
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
                onClick={() => handleQuickLogin('rajesh.plumber@fixigo.com', 'professional')}
                className="btn btn-secondary btn-sm"
              >
                🔧 Plumber Demo (Rajesh)
              </button>
              <button
                onClick={() => handleQuickLogin('admin@fixigo.com', 'admin')}
                className="btn btn-secondary btn-sm"
              >
                🛡️ Platform Admin Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Preview - CLICKABLE */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Click Any Service to View Nearby Specialists
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Popular Home &amp; Professional Services
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Click on a card below to discover available plumbers, electricians, AC repairers, and more
            </p>
          </div>

          <div className="grid-3">
            {services.map((svc, i) => (
              <div
                key={i}
                onClick={() => handleServiceClick(svc.category)}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border)',
                  transition: 'all 0.2s ease',
                  padding: '1.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ padding: '0.85rem', background: '#eff6ff', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {svc.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: '#dbeafe', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                    {svc.count}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    {svc.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    {svc.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <span>View Nearby {svc.name}s</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/services" className="btn btn-secondary btn-lg">
              Explore All Categories &amp; Search Nearby Specialists <ArrowRight size={18} />
            </Link>
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
              Fixigo provides dedicated interfaces and security controls for each platform participant
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
                  <CheckCircle size={16} color="var(--success)" /> Instant service booking requests
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
    </div>
  );
}
