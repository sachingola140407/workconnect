import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, paymentsAPI } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import {
  Shield,
  Users,
  Briefcase,
  UserCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Activity,
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  Eye,
  X,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Check,
  FileText,
  Download,
  CreditCard,
  Banknote,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('activity'); // 'activity', 'financials', 'users'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Financial Audit State
  const [financialData, setFinancialData] = useState(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Professional Activity State
  const [activityData, setActivityData] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [selectedProAudit, setSelectedProAudit] = useState(null);
  const [proJobHistory, setProJobHistory] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Fetch admin stats and user list
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ role: roleFilter || undefined, search: search || undefined }),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch professional activity metrics
  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await adminAPI.getProfessionalActivity();
      setActivityData(res.data.data);
    } catch (err) {
      console.error('Failed to load professional activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchFinancials = async () => {
    setLoadingFinancials(true);
    try {
      const res = await paymentsAPI.getAdminStats();
      setFinancialData(res.data.data);
    } catch (err) {
      console.error('Failed to load financial stats:', err);
    } finally {
      setLoadingFinancials(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchActivity();
    fetchFinancials();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Toggle user active status
  const handleToggleStatus = async (targetUser) => {
    setActionLoadingId(targetUser.id);
    setMessage(null);
    setError(null);

    const newStatus = !targetUser.is_active;
    try {
      await adminAPI.setUserStatus(targetUser.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
      setMessage(`Account ${targetUser.email} ${newStatus ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle professional verified badge
  const handleToggleVerify = async (pro) => {
    setActionLoadingId(pro.id);
    setMessage(null);
    setError(null);

    const newVerified = !pro.is_verified;
    try {
      await adminAPI.verifyProfessional(pro.id, newVerified);
      setActivityData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          professionals: prev.professionals.map((p) =>
            p.id === pro.id ? { ...p, is_verified: newVerified } : p
          ),
        };
      });
      setMessage(`Professional ${pro.name} verification status set to ${newVerified ? 'Verified' : 'Unverified'}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open detailed job audit modal
  const handleOpenProAudit = async (pro) => {
    setSelectedProAudit(pro);
    setLoadingJobs(true);
    setProJobHistory(null);

    try {
      const res = await adminAPI.getProfessionalJobHistory(pro.id);
      setProJobHistory(res.data.data);
    } catch (err) {
      console.error('Failed to load professional job history:', err);
    } finally {
      setLoadingJobs(false);
    }
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
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
                SabFix Admin Control Center
              </h1>
              <span className="badge badge-admin">
                <Shield size={12} /> System Admin
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Audit professional acceptance rates, inspect service requests, and manage partner accounts.
            </p>
          </div>

          <button
            onClick={() => {
              fetchData();
              fetchActivity();
            }}
            className="btn btn-secondary btn-sm"
            disabled={loading || loadingActivity}
          >
            <RefreshCw size={15} className={loading || loadingActivity ? 'animate-spin' : ''} />
            Refresh All Data
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

        {/* Global Platform Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Accounts
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                {stats?.total_users || 0}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Customers
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                {stats?.total_customers || 0}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Professionals
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                {stats?.total_professionals || 0}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Platform Acceptance
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a' }}>
                {activityData?.summary?.platform_acceptance_rate || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'activity' ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <Activity size={18} /> Professional Activity &amp; Request Audit
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <Users size={18} /> User &amp; Partner Accounts Directory
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'financials' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'financials' ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <DollarSign size={18} /> Platform Revenue, Fees &amp; Invoices
          </button>
        </div>

        {/* TAB 1: PROFESSIONAL ACTIVITY AUDIT */}
        {activeTab === 'activity' && (
          <div>
            {/* Activity Summary Sub-Cards */}
            {activityData?.summary && (
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Requests Received
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {activityData.summary.total_requests} Requests
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>
                    Requests Accepted
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                    {activityData.summary.total_accepted} ({activityData.summary.platform_acceptance_rate}%)
                  </div>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 750, textTransform: 'uppercase' }}>
                    Jobs Completed
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {activityData.summary.total_completed} ({activityData.summary.platform_completion_rate}%)
                  </div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Pro Earnings
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                    ₹{activityData.summary.total_platform_earnings.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Professionals Audit Table */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    Professional Request Acceptance &amp; Job Completion Audit
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Track request volume, acceptance percentage, completed services, and visiting charges.
                  </p>
                </div>
              </div>

              {loadingActivity ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Loading professional performance metrics...
                </div>
              ) : !activityData?.professionals?.length ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No professional activity data found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Professional</th>
                        <th>Services</th>
                        <th>Visiting Fee</th>
                        <th>Hourly Rate</th>
                        <th style={{ textAlign: 'center' }}>Total Requests</th>
                        <th style={{ textAlign: 'center' }}>Accepted</th>
                        <th style={{ textAlign: 'center' }}>Completed</th>
                        <th style={{ textAlign: 'center' }}>Rejected</th>
                        <th style={{ textAlign: 'right' }}>Earnings</th>
                        <th style={{ textAlign: 'right' }}>Audit Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.professionals.map((pro) => (
                        <tr key={pro.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                                {pro.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {pro.name}
                                  {pro.is_verified && (
                                    <ShieldCheck size={14} color="#16a34a" title="Verified SabFix Partner" />
                                  )}
                                </div>
                                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                                  {pro.phone || pro.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {pro.services?.map((s, idx) => (
                                <span key={idx} className="badge badge-customer" style={{ fontSize: '0.725rem' }}>
                                  {s}
                                </span>
                              )) || <span className="badge badge-customer">Service Partner</span>}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#16a34a', fontSize: '0.9rem' }}>
                              ₹{pro.visiting_charge || 99}
                            </strong>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                              ₹{pro.price}/hr
                            </strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                              {pro.total_requests}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontWeight: 800, color: '#15803d' }}>
                                {pro.accepted_requests}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.725rem',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '999px',
                                  fontWeight: 700,
                                  background: pro.acceptance_rate >= 75 ? '#dcfce7' : pro.acceptance_rate >= 50 ? '#fef3c7' : '#fee2e2',
                                  color: pro.acceptance_rate >= 75 ? '#166534' : pro.acceptance_rate >= 50 ? '#854d0e' : '#991b1b',
                                }}
                              >
                                {pro.acceptance_rate}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                {pro.completed_requests}
                              </span>
                              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                {pro.completion_rate}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: pro.rejected_requests > 0 ? '#dc2626' : 'var(--text-muted)' }}>
                              {pro.rejected_requests}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>
                              ₹{pro.total_earnings.toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleOpenProAudit(pro)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Eye size={13} /> Audit Jobs
                              </button>
                              <button
                                onClick={() => handleToggleVerify(pro)}
                                disabled={actionLoadingId === pro.id}
                                className={`btn btn-sm ${pro.is_verified ? 'btn-secondary' : 'btn-success'}`}
                                style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
                                title={pro.is_verified ? 'Click to revoke badge' : 'Click to verify specialist'}
                              >
                                {pro.is_verified ? 'Verified' : 'Verify'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  User &amp; Partner Management
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Filter, search, activate, or deactivate registered accounts.
                </p>
              </div>

              {/* Filter and Search */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>

                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '220px' }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Search size={16} />
                  </button>
                </form>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Loading user accounts from database...
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                No users found matching current filters.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          {u.is_active ? (
                            <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <XCircle size={14} /> Deactivated
                            </span>
                          )}
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={actionLoadingId === u.id}
                              className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-success'}`}
                              style={{ fontSize: '0.775rem' }}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FINANCIAL AUDIT, PLATFORM FEES & INVOICES (SECTION 25) */}
        {activeTab === 'financials' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              <div className="card" style={{ background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Platform Revenue
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.35rem' }}>
                  ₹{(financialData?.stats?.totalRevenue || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                  {financialData?.stats?.completedBookings || 0} completed orders
                </span>
              </div>

              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.12)', textAlign: 'center', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                  Platform Fees Collected (₹50/job)
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', marginTop: '0.35rem' }}>
                  ₹{(financialData?.stats?.totalPlatformFees || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#15803d' }}>SabFix marketplace margin</span>
              </div>

              <div className="card" style={{ background: 'rgba(245, 158, 11, 0.12)', textAlign: 'center', border: '1.5px solid rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                  Pending Platform Fees Due
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706', marginTop: '0.35rem' }}>
                  ₹{(financialData?.stats?.pendingPlatformFees || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#b45309' }}>From cash payments</span>
              </div>

              <div className="card" style={{ background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Razorpay Online Volume
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.35rem' }}>
                  ₹{(financialData?.stats?.onlinePaymentsVolume || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {financialData?.stats?.onlinePaymentsCount || 0} online payments
                </span>
              </div>

              <div className="card" style={{ background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Cash On Delivery Volume
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  ₹{(financialData?.stats?.cashPaymentsVolume || 0).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {financialData?.stats?.cashPaymentsCount || 0} cash orders
                </span>
              </div>
            </div>

            {/* Invoices Audit Table */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    Official Tax Invoices &amp; Transaction Audit
                  </h3>
                </div>
                <span className="badge badge-customer">
                  {financialData?.invoices?.length || 0} Invoices Generated
                </span>
              </div>

              {loadingFinancials ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Loading financial records and invoices...
                </div>
              ) : !financialData?.invoices || financialData.invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No tax invoices generated yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Customer</th>
                        <th>Specialist</th>
                        <th>Service</th>
                        <th>Total Paid</th>
                        <th>Platform Fee</th>
                        <th>Payment Mode</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td><strong>{inv.invoice_no}</strong></td>
                          <td>
                            <div>{inv.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customer_phone}</div>
                          </td>
                          <td>
                            <div>{inv.professional_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.professional_phone}</div>
                          </td>
                          <td><span className="badge badge-customer">{inv.service_name}</span></td>
                          <td><strong style={{ color: '#16a34a' }}>₹{inv.total_amount.toFixed(2)}</strong></td>
                          <td style={{ color: '#64748b' }}>₹{inv.platform_fee.toFixed(2)}</td>
                          <td><span className="badge">{inv.payment_method}</span></td>
                          <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="btn btn-sm btn-primary"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => downloadInvoicePDF(inv)}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                                title="Download PDF"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal for Admin */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      {/* DETAILED PROFESSIONAL AUDIT MODAL */}
      {selectedProAudit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {selectedProAudit.name} — Activity &amp; Job History
                  </h3>
                  {selectedProAudit.is_verified && (
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Visiting Fee: <strong>₹{selectedProAudit.visiting_charge || 99}</strong> • Rate: <strong>₹{selectedProAudit.price}/hr</strong> • Phone: {selectedProAudit.phone || '—'}
                </div>
              </div>

              <button
                onClick={() => setSelectedProAudit(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {loadingJobs ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                Loading request and job history...
              </div>
            ) : !proJobHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Unable to load job records.
              </div>
            ) : (
              <div>
                {/* Modal Performance Metrics */}
                <div className="grid-4" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Requests</span>
                    <strong style={{ fontSize: '1.25rem' }}>{proJobHistory.stats?.total_requests || 0}</strong>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'block' }}>Accepted</span>
                    <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>
                      {proJobHistory.stats?.accepted_requests || 0} ({proJobHistory.stats?.acceptance_rate || 0}%)
                    </strong>
                  </div>
                  <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', fontWeight: 700 }}>Completed</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                      {proJobHistory.stats?.completed_requests || 0} ({proJobHistory.stats?.completion_rate || 0}%)
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#d97706', display: 'block' }}>Total Earnings</span>
                    <strong style={{ fontSize: '1.25rem', color: '#d97706' }}>
                      ₹{proJobHistory.stats?.total_earnings?.toLocaleString() || 0}
                    </strong>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Individual Requests Log ({proJobHistory.jobs?.length || 0} records)
                </h4>

                {!proJobHistory.jobs?.length ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    No bookings logged for this specialist yet.
                  </div>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Customer</th>
                          <th>Visiting Fee</th>
                          <th>Status</th>
                          <th>Requested At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proJobHistory.jobs.map((job) => (
                          <tr key={job.id}>
                            <td>
                              <strong>{job.service_name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Rate: ₹{job.price}/hr
                              </div>
                            </td>
                            <td>
                              <div>{job.customer_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {job.customer_address}
                              </div>
                            </td>
                            <td>
                              <strong style={{ color: '#16a34a' }}>
                                ₹{job.visiting_charge || 99}
                              </strong>
                            </td>
                            <td>{getStatusBadge(job.status)}</td>
                            <td>{new Date(job.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button
                    onClick={() => setSelectedProAudit(null)}
                    className="btn btn-secondary"
                  >
                    Close Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
