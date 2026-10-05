import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Check, RefreshCw } from 'lucide-react';

export default function LocationPickerMap({
  initialLat,
  initialLng,
  initialAddress = '',
  onLocationSelect,
  height = '320px',
  title = 'Pick Location on Map',
  helpText = 'Click or drag the pin to set your exact location',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: initialLat || 27.1767,
    lng: initialLng || 78.0081,
  });
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Reverse geocode lat/lng to readable address
  const fetchAddress = useCallback(
    async (lat, lng) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: { 'Accept-Language': 'en' },
          }
        );
        if (!res.ok) throw new Error('Failed to resolve address');
        const data = await res.json();
        const display = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddress(display);

        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.suburb ||
          addr.county ||
          addr.state_district ||
          addr.state ||
          '';

        if (onLocationSelect) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: display,
            city,
          });
        }
      } catch (err) {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddress(fallback);
        if (onLocationSelect) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: fallback,
            city: '',
          });
        }
      }
    },
    [onLocationSelect]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const startLat = initialLat || coords.lat;
      const startLng = initialLng || coords.lng;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom high-visibility pin icon
      const customPinIcon = L.divIcon({
        className: 'location-picker-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #ff6a00; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(255,106,0,0.45); border: 3px solid white; font-size: 18px; cursor: grab;">
              📍
            </div>
            <div style="width: 14px; height: 14px; background: rgba(255,106,0,0.4); border-radius: 50%; margin-top: -6px;"></div>
          </div>
        `,
        iconSize: [38, 46],
        iconAnchor: [19, 42],
      });

      const marker = L.marker([startLat, startLng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        fetchAddress(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        fetchAddress(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial address resolve if empty
      if (!initialAddress) {
        fetchAddress(startLat, startLng);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if external initial coordinates change
  useEffect(() => {
    if (initialLat && initialLng && mapInstanceRef.current && markerRef.current) {
      if (Math.abs(coords.lat - initialLat) > 0.0001 || Math.abs(coords.lng - initialLng) > 0.0001) {
        mapInstanceRef.current.setView([initialLat, initialLng], 14);
        markerRef.current.setLatLng([initialLat, initialLng]);
        setCoords({ lat: initialLat, lng: initialLng });
      }
    }
  }, [initialLat, initialLng]);

  // Detect Current GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        fetchAddress(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setSearchError('Could not access GPS. Please choose or search manually.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search Address / City
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);

        setCoords({ lat: newLat, lng: newLng });
        setAddress(item.display_name);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLng], 15, { duration: 1.2 });
          markerRef.current.setLatLng([newLat, newLng]);
        }

        if (onLocationSelect) {
          onLocationSelect({
            latitude: newLat,
            longitude: newLng,
            address: item.display_name,
            city: searchQuery.split(',')[0].trim(),
          });
        }
      } else {
        setSearchError(`No location results found for "${searchQuery}"`);
      }
    } catch (err) {
      setSearchError('Search failed. Check your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* Title & Help Text */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={16} color="var(--primary)" />
            {title}
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{helpText}</span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255, 106, 0, 0.1)', borderColor: 'rgba(255, 106, 0, 0.3)', color: 'var(--primary)' }}
        >
          <Navigation size={13} className={isLocating ? 'spin' : ''} />
          {isLocating ? 'Locating...' : 'Auto-Select My Location (GPS)'}
        </button>
      </div>

      {/* Address Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search locality, city, landmark (e.g. Sanjay Place Agra)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', paddingRight: '2.2rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-secondary btn-sm"
          disabled={isSearching || !searchQuery.trim()}
          style={{ height: '38px', padding: '0 0.85rem' }}
        >
          <Search size={14} />
          {isSearching ? 'Finding...' : 'Search'}
        </button>
      </form>

      {searchError && (
        <div style={{ fontSize: '0.775rem', color: 'var(--danger)', background: 'var(--danger-light)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          {searchError}
        </div>
      )}

      {/* Map Element */}
      <div
        style={{
          height,
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          position: 'relative',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Selected Address & Lat/Lng Feedback */}
      <div style={{ background: 'var(--bg-main)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', marginBottom: '0.25rem' }}>
          <strong style={{ color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Selected Address:</strong>
          <span style={{ color: 'var(--text-muted)', wordBreak: 'break-word' }}>
            {address || 'Move marker on map to select your address'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>Lat: <strong>{coords.lat.toFixed(5)}</strong></span>
          <span>Lng: <strong>{coords.lng.toFixed(5)}</strong></span>
        </div>
      </div>
    </div>
  );
}
