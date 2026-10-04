import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
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
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
              <span className="badge badge-customer">Customer</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage your personal details, discover nearby skilled professionals, and track your requests.
            </p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={15} />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
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

        <div className="grid-2">
          {/* Customer Profile Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Customer</span>
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

          {/* Quick Actions & Feature Preview */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              Next Step: Location &amp; Professional Search
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Phase 1 authentication and user database are active. Next in Phase 2 &amp; 3, you can allow browser location to view nearby verified service partners.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={20} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nearby Location Search</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PostGIS 5km search radius</div>
                </div>
                <span className="badge badge-unverified">Phase 3</span>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={20} color="var(--success)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instant Bookings</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send booking request to nearby pros</div>
                </div>
                <span className="badge badge-unverified">Phase 6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
