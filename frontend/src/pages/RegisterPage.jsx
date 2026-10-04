import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../services/api';
import {
  UserPlus,
  AlertCircle,
  Briefcase,
  User,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'professional' ? 'professional' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Professional specific fields
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState(3);
  const [price, setPrice] = useState(350);
  const [address, setAddress] = useState('Connaught Place, New Delhi');

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'professional') {
      setRole('professional');
    }
  }, [searchParams]);

  useEffect(() => {
    servicesAPI
      .getAll()
      .then((res) => {
        const list = res.data?.data || [];
        setAvailableServices(list);
        if (list.length > 0 && !selectedServiceId) {
          setSelectedServiceId(list[0].id);
        }
      })
      .catch((err) => console.log('Could not load services', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      password,
      role,
    };

    if (role === 'professional') {
      payload.professionalDetails = {
        bio: bio || `Certified ${name} delivering top-rated home repairs and services on Fixigo.`,
        experience: parseInt(experience, 10) || 0,
        price: parseFloat(price) || 300,
        address: address || 'Delhi NCR',
        serviceId: selectedServiceId || undefined,
      };
    }

    try {
      const newUser = await register(payload);
      if (newUser.role === 'professional') {
        navigate('/professional');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : 'Registration failed');
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
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '540px' }}>
        <div
          className="glass-card"
          style={{
            padding: '2.5rem 2.25rem',
            borderRadius: '22px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.9) inset',
          }}
        >
          {/* Header */}
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
              <UserPlus size={26} />
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 850, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
              Join Fixigo
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Create your real account as a customer or service partner
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
              marginBottom: '1.75rem',
              background: '#f1f5f9',
              padding: '0.35rem',
              borderRadius: '14px',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('customer')}
              className="btn"
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: role === 'customer' ? '#ffffff' : 'transparent',
                color: role === 'customer' ? 'var(--primary)' : '#64748b',
                boxShadow: role === 'customer' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                fontWeight: 750,
                fontSize: '0.9rem',
              }}
            >
              <User size={17} />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('professional')}
              className="btn"
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: role === 'professional' ? '#ffffff' : 'transparent',
                color: role === 'professional' ? 'var(--primary)' : '#64748b',
                boxShadow: role === 'professional' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                fontWeight: 750,
                fontSize: '0.9rem',
              }}
            >
              <Briefcase size={17} />
              <span>Service Partner</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-error animate-scale-in" style={{ borderRadius: '12px', fontSize: '0.875rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder={role === 'customer' ? 'e.g. Rahul Sharma' : 'e.g. Vikram Singh'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '2.6rem', height: '46px', borderRadius: '12px' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
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
                    style={{ paddingLeft: '2.6rem', height: '46px', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Mobile Phone *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                    <Phone size={18} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ paddingLeft: '2.6rem', height: '46px', borderRadius: '12px' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  Password * (minimum 6 chars)
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
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingLeft: '2.6rem', height: '46px', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* Professional Specific Profile Fields */}
            {role === 'professional' && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '0.5rem',
                  padding: '1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Service Partner Profile Details</span>
                </div>

                {availableServices.length > 0 && (
                  <div>
                    <label className="form-label" htmlFor="serviceSelect" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                      Primary Trade / Service Category *
                    </label>
                    <select
                      id="serviceSelect"
                      className="form-select"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      style={{ height: '44px', borderRadius: '10px' }}
                    >
                      {availableServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div>
                    <label className="form-label" htmlFor="experience" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      type="number"
                      min="0"
                      max="40"
                      className="form-input"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      style={{ height: '44px', borderRadius: '10px' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="price" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                      Hourly Rate (₹)
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="100"
                      step="50"
                      className="form-input"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{ height: '44px', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="address" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                    Service City &amp; Locality
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                      <MapPin size={16} />
                    </div>
                    <input
                      id="address"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Connaught Place, New Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ paddingLeft: '2.4rem', height: '44px', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="bio" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                    Skills &amp; Bio
                  </label>
                  <textarea
                    id="bio"
                    className="form-textarea"
                    placeholder="Briefly describe your skill set, expertise, and previous work experience..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ borderRadius: '10px', minHeight: '65px' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
              style={{
                height: '48px',
                marginTop: '0.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
              }}
            >
              {isSubmitting ? (
                'Creating your account...'
              ) : (
                `Complete Registration as ${role === 'professional' ? 'Service Partner' : 'Customer'}`
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
