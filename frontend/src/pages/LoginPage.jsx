import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Phone,
  User,
  Briefcase,
  Wrench,
  Clock,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import LocationPickerMap from '../components/LocationPickerMap';
import SabFixBrand from '../components/SabFixBrand';

const SERVICE_CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Electrician', category: 'Electrical' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'AC Repairer', category: 'Appliances' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Carpenter', category: 'Carpentry' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Painter', category: 'Painting' },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Cleaner', category: 'Cleaning' },
  { id: '11111111-1111-1111-1111-111111111107', name: 'Appliance Repairer', category: 'Appliances' },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Mechanic', category: 'Automotive' },
  { id: '11111111-1111-1111-1111-111111111109', name: 'Pest Control', category: 'Cleaning' },
  { id: '11111111-1111-1111-1111-111111111110', name: 'TV Repair', category: 'Appliances' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'RO Repair', category: 'Appliances' },
  { id: '11111111-1111-1111-1111-111111111112', name: 'Geyser Repair', category: 'Appliances' },
  { id: '11111111-1111-1111-1111-111111111113', name: 'Laptop Repair', category: 'Electronics' },
  { id: '11111111-1111-1111-1111-111111111114', name: 'Home Shifting', category: 'Logistics' },
];

export default function LoginPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, mobileLogin, mobileRegister } = useAuth();

  // Determine initial role & mode
  const paramRole = searchParams.get('role');
  const paramMode = searchParams.get('mode');

  const [role, setRole] = useState(
    paramRole === 'professional' ? 'professional' : 'customer'
  );
  const [mode, setMode] = useState(
    paramMode === 'register' || initialMode === 'register' ? 'register' : 'login'
  );

  // Form states
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  
  // Professional registration fields
  const { userLocation } = useLocationContext();
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0].name);
  const [experience, setExperience] = useState('3');
  const [price, setPrice] = useState('299');
  const [address, setAddress] = useState('Agra, Uttar Pradesh');
  const [proCoords, setProCoords] = useState({
    lat: userLocation?.latitude || 27.1767,
    lng: userLocation?.longitude || 78.0081,
  });
  const [showProMapPicker, setShowProMapPicker] = useState(false);

  // Admin login toggle
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Submission state
  const [error, setError] = useState(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (paramRole === 'professional') setRole('professional');
    if (paramRole === 'customer') setRole('customer');
    if (paramMode === 'register') setMode('register');
    if (paramMode === 'login') setMode('login');
  }, [paramRole, paramMode]);

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setProCoords({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      if (userLocation.address && (!address || address === 'Agra, Uttar Pradesh')) {
        setAddress(userLocation.address);
      }
    }
  }, [userLocation]);

  // Handle phone input formatting (clean 10 digits)
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (error) setError(null);
    if (notRegistered) setNotRegistered(false);
  };

  // Helper to extract clean 10-digit phone
  const getCleanDigits = () => {
    const digits = phone.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotRegistered(false);
    setIsSubmitting(true);

    try {
      // 1. Admin login flow
      if (isAdminMode) {
        const loggedInUser = await login(adminEmail.trim(), adminPassword);
        if (loggedInUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (loggedInUser.role === 'professional') {
          navigate('/professional', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

      const digits = getCleanDigits();
      if (!digits || digits.length < 10) {
        setError('Please enter a valid 10-digit mobile number');
        setIsSubmitting(false);
        return;
      }

      // 2. Mobile Login Flow (Customer or Professional)
      if (mode === 'login') {
        const loggedInUser = await mobileLogin(digits, role);
        if (loggedInUser.role === 'professional') {
          navigate('/professional', { replace: true });
        } else {
          if (from && from !== '/customer' && from !== '/login') {
            navigate(from, { replace: true });
          } else {
            navigate('/customer', { replace: true });
          }
        }
        return;
      }

      // 3. Mobile Register Flow
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }

        const regPayload = {
          name: name.trim(),
          phone: digits,
          role,
        };

        if (role === 'professional') {
          const selectedObj = SERVICE_CATEGORIES.find((s) => s.name === category);
          regPayload.professionalDetails = {
            category,
            serviceId: selectedObj?.id,
            experience: parseInt(experience, 10) || 1,
            price: parseFloat(price) || 299,
            address: address.trim() || 'Agra, Uttar Pradesh',
            latitude: proCoords?.lat,
            longitude: proCoords?.lng,
          };
        }

        const registeredUser = await mobileRegister(regPayload);
        if (registeredUser.role === 'professional') {
          navigate('/professional', { replace: true });
        } else {
          if (from && from !== '/customer' && from !== '/login') {
            navigate(from, { replace: true });
          } else {
            navigate('/customer', { replace: true });
          }
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : null);

      if (status === 404 || err.response?.data?.notRegistered) {
        setNotRegistered(true);
        setError(
          message ||
            `No ${role} account found with mobile number ${phone}. Please register to continue.`
        );
      } else {
        setError(message || 'An error occurred during authentication. Please check your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setIsAdminMode(true);
    setAdminEmail('sachin123@gmail.com');
    setAdminPassword('sachin123');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'var(--bg-main)',
      }}
    >
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        <div
          className="glass-card auth-card"
          style={{
            padding: '2.25rem 1.75rem',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-card)',
          }}
        >
          {/* SabFix Header & Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <SabFixBrand size="lg" layout="vertical" />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0.85rem 0 0.25rem',
              }}
            >
              {isAdminMode
                ? 'Admin Command Center'
                : mode === 'login'
                ? 'Welcome Back'
                : 'Create SabFix Account'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              {isAdminMode
                ? 'Sign in with administrator credentials'
                : 'Simple, fast, and secure mobile authentication'}
            </p>
          </div>

          {!isAdminMode && (
            <>
              {/* Question: Are you a Professional or Customer? */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginBottom: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Are you a Customer or a Professional?
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    background: 'var(--bg-subtle, #f1f5f9)',
                    padding: '6px',
                    borderRadius: '16px',
                  }}
                >
                  {/* Customer Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('customer');
                      setError(null);
                      setNotRegistered(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 10px',
                      borderRadius: '12px',
                      border: 'none',
                      background: role === 'customer' ? '#ffffff' : 'transparent',
                      color: role === 'customer' ? 'var(--primary, #ff6a00)' : 'var(--text-muted)',
                      boxShadow:
                        role === 'customer'
                          ? '0 4px 12px rgba(255, 106, 0, 0.18)'
                          : 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <User size={18} strokeWidth={role === 'customer' ? 2.5 : 2} />
                    <span>Customer</span>
                  </button>

                  {/* Professional Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('professional');
                      setError(null);
                      setNotRegistered(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 10px',
                      borderRadius: '12px',
                      border: 'none',
                      background: role === 'professional' ? '#ffffff' : 'transparent',
                      color: role === 'professional' ? 'var(--primary, #ff6a00)' : 'var(--text-muted)',
                      boxShadow:
                        role === 'professional'
                          ? '0 4px 12px rgba(255, 106, 0, 0.18)'
                          : 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Briefcase size={18} strokeWidth={role === 'professional' ? 2.5 : 2} />
                    <span>Professional</span>
                  </button>
                </div>
              </div>

              {/* Login / Register Mode Segment */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1.35rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setNotRegistered(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: mode === 'login' ? '3px solid var(--primary, #ff6a00)' : '3px solid transparent',
                    color: mode === 'login' ? 'var(--primary, #ff6a00)' : 'var(--text-muted)',
                    fontWeight: mode === 'login' ? 800 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setNotRegistered(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: mode === 'register' ? '3px solid var(--primary, #ff6a00)' : '3px solid transparent',
                    color: mode === 'register' ? 'var(--primary, #ff6a00)' : 'var(--text-muted)',
                    fontWeight: mode === 'register' ? 800 : 600,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Register
                </button>
              </div>
            </>
          )}

          {/* Error / Not Registered Banner */}
          {error && (
            <div
              className="alert alert-error animate-scale-in"
              style={{
                borderRadius: '14px',
                fontSize: '0.86rem',
                marginBottom: '1.25rem',
                padding: '0.85rem 1rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div>{error}</div>
                {notRegistered && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setNotRegistered(false);
                    }}
                    style={{
                      marginTop: '8px',
                      background: 'var(--primary, #ff6a00)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Click to Register as {role === 'professional' ? 'Professional' : 'Customer'} &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* ADMIN FORM */}
            {isAdminMode ? (
              <>
                <div>
                  <label
                    className="form-label"
                    htmlFor="adminEmail"
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}
                  >
                    Admin Email
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
                      id="adminEmail"
                      type="email"
                      className="form-input"
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
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
                      htmlFor="adminPassword"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}
                    >
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
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
                      {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showAdminPassword ? 'Hide' : 'Show'}
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
                      id="adminPassword"
                      type={showAdminPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      style={{
                        paddingLeft: '2.6rem',
                        height: '46px',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* MOBILE NUMBER LOGIN / REGISTER FORM */
              <>
                {/* Full Name / Username (Required if Registering) */}
                {mode === 'register' && (
                  <div>
                    <label
                      className="form-label"
                      htmlFor="userName"
                      style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}
                    >
                      {role === 'customer' ? 'Customer Name / Username *' : 'Full Name *'}
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
                        <User size={18} />
                      </div>
                      <input
                        id="userName"
                        type="text"
                        className="form-input"
                        placeholder={role === 'customer' ? 'e.g. Rahul Sharma' : 'e.g. Vikram Singh'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus={mode === 'register'}
                        style={{
                          paddingLeft: '2.6rem',
                          height: '48px',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Number Field (Present for both Login & Register, Customer & Professional) */}
                <div>
                  <label
                    className="form-label"
                    htmlFor="userPhone"
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}
                  >
                    Mobile Number *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    >
                      <Phone size={17} color="var(--primary, #ff6a00)" />
                      <span>+91</span>
                      <span style={{ color: 'var(--border, #cbd5e1)' }}>|</span>
                    </div>
                    <input
                      id="userPhone"
                      type="tel"
                      className="form-input"
                      placeholder="98765 00001"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      autoFocus={mode === 'login'}
                      autoComplete="tel-national"
                      maxLength={10}
                      style={{
                        paddingLeft: '5.2rem',
                        height: '48px',
                        borderRadius: '12px',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {mode === 'login'
                      ? 'Log in directly with your 10-digit mobile number. No password needed.'
                      : 'We will link your account to this mobile number.'}
                  </div>
                </div>

                {/* Professional-Specific Details When Registering */}
                {role === 'professional' && mode === 'register' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      background: 'rgba(255, 106, 0, 0.04)',
                      padding: '1rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 106, 0, 0.15)',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary, #ff6a00)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Professional Details
                    </div>

                    {/* Service Category Dropdown */}
                    <div>
                      <label
                        className="form-label"
                        htmlFor="proCategory"
                        style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem', display: 'block' }}
                      >
                        Service Category *
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
                          <Wrench size={18} />
                        </div>
                        <select
                          id="proCategory"
                          className="form-input"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                          style={{
                            paddingLeft: '2.6rem',
                            height: '46px',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            background: 'var(--bg-card)',
                          }}
                        >
                          {SERVICE_CATEGORIES.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name} ({s.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Experience & Price in a row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label
                          className="form-label"
                          htmlFor="proExp"
                          style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem', display: 'block' }}
                        >
                          Experience (Yrs) *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#94a3b8',
                              display: 'flex',
                            }}
                          >
                            <Clock size={16} />
                          </div>
                          <input
                            id="proExp"
                            type="number"
                            min="0"
                            max="40"
                            className="form-input"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            required
                            style={{
                              paddingLeft: '2.3rem',
                              height: '44px',
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className="form-label"
                          htmlFor="proPrice"
                          style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem', display: 'block' }}
                        >
                          Rate / Fee (₹) *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#94a3b8',
                              display: 'flex',
                            }}
                          >
                            <IndianRupee size={16} />
                          </div>
                          <input
                            id="proPrice"
                            type="number"
                            min="50"
                            step="25"
                            className="form-input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            style={{
                              paddingLeft: '2.3rem',
                              height: '44px',
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Area / Address & Set Location on Map */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <label
                          className="form-label"
                          htmlFor="proAddress"
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            margin: 0,
                          }}
                        >
                          Service Area / Base Address *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowProMapPicker(!showProMapPicker)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary, #ff6a00)',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '6px',
                          }}
                        >
                          <MapPin size={13} />
                          {showProMapPicker ? 'Hide Map Picker' : 'Set Location on Map'}
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                            display: 'flex',
                          }}
                        >
                          <MapPin size={16} />
                        </div>
                        <input
                          id="proAddress"
                          type="text"
                          className="form-input"
                          placeholder="e.g. Sanjay Place, Agra or Sector 18, Noida"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          style={{
                            paddingLeft: '2.3rem',
                            height: '44px',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                          }}
                        />
                      </div>

                      {/* Interactive Location Picker Map */}
                      {showProMapPicker && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'var(--bg-card, #ffffff)',
                            borderRadius: '16px',
                            border: '1px solid #bfdbfe',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                          }}
                        >
                          <LocationPickerMap
                            initialLat={proCoords.lat}
                            initialLng={proCoords.lng}
                            initialAddress={address}
                            height="240px"
                            title="Set Your Base Operating Location"
                            helpText="Drag pin or search to set where you offer services"
                            onLocationSelect={(loc) => {
                              setProCoords({ lat: loc.latitude, lng: loc.longitude });
                              if (loc.address) setAddress(loc.address);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                )}
              </>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
              style={{
                height: '50px',
                marginTop: '0.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                boxShadow: '0 4px 15px rgba(255, 106, 0, 0.35)',
              }}
            >
              {isSubmitting ? (
                <span>Please wait...</span>
              ) : isAdminMode ? (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight size={18} />
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Log In as {role === 'professional' ? 'Professional' : 'Customer'}</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Register as {role === 'professional' ? 'Professional' : 'Customer'}</span>
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Toggle / Command Center */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              background: 'rgba(255, 106, 0, 0.05)',
              border: '1px dashed rgba(255, 106, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🛡️ Admin Command Center
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                sachin123@gmail.com
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={fillAdminCredentials}
                style={{
                  background: '#ff6a00',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Fill &amp; Enter
              </button>
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setError(null);
                  }}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Back to Mobile
                </button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#10b981" /> 100% Verified
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#10b981" /> Mobile 1-Click
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
