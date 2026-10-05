import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  // Initialize from localStorage if saved, else default to Agra or Delhi NCR
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('fixigo_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved location from localStorage:', e);
    }
    // Default initial location: Agra
    return {
      latitude: 27.1767,
      longitude: 78.0081,
      city: 'Agra',
      address: 'Sanjay Place, Agra, Uttar Pradesh',
      isGps: false,
    };
  });

  const [currentCity, setCurrentCity] = useState(() => userLocation?.city || 'Agra');
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [statusMessage, setStatusMessage] = useState(null);
  const [hasPromptedInitial, setHasPromptedInitial] = useState(false);

  // Reverse geocode lat/lng to readable address & city using Nominatim
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (!res.ok) throw new Error('Geocoding service unavailable');
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
        'My Location';

      const fullAddress =
        data.display_name ||
        [addr.road, addr.suburb, cityName, addr.state].filter(Boolean).join(', ');

      return {
        city: cityName,
        address: fullAddress,
      };
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      // Fallback: Check if closest to any popular city
      let closest = POPULAR_CITIES[0];
      let minDistance = Infinity;
      for (const city of POPULAR_CITIES) {
        const d = Math.hypot(city.latitude - latitude, city.longitude - longitude);
        if (d < minDistance) {
          minDistance = d;
          closest = city;
        }
      }
      return {
        city: closest.name,
        address: `${closest.name}, Local Area`,
      };
    }
  }, []);

  // Set location directly (manual or city select)
  const setManualLocation = useCallback((cityInput, coords = null) => {
    let newLoc;
    if (coords && coords.latitude && coords.longitude) {
      newLoc = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: coords.city || cityInput || 'Selected Location',
        address: coords.address || `${cityInput || 'Selected Location'}`,
        isGps: false,
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
        };
      } else {
        newLoc = {
          latitude: 27.1767,
          longitude: 78.0081,
          city: cityInput || 'Agra',
          address: `${cityInput || 'Agra'}, Local Area`,
          isGps: false,
        };
      }
    }

    setUserLocation(newLoc);
    setCurrentCity(newLoc.city);
    localStorage.setItem('fixigo_user_location', JSON.stringify(newLoc));
    setStatusMessage(`📍 Location set to ${newLoc.city}`);
    return newLoc;
  }, []);

  // Detect GPS location with browser Geolocation API
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

            // Reverse geocode to get city and address
            const geo = await reverseGeocode(latitude, longitude);

            const detectedLocation = {
              latitude,
              longitude,
              city: geo.city,
              address: geo.address,
              isGps: true,
            };

            setUserLocation(detectedLocation);
            setCurrentCity(geo.city);
            localStorage.setItem('fixigo_user_location', JSON.stringify(detectedLocation));
            setIsDetecting(false);
            setStatusMessage(`📍 Location detected: ${geo.city}`);
            resolve(detectedLocation);
          },
          (err) => {
            console.warn('Geolocation permission or lookup error:', err);
            setIsDetecting(false);
            if (err.code === 1) {
              setPermissionState('denied');
              setStatusMessage('Location permission denied. You can select your city manually.');
            } else {
              setStatusMessage('Could not retrieve GPS coordinates. Using selected location.');
            }
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });
    },
    [reverseGeocode]
  );

  // When web application starts up: automatically query permission and prompt location detection
  useEffect(() => {
    if (hasPromptedInitial) return;
    setHasPromptedInitial(true);

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          setPermissionState(permission.state);
          // If already granted, auto-detect immediately
          if (permission.state === 'granted') {
            detectLocation(true);
          } else {
            // Prompt user for location on startup as requested
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
          // If permission query not supported, attempt detection directly
          detectLocation(false);
        });
    } else {
      detectLocation(false);
    }
  }, [detectLocation, hasPromptedInitial]);

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
