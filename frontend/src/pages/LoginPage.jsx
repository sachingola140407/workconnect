import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import SabFixBrand from '../components/SabFixBrand';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (loggedInUser.role === 'admin') navigate('/admin');
        else if (loggedInUser.role === 'professional') navigate('/professional');
        else navigate('/customer');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : 'Invalid email or password');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
        background: 'var(--bg-main)',
      }}
    >
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div
          className="glass-card auth-card"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-card)',
          }}
        >
          {/* SabFix Brand Icon, Styled Name & Tagline */}
          <div style={{ textAlign: 'center', marginBottom: '1.85rem' }}>
            <SabFixBrand size="lg" layout="vertical" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="alert alert-error animate-scale-in" style={{ borderRadius: '12px', fontSize: '0.875rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                className="form-label"
                htmlFor="email"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                    display: 'flex',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    paddingLeft: '2.6rem',
                    height: '46px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label
                  className="form-label"
                  htmlFor="password"
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 600,
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)',
                    display: 'flex',
                  }}
                >
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    paddingLeft: '2.6rem',
                    height: '46px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
              style={{
                height: '48px',
                marginTop: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                gap: '0.65rem',
              }}
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Clean Trust Indicators */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'center',
              gap: '1.25rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#10b981" /> 256-bit Encrypted
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#10b981" /> Real-Time GPS
            </span>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            New to SabFix?{' '}
            <Link
              to="/register"
              style={{
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
