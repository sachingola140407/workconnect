import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { servicesAPI, professionalsAPI, bookingsAPI } from '../services/api';
import ServiceExploreMap from '../components/ServiceExploreMap';
import LocationPickerMap from '../components/LocationPickerMap';
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
  AlertCircle,
  X,
  Send,
  Navigation,
  ArrowRight,
  ChevronDown,
  Layers,
} from 'lucide-react';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('service') || 'all';

  const [selectedService, setSelectedService] = useState(initialCategory);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('best_match');
  const [expandRadius, setExpandRadius] = useState(false);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' or 'specialist'

  // Global Location Context
  const {
    userLocation,
    currentCity,
    isDetecting,
    statusMessage,
    detectLocation,
    setManualLocation,
    popularCities,
  } = useLocationContext();

  // Booking Modal State
  const [selectedProForBooking, setSelectedProForBooking] = useState(null);
  const [bookingLocation, setBookingLocation] = useState(null);
  const [showBookingMapPicker, setShowBookingMapPicker] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Profile View Modal State
  const [viewingProfile, setViewingProfile] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper icon mapper
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={18} color="#f59e0b" />;
      case 'Wrench':
        return <Wrench size={18} color="var(--primary)" />;
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
        setServices(res.data.data || []);
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

  // 2. Fetch professionals matching current service, location & filters (Prompt 2 Section 1 & 15)
  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        service: selectedService !== 'all' ? selectedService : undefined,
        search: searchQuery || undefined,
        isAvailable: availableOnly ? true : undefined,
        sortBy,
        expand: expandRadius ? true : undefined,
      };

      if (userLocation?.latitude && userLocation?.longitude) {
        params.lat = userLocation.latitude;
        params.lng = userLocation.longitude;
      }

      const res = await professionalsAPI.search(params);
      const list = res.data?.data?.professionals || res.data?.professionals || [];
      setProfessionals(list);

      // Default selected pro to first (or best match) if not selected or current selection no longer exists
      if (list.length > 0) {
        setSelectedPro((prev) => {
          if (!prev || !list.find((p) => p.id === prev.id)) {
            return list[0];
          }
          return prev;
        });
      } else {
        setSelectedPro(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [selectedService, availableOnly, sortBy, expandRadius, userLocation?.latitude, userLocation?.longitude]);

  // Handle service pill click
  const handleServiceSelect = (serviceName) => {
    setSelectedService(serviceName);
    setSearchParams(serviceName === 'all' ? {} : { category: serviceName });
  };

  // Open booking modal
  const handleOpenBooking = (pro) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to request a service' } });
      return;
    }
    setSelectedProForBooking(pro);
    setBookingAddress(user?.address || userLocation?.address || '');
    setBookingLocation({
      latitude: userLocation?.latitude || 27.1767,
      longitude: userLocation?.longitude || 78.0081,
      address: user?.address || userLocation?.address || '',
    });
    setShowBookingMapPicker(false);
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
      const proService =
        selectedProForBooking.services?.find(
          (s) => s.name.toLowerCase() === selectedService.toLowerCase()
        ) || selectedProForBooking.services?.[0];

      if (!proService) {
        throw new Error('Please select a valid service for this professional');
      }

      const finalAddress = bookingAddress || bookingLocation?.address || 'Doorstep Service Address';

      const res = await bookingsAPI.create({
        professionalId: selectedProForBooking.id,
        serviceId: proService.id,
        price: selectedProForBooking.price,
        visitingCharge: selectedProForBooking.visiting_charge || 99,
        customerAddress: finalAddress,
        notes: bookingNotes,
        scheduledAt: bookingDate || new Date().toISOString(),
        customerLocation: {
          latitude: bookingLocation?.latitude || userLocation?.latitude || 27.1767,
          longitude: bookingLocation?.longitude || userLocation?.longitude || 78.0081,
        },
      });

      const newBooking = res.data?.data;
      if (newBooking?.id) {
        setCreatedBookingId(newBooking.id);
        setTimeout(() => {
          navigate(`/track/${newBooking.id}`);
        }, 1200);
      }

      setBookingSuccess(
        `Service request confirmed with ${selectedProForBooking.name}! Opening live tracking screen...`
      );
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
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              marginBottom: '0.35rem',
            }}
          >
            <Wrench size={16} /> SabFix Service Network
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
            Find Skilled Professionals Near You
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.975rem' }}>
            Select a service category below or detect your location to view ranked, verified specialists ready to help.
          </p>
        </div>

        {/* Location Detection & GPS Bar (Matching reference image) */}
        <div
          className="card"
          style={{
            marginBottom: '1.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1rem 1.35rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(255,106,0,0.15)',
                }}
              >
                <Navigation size={19} className={isDetecting ? 'spin' : ''} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                  {statusMessage ||
                    `Location Active: ${currentCity} (High-precision PostGIS distance matching)`}
                </strong>
                {userLocation && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {userLocation.address ||
                      `Coords: ${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° E`}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => detectLocation(false)}
              disabled={isDetecting}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'white',
                border: '1.5px solid #cbd5e1',
                padding: '0.55rem 1.1rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <MapPin size={16} color="var(--primary)" />
              {isDetecting ? 'Detecting...' : 'Detect My Location (GPS)'}
            </button>
          </div>
        </div>

        {/* Service Categories Chips Bar (Matching reference image) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              letterSpacing: '0.05em',
            }}
          >
            SELECT SERVICE CATEGORY
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'thin',
            }}
          >
            <button
              onClick={() => handleServiceSelect('all')}
              className={`btn btn-sm ${selectedService === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '9999px',
                padding: '0.55rem 1.25rem',
                whiteSpace: 'nowrap',
                fontWeight: 750,
                boxShadow: selectedService === 'all' ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              All Services
            </button>

            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleServiceSelect(svc.name)}
                className={`btn btn-sm ${
                  selectedService.toLowerCase() === svc.name.toLowerCase()
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
                style={{
                  borderRadius: '9999px',
                  padding: '0.55rem 1.25rem',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  boxShadow:
                    selectedService.toLowerCase() === svc.name.toLowerCase()
                      ? '0 4px 12px rgba(37,99,235,0.25)'
                      : 'none',
                }}
              >
                {getServiceIcon(svc.icon)}
                <span>{svc.name}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.85,
                    background:
                      selectedService.toLowerCase() === svc.name.toLowerCase()
                        ? 'rgba(255,255,255,0.25)'
                        : 'rgba(0,0,0,0.06)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                  }}
                >
                  {svc.available_pros}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProfessionals();
            }}
            style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '420px' }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by specialist name, skills, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '42px', borderRadius: '12px', paddingRight: '2.5rem' }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              Available Now Only
            </label>

            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', fontSize: '0.875rem', height: '42px', borderRadius: '10px' }}
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
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* MAIN SPLIT VIEW: SELECTED SPECIALIST CARD (LEFT) & INTERACTIVE MAP (RIGHT) (EXACT LAYOUT FROM REFERENCE IMAGE) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Finding skilled SabFix professionals near {currentCity}...
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Querying PostGIS geospatial database for nearest verified specialists
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View Toggle Tabs (Visible only on mobile devices) */}
            <div className="mobile-view-tabs">
              <button
                type="button"
                className={`mobile-view-tab ${mobileTab === 'map' ? 'active' : 'inactive'}`}
                onClick={() => setMobileTab('map')}
              >
                🗺️ Explore Map ({professionals.length})
              </button>
              <button
                type="button"
                className={`mobile-view-tab ${mobileTab === 'specialist' ? 'active' : 'inactive'}`}
                onClick={() => setMobileTab('specialist')}
              >
                👤 Specialist {selectedPro ? `(${selectedPro.name.split(' ')[0]})` : ''}
              </button>
            </div>

            <div className="split-map-view">
              {/* Left Column: Selected / Best Match Specialist Card */}
              <div className={`split-col-specialist ${mobileTab !== 'specialist' ? 'mobile-hidden' : ''}`} style={{ height: '100%' }}>
                {selectedPro ? (
              <div
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: '2px solid var(--primary)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-md)',
                  background: 'var(--bg-card)',
                }}
              >
                {/* BEST MATCH Top Right Badge */}
                {selectedPro.isBestMatch && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '18px',
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      padding: '0.25rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 4px 10px rgba(255,106,0,0.3)',
                    }}
                  >
                    <Star size={12} fill="white" /> BEST MATCH
                  </div>
                )}

                {/* Professional Avatar, Name, Verified Badge & Trade Pill */}
                <div style={{ display: 'flex', gap: '1.1rem', marginBottom: '1.1rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      fontWeight: 850,
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(255,106,0,0.25)',
                    }}
                  >
                    {selectedPro.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        {selectedPro.name}
                      </h3>
                      {selectedPro.is_verified && (
                        <span
                          className="badge"
                          style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            fontWeight: 750,
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <ShieldCheck size={13} /> VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Trade Pill (e.g. Plumber) */}
                    <div style={{ marginTop: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {selectedPro.services?.[0]?.name || selectedService}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highlights Metrics Grid (Rating, Experience, Visiting Fee, Hourly Rate, Distance) */}
                <div className="pro-metrics-grid">
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block', fontWeight: 600 }}>
                      Rating
                    </span>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.875rem' }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      {selectedPro.rating.toFixed(1)} <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.75rem' }}>({selectedPro.review_count})</span>
                    </strong>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', display: 'block', fontWeight: 600 }}>
                      Experience
                    </span>
                    <strong style={{ fontSize: '0.875rem' }}>{selectedPro.experience} Yrs</strong>
                  </div>

                  <div
                    style={{
                      background: '#ecfdf5',
                      padding: '0.25rem 0.35rem',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ color: '#047857', fontSize: '0.7rem', display: 'block', fontWeight: 700 }}>
                      Visiting Fee
                    </span>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                      ₹{selectedPro.visiting_charge || 99}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: 'var(--primary-light)',
                      padding: '0.25rem 0.35rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ color: 'var(--primary)', fontSize: '0.7rem', display: 'block', fontWeight: 750 }}>
                      Hourly Rate
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{selectedPro.price}/hr
                    </strong>
                  </div>
                </div>

                {/* Distance & Address */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.85rem',
                      color: '#475569',
                      fontWeight: 600,
                      marginBottom: '0.35rem',
                    }}
                  >
                    <MapPin size={15} color="var(--primary)" />
                    <span>{selectedPro.address || `${currentCity} Area`}</span>
                    {selectedPro.distance_km !== null && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: '#f1f5f9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#334155',
                          fontWeight: 700,
                        }}
                      >
                        📍 {selectedPro.distance_km} km away
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#475569',
                      lineHeight: '1.5',
                      marginTop: '0.5rem',
                    }}
                  >
                    {selectedPro.bio ||
                      'Skilled professional registered and ready to take on service requests in your area.'}
                  </p>
                </div>

                {/* Status & Action Buttons */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    {selectedPro.is_available ? (
                      <span className="badge badge-available" style={{ fontWeight: 750 }}>
                        <CheckCircle size={13} /> AVAILABLE NOW
                      </span>
                    ) : (
                      <span className="badge badge-unavailable">
                        <Clock size={13} /> Busy / Offline
                      </span>
                    )}
                    <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                      Doorstep in 15-25 mins
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <button
                      onClick={() => setViewingProfile(selectedPro)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.65rem', borderRadius: '10px', fontWeight: 700 }}
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => handleOpenBooking(selectedPro)}
                      disabled={!selectedPro.is_available}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        fontWeight: 750,
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                      }}
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  borderRadius: '18px',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No specialist selected</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  Click on any marker on the map to inspect specialist profile and request service.
                </p>
              </div>
            )}
            </div>

            {/* Right Column: Interactive Map (Matching reference image) */}
            <div className={`split-col-map ${mobileTab !== 'map' ? 'mobile-hidden' : ''}`} style={{ minHeight: '380px', width: '100%' }}>
              <ServiceExploreMap
                userLocation={userLocation}
                professionals={professionals}
                selectedProId={selectedPro?.id}
                onSelectProfessional={(pro) => {
                  setSelectedPro(pro);
                  setMobileTab('specialist');
                }}
                onRequestBooking={(pro) => handleOpenBooking(pro)}
                onRecenter={() => detectLocation(false)}
              />
            </div>
          </div>
        </>
        )}

        {/* BOTTOM SECTION: NEARBY PROFESSIONALS LIST (CARDS) (MATCHING REFERENCE IMAGE) */}
        <div style={{ marginTop: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1.25rem',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '0.75rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 850,
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <MapPin size={22} color="var(--primary)" />
                Nearby Professionals
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Top professionals near your location ({currentCity})
              </p>
            </div>

            <div style={{ fontSize: '0.875rem', fontWeight: 750, color: 'var(--primary)', cursor: 'pointer' }}>
              View All ({professionals.length}) &rarr;
            </div>
          </div>

          {professionals.length === 0 && !loading ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                No professionals available within 10 KM.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.25rem' }}>
                {expandRadius
                  ? 'No professionals found even with expanded search. Try another category or register a specialist account.'
                  : 'We strictly search verified and online professionals within 10 KM of your current coordinates.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {!expandRadius ? (
                  <button
                    onClick={() => setExpandRadius(true)}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '999px', fontWeight: 700 }}
                  >
                    🔍 Expand Search (Up to 50 KM)
                  </button>
                ) : (
                  <button
                    onClick={() => setExpandRadius(false)}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '999px', fontWeight: 700 }}
                  >
                    ⬅️ Reset to 10 KM Search
                  </button>
                )}
                <button
                  onClick={() => {
                    handleServiceSelect('all');
                    setSearchQuery('');
                    setAvailableOnly(false);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '999px' }}
                >
                  View All Services
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {professionals.map((pro) => {
                const isSelected = selectedPro?.id === pro.id;
                return (
                  <div
                    key={pro.id}
                    onClick={() => setSelectedPro(pro)}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      boxShadow: isSelected
                        ? '0 8px 24px rgba(255,106,0,0.18)'
                        : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: isSelected
                            ? 'var(--primary-gradient)'
                            : 'var(--primary-light)',
                          color: isSelected ? 'white' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {pro.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <h4
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 800,
                              color: 'var(--secondary)',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {pro.name}
                          </h4>
                          {pro.is_verified && (
                            <span style={{ color: '#16a34a', display: 'flex' }} title="Verified">
                              <ShieldCheck size={14} />
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            display: 'inline-block',
                            marginTop: '0.15rem',
                          }}
                        >
                          {pro.services?.[0]?.name || selectedService}
                        </span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem',
                        marginBottom: '0.85rem',
                        padding: '0.5rem 0.65rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        {pro.rating.toFixed(1)} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({pro.review_count})</span>
                      </span>

                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        {pro.distance_km !== null ? `📍 ${pro.distance_km} km` : '📍 Nearby'}
                      </span>

                      <span style={{ color: 'var(--primary)', fontWeight: 750 }}>
                        ₹{pro.price}/hr
                      </span>
                    </div>

                    {/* Status & Buttons */}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      {pro.is_available ? (
                        <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                          Available Now
                        </span>
                      ) : (
                        <span className="badge badge-unavailable" style={{ fontSize: '0.7rem' }}>
                          Busy
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingProfile(pro);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          View Profile
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBooking(pro);
                          }}
                          disabled={!pro.is_available}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', fontWeight: 700 }}
                        >
                          Request Service
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Request Modal with Map Location Picker */}
      {selectedProForBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Request Service from SabFix Partner</h3>
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

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    fontSize: '2rem',
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                  Request Sent Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.25rem', lineHeight: '1.5' }}>
                  <strong>{selectedProForBooking.name}</strong> has received your service alert. Once accepted, you can track their real-time arrival location on the live GPS map!
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    maxWidth: '380px',
                    margin: '0 auto 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Doorstep Visiting Fee:</span>
                    <strong style={{ color: 'var(--primary)' }}>₹{selectedProForBooking.visiting_charge || 99}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Arrival:</span>
                    <strong style={{ color: '#10b981' }}>15 - 25 mins</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px', margin: '0 auto' }}>
                  {createdBookingId && (
                    <button
                      onClick={() => navigate(`/track/${createdBookingId}`)}
                      className="btn btn-primary"
                      style={{
                        padding: '0.85rem 1.25rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: '#f59e0b',
                        borderColor: '#f59e0b',
                        color: '#0f172a',
                      }}
                    >
                      🛵 Track Specialist Live Map
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/customer')}
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 1.25rem', fontWeight: 600 }}
                  >
                    Go to Customer Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProForBooking(null);
                      setBookingSuccess(null);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', marginTop: '0.25rem' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking}>
                {bookingError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={18} />
                    <div>{bookingError}</div>
                  </div>
                )}

                {/* Price Callout */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>🛵 Doorstep Visiting / Inspection Fee:</span>
                    <strong style={{ color: '#15803d', fontSize: '1rem' }}>₹{selectedProForBooking.visiting_charge || 99}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>⏱️ Standard Hourly Rate:</span>
                    <strong style={{ color: '#15803d', fontSize: '1rem' }}>₹{selectedProForBooking.price}/hr</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.4rem', borderTop: '1px dashed #bbf7d0', paddingTop: '0.35rem' }}>
                    ✓ 100% Transparent: Pay visiting fee on arrival. No surge pricing or hidden charges.
                  </div>
                </div>

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

                {/* Customer Location & Map Picker Trigger */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Your Service Address / Location *</label>
                    <button
                      type="button"
                      onClick={() => setShowBookingMapPicker(!showBookingMapPicker)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <MapPin size={14} />
                      {showBookingMapPicker ? 'Hide Map Picker' : 'Set Exact Location on Map'}
                    </button>
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Flat 402, Block B, Sanjay Place, Agra"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    required
                  />

                  {/* Interactive Map Location Picker for Customer */}
                  {showBookingMapPicker && (
                    <div style={{ marginTop: '0.75rem', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem', background: 'var(--primary-light)' }}>
                      <LocationPickerMap
                        initialLat={bookingLocation?.latitude || userLocation?.latitude}
                        initialLng={bookingLocation?.longitude || userLocation?.longitude}
                        initialAddress={bookingAddress}
                        height="260px"
                        title="Set Your Doorstep Location"
                        helpText="Drag marker or click on map to set where the specialist should arrive"
                        onLocationSelect={(loc) => {
                          setBookingLocation(loc);
                          setBookingAddress(loc.address);
                        }}
                      />
                    </div>
                  )}
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
                    style={{ fontWeight: 750 }}
                  >
                    <Send size={16} />
                    {bookingSubmitting ? 'Sending Request...' : 'Confirm & Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Professional Profile View Modal */}
      {viewingProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                  }}
                >
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

              <div className="grid-3" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
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
                  <span>{viewingProfile.address || currentCity}</span>
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
                style={{ fontWeight: 750 }}
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
