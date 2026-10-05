import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const LocationContext = createContext(null);

// Known predefined Indian hub cities with coordinates
export const POPULAR_CITIES = [
  { name: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081, defaultAddress: 'Sanjay Place, Agra' },
  { name: 'Delhi NCR', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, defaultAddress: 'Connaught Place, New Delhi' },
  { name: 'Connaught Place', state: 'New Delhi', latitude: 28.6315, longitude: 77.2167, defaultAddress: 'Connaught Place, New Delhi' },
  { name: 'South Extension', state: 'New Delhi', latitude: 28.5729, longitude: 77.2215, defaultAddress: 'South Extension, New Delhi' },
  { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, defaultAddress: 'Bandra West, Mumbai' },
  { name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, defaultAddress: 'Koramangala, Bangalore' },
  { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, defaultAddress: 'MI Road, Jaipur' },
  { name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, defaultAddress: 'Hazratganj, Lucknow' },
];

export function LocationProvider({ children }) {
  // Initialize from localStorage if saved, else default to Agra
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('getix_user_location') || localStorage.getItem('fixigo_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved location from localStorage:', e);
    }
    return {
      latitude: 27.1767,
      longitude: 78.0081,
      city: 'Agra',
      address: 'Sanjay Place, Agra, Uttar Pradesh',
      isGps: false,
      isDetected: false,
    };
  });

  const [currentCity, setCurrentCity] = useState(() => userLocation?.city || 'Agra');
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [statusMessage, setStatusMessage] = useState(null);
  const hasTriggeredRef = useRef(false);

  // High-accuracy reverse geocoding (BigDataCloud + Nominatim fallback)
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    // 1. Primary: BigDataCloud client reverse geocode (fast, no CORS restriction, highly accurate across India)
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (bdcRes.ok) {
        const data = await bdcRes.json();
        const cityName =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          'Your Location';
        const address =
          [data.locality, data.city, data.principalSubdivision, data.countryName]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(', ') || `${cityName}, Local Area`;

        return {
          city: cityName,
          address,
        };
      }
    } catch (e) {
      console.warn('BigDataCloud reverse geocoding failed, trying Nominatim fallback:', e);
    }

    // 2. Secondary fallback: Nominatim OpenStreetMap
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const cityName =
          addr.city ||
          addr.town ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.county ||
          addr.state_district ||
          addr.state ||
          'Your Location';

        const fullAddress =
          data.display_name ||
          [addr.road, addr.suburb, cityName, addr.state].filter(Boolean).join(', ');

        return {
          city: cityName,
          address: fullAddress,
        };
      }
    } catch (err) {
      console.warn('Nominatim fallback also failed:', err);
    }

    return {
      city: 'Your Location',
      address: `GPS Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
    };
  }, []);

  // Set location directly (manual or city select)
  const setManualLocation = useCallback((cityInput, coords = null) => {
    let newLoc;
    if (coords && coords.latitude && coords.longitude) {
      newLoc = {
        latitude: parseFloat(coords.latitude),
        longitude: parseFloat(coords.longitude),
        city: coords.city || cityInput || 'Selected City',
        address: coords.address || `${cityInput || 'Selected City'} Area`,
        isGps: false,
        isDetected: true,
      };
    } else {
      const match = POPULAR_CITIES.find(
        (c) => c.name.toLowerCase() === (cityInput || '').toLowerCase()
      );
      if (match) {
        newLoc = {
          latitude: match.latitude,
          longitude: match.longitude,
          city: match.name,
          address: match.defaultAddress,
          isGps: false,
          isDetected: true,
        };
      } else {
        newLoc = {
          latitude: 27.1767,
          longitude: 78.0081,
          city: cityInput || 'Agra',
          address: `${cityInput || 'Agra'}, Local Area`,
          isGps: false,
          isDetected: true,
        };
      }
    }

    setUserLocation(newLoc);
    setCurrentCity(newLoc.city);
    localStorage.setItem('getix_user_location', JSON.stringify(newLoc));
    setStatusMessage(`📍 Location set to ${newLoc.city}`);
    return newLoc;
  }, []);

  // 1. Lightning-fast IP-based location auto-detection (~150ms)
  const detectIpLocation = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          const detectedCity = data.city || 'Agra';
          const detectedAddress = `${detectedCity}, ${data.region || 'Uttar Pradesh'}`;
          const loc = {
            latitude: data.latitude,
            longitude: data.longitude,
            city: detectedCity,
            address: detectedAddress,
            isGps: false,
            isDetected: true,
          };

          // Only update if not already set by high precision GPS
          setUserLocation((prev) => {
            if (prev?.isGps) return prev;
            localStorage.setItem('getix_user_location', JSON.stringify(loc));
            return loc;
          });
          setCurrentCity((prev) => (userLocation?.isGps ? prev : detectedCity));
          setStatusMessage(`📍 Location auto-detected: ${detectedCity}`);
          return loc;
        }
      }
    } catch (e) {
      console.warn('IP location detection skipped:', e.message);
    }
    return null;
  }, [userLocation?.isGps]);

  // 2. High-precision Browser GPS Geolocation
  const detectLocation = useCallback(
    async (silent = false) => {
      if (!navigator.geolocation) {
        setStatusMessage('Geolocation is not supported by your browser.');
        setPermissionState('denied');
        return null;
      }

      setIsDetecting(true);
      if (!silent) setStatusMessage('Requesting GPS location access...');

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setPermissionState('granted');

            // Set coordinates immediately without waiting
            let initialCity = currentCity || 'Agra';
            const initialLoc = {
              latitude,
              longitude,
              city: initialCity,
              address: `GPS Location (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
              isGps: true,
              isDetected: true,
            };

            setUserLocation(initialLoc);
            localStorage.setItem('getix_user_location', JSON.stringify(initialLoc));
            setIsDetecting(false);
            setStatusMessage(`📍 GPS Location verified (${initialCity})`);
            resolve(initialLoc);

            // Refine city/locality in background
            try {
              const geo = await reverseGeocode(latitude, longitude);
              if (geo && geo.city) {
                const refinedLoc = {
                  latitude,
                  longitude,
                  city: geo.city,
                  address: geo.address,
                  isGps: true,
                  isDetected: true,
                };
                setUserLocation(refinedLoc);
                setCurrentCity(geo.city);
                localStorage.setItem('getix_user_location', JSON.stringify(refinedLoc));
                setStatusMessage(`📍 GPS Location verified: ${geo.city}`);
              }
            } catch (err) {}
          },
          (err) => {
            console.warn('Geolocation permission or lookup error:', err);
            setIsDetecting(false);
            if (err.code === 1) {
              setPermissionState('denied');
              setStatusMessage('Location permission denied. Showing nearby services in selected city.');
            } else {
              setStatusMessage('Could not retrieve GPS coordinates. Using network location.');
            }
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000,
          }
        );
      });
    },
    [currentCity, reverseGeocode]
  );

  // AUTO-DETECT ON STARTUP: Run IP auto-detect + browser GPS immediately upon app load
  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // 1. Run instant IP auto-detection (super fast, non-blocking)
    detectIpLocation();

    // 2. Query permissions and trigger GPS prompt
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          setPermissionState(permission.state);
          // If already granted, auto-detect GPS immediately
          if (permission.state === 'granted') {
            detectLocation(true);
          } else {
            detectLocation(false);
          }

          permission.onchange = () => {
            setPermissionState(permission.state);
            if (permission.state === 'granted') {
              detectLocation(true);
            }
          };
        })
        .catch(() => {
          detectLocation(false);
        });
    } else {
      detectLocation(false);
    }
  }, [detectIpLocation, detectLocation]);

  const value = {
    userLocation,
    currentCity,
    isDetecting,
    permissionState,
    statusMessage,
    detectLocation,
    setManualLocation,
    reverseGeocode,
    popularCities: POPULAR_CITIES,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
