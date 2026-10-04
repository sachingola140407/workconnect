import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingsAPI } from '../services/api';
import {
  Briefcase,
  Star,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  ShieldCheck,
  Edit2,
  Save,
  AlertCircle,
  ClipboardList,
  Navigation,
  Check,
  X,
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user, updateUser } = useAuth();
  const pro = user?.professional || {};

  const [isAvailable, setIsAvailable] = useState(pro.isAvailable ?? true);
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [bio, setBio] = useState(pro.bio || '');
  const [experience, setExperience] = useState(pro.experience || 0);
  const [price, setPrice] = useState(pro.price || 0);
  const [address, setAddress] = useState(pro.address || '');

  // Bookings / Service Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.professional) {
      setIsAvailable(user.professional.isAvailable ?? true);
      setBio(user.professional.bio || '');
      setExperience(user.professional.experience || 0);
      setPrice(user.professional.price || 0);
      setAddress(user.professional.address || '');
    }
  }, [user]);

  // Load incoming jobs
  const fetchJobs = async () => {
    try {
      const res = await bookingsAPI.getMyBookings();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load professional jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle live availability toggle
  const handleToggleAvailability = async () => {
    setIsUpdatingAvail(true);
    setError(null);
    setMessage(null);

    const newStatus = !isAvailable;
    try {
      await userAPI.toggleAvailability(newStatus);
      setIsAvailable(newStatus);
      updateUser({
        professional: {
          ...user.professional,
          isAvailable: newStatus,
        },
      });
      setMessage(`Status updated: You are now ${newStatus ? 'ONLINE & AVAILABLE' : 'OFFLINE / BUSY'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability status');
    } finally {
      setIsUpdatingAvail(false);
    }
  };

  // Handle saving professional profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await userAPI.updateProfessionalProfile({
        bio,
        experience,
        price,
        address,
      });

      updateUser({
        professional: {
          ...user.professional,
          ...res.data.data,
        },
      });
      setIsEditing(false);
      setMessage('Professional profile updated successfully on Fixigo!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update professional profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Update job lifecycle status
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      setMessage(`Job status updated to: ${newStatus.toUpperCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Fixigo Partner Dashboard
              </h1>
              <span className="badge badge-professional">Fixigo Specialist</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage service inquiries, toggle real-time availability, and update your profile rates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={15} />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
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

        {/* Real-time Status Banner */}
        <div className="card" style={{ marginBottom: '1.75rem', background: isAvailable ? '#f0fdf4' : '#fef2f2', borderColor: isAvailable ? '#bbf7d0' : '#fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: isAvailable ? 'var(--success)' : 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isAvailable ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: isAvailable ? '#15803d' : '#b91c1c' }}>
                  Status: {isAvailable ? 'Available for Customer Jobs' : 'Currently Unavailable / Busy'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isAvailable
                    ? 'Customers searching in your neighborhood can view and book your services.'
                    : 'Your profile is temporarily hidden from nearby customer search results.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAvailability}
              disabled={isUpdatingAvail}
              className={`btn ${isAvailable ? 'btn-danger' : 'btn-success'}`}
            >
              {isAvailable ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
              {isUpdatingAvail ? 'Updating...' : isAvailable ? 'Go Offline / Busy' : 'Go Available Now'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Verification Status
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              {pro.isVerified ? (
                <span className="badge badge-verified">
                  <ShieldCheck size={14} /> Verified Partner
                </span>
              ) : (
                <span className="badge badge-unverified">
                  Under Review
                </span>
              )}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Base Hourly Rate
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--primary)' }}>
              ₹{pro.price || 0}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Experience
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>
              {pro.experience || 0} Years
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Customer Rating
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
              <span>{parseFloat(pro.rating || 0).toFixed(1)}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({pro.reviewCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Incoming Service Jobs Section */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <ClipboardList size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Incoming Customer Service Requests
            </h3>
          </div>

          {loadingJobs ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              Loading service inquiries...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <p>No active service requests right now. Keep your status <strong>Available</strong> to receive nearby leads!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Address</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.customer_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.customer_phone || job.customer_email}</div>
                      </td>
                      <td>
                        <span className="badge badge-customer">{job.service_name}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{job.customer_address}</td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{job.notes || 'No extra notes'}</td>
                      <td>
                        <span className="badge badge-available">{job.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {job.status === 'pending' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'accepted')}
                              className="btn btn-sm btn-success"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'rejected')}
                              className="btn btn-sm btn-danger"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                        {job.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'on_the_way')}
                            className="btn btn-sm btn-primary"
                          >
                            On the Way &rarr;
                          </button>
                        )}
                        {job.status === 'on_the_way' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'arrived')}
                            className="btn btn-sm btn-primary"
                          >
                            Mark Arrived &rarr;
                          </button>
                        )}
                        {job.status === 'arrived' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'working')}
                            className="btn btn-sm btn-primary"
                          >
                            Start Working &rarr;
                          </button>
                        )}
                        {job.status === 'working' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'completed')}
                            className="btn btn-sm btn-success"
                          >
                            Complete Job &check;
                          </button>
                        )}
                        {job.status === 'completed' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>
                            Finished
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Profile Card & Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Professional Profile Information
          </h3>

          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Area / Operating Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Bio &amp; Service Summary</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Professional Bio
                </span>
                <p style={{ marginTop: '0.35rem', lineHeight: '1.6' }}>
                  {pro.bio || 'No professional bio provided yet. Click "Edit Profile" to add one.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Service Address / Area
                </span>
                <p style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" />
                  {pro.address || 'Address not configured'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
