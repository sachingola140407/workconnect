import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'professional') return '/professional';
    return '/customer';
  };

  return (
    <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card">
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '50%', marginBottom: '1.25rem' }}>
            <ShieldAlert size={40} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
            Access Restricted (403)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Your account role (<strong>{user?.role || 'Guest'}</strong>) is not authorized to access this resource.
            {requiredRoles.length > 0 && ` This area requires: ${requiredRoles.join(', ')}.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to={getDashboardLink()} className="btn btn-primary">
              <ArrowLeft size={16} /> Return to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
