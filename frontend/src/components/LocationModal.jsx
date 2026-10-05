import React, { useState, useEffect } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { MapPin, Navigation, Check, X, Shield } from 'lucide-react';

export default function LocationModal() {
  const {
    userLocation,
    currentCity,
    permissionState,
    isDetecting,
    detectLocation,
    setManualLocation,
    popularCities,
  } = useLocationContext();

  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already granted location or explicitly dismissed it
    const dismissed = sessionStorage.getItem('fixigo_location_modal_dismissed');
    if (dismissed) {
      setHasDismissed(true);
      return;
    }

    // If permission is still 'prompt' or user doesn't have GPS verified location, prompt once cleanly
    if (!userLocation?.isGps && permissionState !== 'granted') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [userLocation, permissionState]);

  const handleAllowGPS = async () => {
    const loc = await detectLocation(false);
    if (loc) {
      setIsOpen(false);
      sessionStorage.setItem('fixigo_location_modal_dismissed', 'true');
    }
  };

  const handleSelectCity = (city) => {
    setManualLocation(city.name, {
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
      address: city.defaultAddress,
    });
    setIsOpen(false);
    sessionStorage.setItem('fixigo_location_modal_dismissed', 'true');
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('fixigo_location_modal_dismissed', 'true');
  };

  if (!isOpen || hasDismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2rem 1.75rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <MapPin size={28} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Allow Location Access
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem', lineHeight: '1.5' }}>
            Fixigo uses your location to discover and map verified plumbers, electricians, and technicians nearest to you in real-time.
          </p>
        </div>

        {/* Primary Action: Detect GPS Location */}
        <button
          onClick={handleAllowGPS}
          disabled={isDetecting}
          className="btn btn-primary btn-block btn-lg"
          style={{
            height: '48px',
            fontSize: '0.95rem',
            fontWeight: 750,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            marginBottom: '1.25rem',
          }}
        >
          <Navigation size={18} className={isDetecting ? 'spin' : ''} />
          {isDetecting ? 'Detecting Your Location...' : 'Allow GPS Location (Recommended)'}
        </button>

        {/* Or Select Popular City */}
        <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
          <div style={{ height: '1px', background: '#e2e8f0', width: '100%' }}></div>
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 12px', fontSize: '0.775rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Or Select Your City
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {popularCities.slice(0, 6).map((city) => (
            <button
              key={city.name}
              onClick={() => handleSelectCity(city)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: currentCity === city.name ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                background: currentCity === city.name ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: currentCity === city.name ? '#2563eb' : '#1e293b', display: 'block' }}>
                  {city.name}
                </strong>
                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{city.state}</span>
              </div>
              {currentCity === city.name && <Check size={14} color="#2563eb" />}
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <Shield size={13} color="#10b981" />
          <span>Your location is private and only used for service distance matching</span>
        </div>
      </div>
    </div>
  );
}
