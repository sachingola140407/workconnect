import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../services/api';
import LocationPickerMap from '../components/LocationPickerMap';
import SabFixBrand from '../components/SabFixBrand';
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
  Navigation,
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
  const [address, setAddress] = useState('Sanjay Place, Agra');
  const [proLocation, setProLocation] = useState({
    latitude: 27.1767,
    longitude: 78.0081,
    address: 'Sanjay Place, Agra',
  });
  const [showMapPicker, setShowMapPicker] = useState(false);

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
        bio: bio || `Certified ${name} delivering top-rated home repairs and services on SabFix.`,
        experience: parseInt(experience, 10) || 0,
        price: parseFloat(price) || 300,
        address: address || proLocation.address || 'Local Area',
        latitude: proLocation.latitude,
        longitude: proLocation.longitude,
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
        background: 'var(--bg-main)',
      }}
    >
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '540px' }}>
        <div
          className="glass-card auth-card"
          style={{
            padding: '2.5rem 2.25rem',
            borderRadius: '22px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-card)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.85rem' }}>
            <SabFixBrand size="lg" layout="vertical" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              Create your account as a customer or service partner
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.65rem',
              marginBottom: '1.75rem',
              background: 'var(--bg-subtle)',
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
                background: role === 'customer' ? 'var(--bg-card)' : 'transparent',
                color: role === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: role === 'customer' ? 'var(--shadow-sm)' : 'none',
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
                background: role === 'professional' ? 'var(--bg-card)' : 'transparent',
                color: role === 'professional' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: role === 'professional' ? 'var(--shadow-sm)' : 'none',
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
              <label className="form-label" htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                <label className="form-label" htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                <label className="form-label" htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                <label className="form-label" htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
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
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
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
                    <label className="form-label" htmlFor="serviceSelect" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                    <label className="form-label" htmlFor="experience" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                    <label className="form-label" htmlFor="price" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label className="form-label" htmlFor="address" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Service City &amp; Living Locality *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <MapPin size={13} />
                      {showMapPicker ? 'Hide Map' : 'Set Location on Map'}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                      <MapPin size={16} />
                    </div>
                    <input
                      id="address"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sanjay Place, Agra or Connaught Place, New Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ paddingLeft: '2.4rem', height: '44px', borderRadius: '10px' }}
                    />
                  </div>

                  {/* Interactive Map for Professional Location Setup */}
                  {showMapPicker && (
                    <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      <LocationPickerMap
                        initialLat={proLocation.latitude}
                        initialLng={proLocation.longitude}
                        initialAddress={address}
                        height="260px"
                        title="Set Your Base / Living Location"
                        helpText="Map auto-selects your location. Drag marker or click anywhere to change it."
                        onLocationSelect={(loc) => {
                          setProLocation(loc);
                          setAddress(loc.address);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label" htmlFor="bio" style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
