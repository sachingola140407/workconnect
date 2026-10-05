import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Eye, EyeOff, Shield, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        background: 'radial-gradient(ellipse at top, #eff6ff 0%, #f8fafc 60%, #ffffff 100%)',
      }}
    >
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div
          className="glass-card auth-card"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.9) inset',
          }}
        >
          {/* Brand Icon & Heading */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="animate-pulse-glow"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Shield size={28} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
              Welcome to Fixigo
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Sign in with your real account credentials
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
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}
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
                    color: '#94a3b8',
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
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: 0 }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
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
                    color: '#94a3b8',
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
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'center',
              gap: '1.25rem',
              fontSize: '0.8rem',
              color: '#64748b',
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
            New to Fixigo?{' '}
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
