import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, User, LogOut, Shield, Briefcase, Home, Layers, Search } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'professional':
        return 'badge-professional';
      default:
        return 'badge-customer';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'professional':
        return '/professional';
      default:
        return '/customer';
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Wrench size={20} />
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Fixi<span style={{ color: 'var(--primary)' }}>go</span>
          </span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/services"
              className={`nav-link ${location.pathname.startsWith('/services') ? 'active' : ''}`}
            >
              <Search size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Find Services
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link
                  to={getDashboardPath()}
                  className={`nav-link ${location.pathname.startsWith(getDashboardPath()) ? 'active' : ''}`}
                >
                  <Layers size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  Dashboard
                </Link>
              </li>

              {user.role === 'professional' && (
                <li>
                  <Link
                    to="/professional"
                    className="nav-link"
                  >
                    My Service Jobs
                  </Link>
                </li>
              )}

              {user.role === 'admin' && (
                <li>
                  <Link
                    to="/admin"
                    className="nav-link"
                  >
                    User Management
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="nav-auth-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {user.role === 'admin' && <Shield size={12} />}
                {user.role === 'professional' && <Briefcase size={12} />}
                {user.role === 'customer' && <User size={12} />}
                {user.role}
              </span>

              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of Fixigo"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
