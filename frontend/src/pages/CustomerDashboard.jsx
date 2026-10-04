import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingsAPI } from '../services/api';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Save,
  AlertCircle,
  Search,
  Sparkles,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Car,
  Cpu,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const services = [
    { name: 'Plumber', category: 'Plumber', icon: <Wrench size={22} color="#2563eb" /> },
    { name: 'Electrician', category: 'Electrician', icon: <Zap size={22} color="#f59e0b" /> },
    { name: 'AC Repair', category: 'AC Repairer', icon: <Wind size={22} color="#06b6d4" /> },
    { name: 'Carpenter', category: 'Carpenter', icon: <Hammer size={22} color="#d97706" /> },
    { name: 'Painter', category: 'Painter', icon: <Paintbrush size={22} color="#ec4899" /> },
    { name: 'Cleaning', category: 'Cleaner', icon: <Sparkles size={22} color="#10b981" /> },
    { name: 'Mechanic', category: 'Mechanic', icon: <Car size={22} color="#ef4444" /> },
    { name: 'Appliances', category: 'Appliance Repairer', icon: <Cpu size={22} color="#6366f1" /> },
  ];

  // Fetch customer bookings
  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await bookingsAPI.getMyBookings();
        setBookings(res.data.data || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    }
    loadBookings();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await userAPI.updateProfile({ name, phone });
      updateUser(res.data.data);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceClick = (category) => {
    navigate(`/services?category=${encodeURIComponent(category)}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <span className="badge badge-verified">{status}</span>;
      case 'on_the_way':
      case 'working':
        return <span className="badge badge-customer">{status.replace('_', ' ')}</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="badge badge-unavailable">{status}</span>;
      default:
        return <span className="badge badge-admin">Pending</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Welcome back, {user?.name}!
              </h1>
              <span className="badge badge-customer">Fixigo Customer</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Book nearby plumbers, electricians, and technicians or track your active service requests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/services')}
              className="btn btn-primary btn-sm"
            >
              <Search size={15} /> Find Services
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={15} />
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {message && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <div>{message}</div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* Quick Service Booking Grid */}
        <div className="card" style={{ marginBottom: '2rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Need a Repair or Service? Select Below
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Click any service to view verified nearby professionals ready to help
              </p>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="btn btn-secondary btn-sm"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid-4" style={{ gap: '0.85rem' }}>
            {services.map((svc, i) => (
              <div
                key={i}
                onClick={() => handleServiceClick(svc.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', boxShadow: 'var(--shadow-sm)' }}>
                  {svc.icon}
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{svc.name}</strong>
                  <span style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600 }}>Find Pros &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile and Booking History Row */}
        <div className="grid-2">
          {/* Customer Profile Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fixigo Member</span>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--primary)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Email</span>
                    <strong>{user?.email}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--success)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Phone</span>
                    <strong>{user?.phone || 'Not provided'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color="var(--warning)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Member Since</span>
                    <strong>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Service Requests / Bookings History */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <ClipboardList size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Service Requests</h3>
            </div>

            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Loading service requests...
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.925rem', marginBottom: '1rem' }}>
                  You have not submitted any service requests yet.
                </p>
                <button
                  onClick={() => navigate('/services')}
                  className="btn btn-primary btn-sm"
                >
                  Book a Specialist Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{b.service_name}</strong>
                      {getStatusBadge(b.status)}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div>Partner: <strong>{b.professional_name}</strong> (&phone; {b.professional_phone || 'Available after accept'})</div>
                      <div>Address: {b.customer_address}</div>
                      <div>Requested: {new Date(b.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
