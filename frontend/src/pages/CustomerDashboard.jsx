import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingsAPI, paymentsAPI } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
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
  FileText,
  Download,
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
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleViewInvoice = async (bookingId) => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        setSelectedInvoice(res.data.data);
      } else {
        alert('Invoice not yet available for this booking');
      }
    } catch (err) {
      alert('Invoice not available');
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        downloadInvoicePDF(res.data.data);
      } else {
        alert('Invoice not yet available for this booking');
      }
    } catch (err) {
      alert('Invoice not available');
    }
  };

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
              <span className="badge badge-customer">Getix Customer</span>
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

        {/* How Getix Works in 3 Easy Steps Guide */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <Sparkles size={16} /> How Getix Works For You
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.35rem' }}>
            Get Trusted Local Help at Your Doorstep in 3 Simple Steps
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Designed for everyday convenience. Clear pricing, verified experts, and real-time live map tracking.
          </p>

          <div className="grid-3" style={{ gap: '1rem' }}>
            <div style={{ background: 'white', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dbeafe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                1
              </div>
              <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                Pick Your Service
              </strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Tap Plumber, Electrician, AC Repair or Carpenter to instantly view verified experts nearby.
              </p>
            </div>

            <div style={{ background: 'white', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                2
              </div>
              <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                Clear Visiting Fee (₹99)
              </strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                No hidden costs. Transparent doorstep inspection fee from ₹99 + standard labor rates.
              </p>
            </div>

            <div style={{ background: 'white', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                3
              </div>
              <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                Live GPS Tracking
              </strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Once accepted, track the professional riding straight to your door with live GPS map updates!
              </p>
            </div>
          </div>
        </div>

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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Getix Member</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ClipboardList size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Service Requests</h3>
              </div>
              <span className="badge badge-customer">{bookings.length} Requests</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', maxHeight: '440px', overflowY: 'auto' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--secondary)' }}>{b.service_name}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Specialist: <strong>{b.professional_name}</strong>
                        </div>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* Visiting Charge & Price Summary */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', margin: '0.6rem 0', fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>🛵 Visiting Fee:</span>
                        <strong style={{ color: '#16a34a', fontWeight: 700 }}>₹{b.visiting_charge || 99}</strong>
                      </div>
                      <div style={{ color: '#cbd5e1' }}>•</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Labor Rate:</span>
                        <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{b.price}/hr</strong>
                      </div>
                      {b.distance_km && (
                        <>
                          <div style={{ color: '#cbd5e1' }}>•</div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            📍 {b.distance_km} km away
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div><strong>Address:</strong> {b.customer_address}</div>
                      <div><strong>Requested:</strong> {new Date(b.created_at).toLocaleString()}</div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/track/${b.id}`)}
                        className="btn btn-sm"
                        style={{
                          background: b.status === 'rejected' || b.status === 'cancelled' ? '#f1f5f9' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: b.status === 'rejected' || b.status === 'cancelled' ? '#64748b' : '#ffffff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        🛵 Track Live Map
                      </button>

                      {['payment_completed', 'completed', 'reviewed'].includes(b.status) && (
                        <>
                          <button
                            onClick={() => handleViewInvoice(b.id)}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <FileText size={14} /> View Invoice
                          </button>

                          <button
                            onClick={() => handleDownloadInvoice(b.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Download PDF"
                          >
                            <Download size={14} /> PDF
                          </button>
                        </>
                      )}

                      {b.professional_phone && b.status !== 'pending' && (
                        <a
                          href={`tel:${b.professional_phone}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem', textDecoration: 'none' }}
                        >
                          <Phone size={13} /> Call Specialist
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal for Customer */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
