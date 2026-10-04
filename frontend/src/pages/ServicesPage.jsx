import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, professionalsAPI, bookingsAPI } from '../services/api';
import {
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  Cpu,
  Car,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  X,
  Send,
  Navigation,
  ArrowRight,
} from 'lucide-react';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('service') || 'all';

  const [selectedService, setSelectedService] = useState(initialCategory);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('best_match');

  // Customer Location state (Browser Geolocation)
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);

  // Booking Modal State
  const [selectedProForBooking, setSelectedProForBooking] = useState(null);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Profile Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper icon mapper
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={18} color="#f59e0b" />;
      case 'Wrench':
        return <Wrench size={18} color="#2563eb" />;
      case 'Wind':
        return <Wind size={18} color="#06b6d4" />;
      case 'Hammer':
        return <Hammer size={18} color="#d97706" />;
      case 'Paintbrush':
        return <Paintbrush size={18} color="#ec4899" />;
      case 'Sparkles':
        return <Sparkles size={18} color="#10b981" />;
      case 'Cpu':
        return <Cpu size={18} color="#6366f1" />;
      case 'Car':
        return <Car size={18} color="#ef4444" />;
      default:
        return <Wrench size={18} color="var(--primary)" />;
    }
  };

  // 1. Fetch available services catalog
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await servicesAPI.getAll();
        setServices(res.data.data);
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    }
    loadServices();
  }, []);

  // Update selectedService when URL searchParams change
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('service') || 'all';
    setSelectedService(cat);
  }, [searchParams]);

  // 2. Fetch professionals matching current service & filters
  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        service: selectedService !== 'all' ? selectedService : undefined,
        search: searchQuery || undefined,
        isAvailable: availableOnly ? true : undefined,
        sortBy,
      };

      if (userLocation) {
        params.lat = userLocation.latitude;
        params.lng = userLocation.longitude;
      }

      const res = await professionalsAPI.search(params);
      setProfessionals(res.data.data.professionals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [selectedService, availableOnly, sortBy, userLocation]);

  // Handle service pill click
  const handleServiceSelect = (serviceName) => {
    setSelectedService(serviceName);
    setSearchParams(serviceName === 'all' ? {} : { category: serviceName });
  };

  // Browser Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Detecting your GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('📍 Location detected! Distance calculations active.');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to New Delhi Connaught Place coordinates for seamless demonstration
        setUserLocation({
          latitude: 28.6139,
          longitude: 77.2090,
        });
        setLocationStatus('📍 Using central location (Connaught Place, New Delhi).');
      }
    );
  };

  // Handle opening booking modal
  const handleOpenBooking = (pro) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to request a service' } });
      return;
    }
    setSelectedProForBooking(pro);
    setBookingAddress(user?.address || '');
    setBookingSuccess(null);
    setBookingError(null);
  };

  // Submit Booking Request
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      // Find service ID from professional services or selected service
      const proService =
        selectedProForBooking.services?.find(
          (s) => s.name.toLowerCase() === selectedService.toLowerCase()
        ) || selectedProForBooking.services?.[0];

      if (!proService) {
        throw new Error('Please select a valid service for this professional');
      }

      await bookingsAPI.create({
        professionalId: selectedProForBooking.id,
        serviceId: proService.id,
        price: selectedProForBooking.price,
        customerAddress: bookingAddress,
        notes: bookingNotes,
        scheduledAt: bookingDate || new Date().toISOString(),
        customerLocation: userLocation,
      });

      setBookingSuccess(
        `Service request successfully sent to ${selectedProForBooking.name}! They have been notified.`
      );
      setTimeout(() => {
        setSelectedProForBooking(null);
        setBookingSuccess(null);
      }, 2500);
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to submit booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
            <Wrench size={16} /> Fixigo Service Network
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
            Find Skilled Professionals Near You
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Select a service category below or detect your location to view ranked, verified specialists ready to help.
          </p>
        </div>

        {/* Location Detection & GPS Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.925rem' }}>
                  {locationStatus || 'Enable location for high-precision PostGIS distance matching'}
                </strong>
                {userLocation && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Coords: {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDetectLocation}
              className="btn btn-secondary btn-sm"
              style={{ background: 'white' }}
            >
              <MapPin size={15} color="var(--primary)" />
              {userLocation ? 'Update Location' : 'Detect My Location (GPS)'}
            </button>
          </div>
        </div>

        {/* Service Categories Chips Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Select Service Category
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
            <button
              onClick={() => handleServiceSelect('all')}
              className={`btn btn-sm ${selectedService === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
            >
              All Services
            </button>

            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleServiceSelect(svc.name)}
                className={`btn btn-sm ${selectedService.toLowerCase() === svc.name.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '9999px', padding: '0.5rem 1.1rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                {getServiceIcon(svc.icon)}
                <span>{svc.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                  {svc.available_pros}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProfessionals();
            }}
            style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '400px' }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search by specialist name, skills, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              <Search size={16} />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Available Now Only
            </label>

            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', fontSize: '0.875rem' }}
            >
              <option value="best_match">Rank: Best Match</option>
              <option value="distance">Sort: Nearest Distance</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="experience">Sort: Experience</option>
              <option value="price_asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* Professionals Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Searching Fixigo professionals...</div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.35rem' }}>Matching service criteria with PostGIS spatial database</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No professionals found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              No active specialists matched your search or selected filter. Try selecting <strong>"All Services"</strong> or resetting search terms.
            </p>
            <button
              onClick={() => {
                handleServiceSelect('all');
                setSearchQuery('');
                setAvailableOnly(false);
              }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '1.25rem' }}
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {professionals.map((pro) => (
              <div key={pro.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', border: pro.isBestMatch ? '2px solid #3b82f6' : '1px solid var(--border)' }}>
                {/* Best Match Badge */}
                {pro.isBestMatch && (
                  <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: 'var(--shadow-sm)' }}>
                    <Star size={12} fill="white" /> BEST MATCH
                  </div>
                )}

                {/* Professional Header */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
                    {pro.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        {pro.name}
                      </h3>
                      {pro.is_verified && (
                        <span className="badge badge-verified" title="Verified by Fixigo">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      )}
                    </div>

                    {/* Services Tags */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {pro.services && pro.services.map((svc) => (
                        <span key={svc.id} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {svc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Highlights Row: Rating, Experience, Price, Distance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Rating</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      {pro.rating.toFixed(1)} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({pro.review_count})</span>
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Experience</span>
                    <strong>{pro.experience} Years</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Base Rate</span>
                    <strong style={{ color: 'var(--primary)' }}>₹{pro.price}/hr</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Distance</span>
                    <strong>
                      {pro.distance_km !== null ? (
                        `${pro.distance_km} km away`
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Nearby</span>
                      )}
                    </strong>
                  </div>
                </div>

                {/* Address & Bio */}
                <div style={{ marginBottom: '1.25rem', flex: 1 }}>
                  {pro.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{pro.address}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {pro.bio || 'Skilled professional registered and ready to take on tasks.'}
                  </p>
                </div>

                {/* Status & Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    {pro.is_available ? (
                      <span className="badge badge-available">
                        <CheckCircle size={12} /> Available Now
                      </span>
                    ) : (
                      <span className="badge badge-unavailable">
                        <Clock size={12} /> Busy / Offline
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setViewingProfile(pro)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => handleOpenBooking(pro)}
                      disabled={!pro.is_available}
                      className="btn btn-primary btn-sm"
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Request Modal */}
      {selectedProForBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Request Service from Fixigo Partner</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Professional: <strong>{selectedProForBooking.name}</strong> &bull; Rate: ₹{selectedProForBooking.price}/hr
                </span>
              </div>
              <button
                onClick={() => setSelectedProForBooking(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {bookingSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={18} />
                <div>{bookingSuccess}</div>
              </div>
            )}

            {bookingError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <div>{bookingError}</div>
              </div>
            )}

            <form onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label className="form-label">Service Required</label>
                <input
                  type="text"
                  className="form-input"
                  value={
                    selectedProForBooking.services?.find(
                      (s) => s.name.toLowerCase() === selectedService.toLowerCase()
                    )?.name || selectedProForBooking.services?.[0]?.name || 'Home Repair'
                  }
                  readOnly
                  style={{ background: '#f8fafc', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Service Address / Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Flat 402, Block B, Connaught Place, New Delhi"
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date &amp; Time (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Problem Details &amp; Notes for Specialist</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what needs to be fixed (e.g. pipe leakage under kitchen sink, circuit trip, AC cooling issue)..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedProForBooking(null)}
                  className="btn btn-secondary"
                  disabled={bookingSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingSubmitting}
                >
                  <Send size={16} />
                  {bookingSubmitting ? 'Sending Request...' : 'Confirm & Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Profile View Modal */}
      {viewingProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
                  {viewingProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{viewingProfile.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    {viewingProfile.is_verified && (
                      <span className="badge badge-verified">
                        <ShieldCheck size={13} /> Verified Partner
                      </span>
                    )}
                    <span className="badge badge-available">
                      <CheckCircle size={12} /> {viewingProfile.is_available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingProfile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.925rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  About &amp; Experience
                </span>
                <p style={{ marginTop: '0.35rem', lineHeight: '1.6' }}>
                  {viewingProfile.bio || 'Experienced local professional providing quality workmanship.'}
                </p>
              </div>

              <div className="grid-3" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Experience</span>
                  <strong>{viewingProfile.experience} Years</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Hourly Rate</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{viewingProfile.price}/hr</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Rating</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    {viewingProfile.rating.toFixed(1)} ({viewingProfile.review_count})
                  </strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Operating Area / Locality
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span>{viewingProfile.address || 'Delhi NCR'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button
                onClick={() => setViewingProfile(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const targetPro = viewingProfile;
                  setViewingProfile(null);
                  handleOpenBooking(targetPro);
                }}
                disabled={!viewingProfile.is_available}
                className="btn btn-primary"
              >
                Request Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
