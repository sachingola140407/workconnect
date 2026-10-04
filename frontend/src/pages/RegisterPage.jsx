import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Briefcase, User, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'professional' ? 'professional' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Professional specific fields
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState(3);
  const [price, setPrice] = useState(300);
  const [address, setAddress] = useState('');

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'professional') {
      setRole('professional');
    }
  }, [searchParams]);

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
        bio: bio || `Skilled ${name} providing reliable services on WorkConnect.`,
        experience: parseInt(experience, 10) || 0,
        price: parseFloat(price) || 0,
        address: address || '',
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
    <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '580px' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
              Join Fixigo
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Create an account as a customer or service partner
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.85rem' }}
            >
              <User size={18} />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('professional')}
              className={`btn ${role === 'professional' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.85rem' }}
            >
              <Briefcase size={18} />
              <span>Professional</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder={role === 'customer' ? 'e.g. Arun Verma' : 'e.g. Rahul Kumar (Electrician)'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password * (minimum 6 characters)
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Professional Specific Details */}
            {role === 'professional' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>
                  Professional Profile Details
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="experience">
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      className="form-input"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="price">
                      Base Hourly Rate (₹)
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="50"
                      className="form-input"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Service Locality / Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Connaught Place, New Delhi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bio">
                    Professional Bio &amp; Skills
                  </label>
                  <textarea
                    id="bio"
                    className="form-textarea"
                    placeholder="Describe your expertise, certifications, and types of repairs/services you handle..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
              style={{ marginTop: '1.5rem' }}
            >
              <UserPlus size={18} />
              {isSubmitting ? 'Creating account...' : `Register as ${role === 'professional' ? 'Professional' : 'Customer'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
