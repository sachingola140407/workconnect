// Unified Geolocation Engine for Web and Capacitor Android Native
// Strict real GPS only - zero fake/random coordinates (Prompt 2 Section 2 & 21)

export async function getDevicePosition(options = {}) {
  const opts = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 3000,
    ...options,
  };

  // 1. Capacitor Native Geolocation (if running inside Android APK)
  if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Geolocation) {
    try {
      const pos = await window.Capacitor.Plugins.Geolocation.getCurrentPosition(opts);
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: pos.timestamp || Date.now(),
      };
    } catch (capErr) {
      console.warn('[Capacitor GPS] Native geolocation fallback to browser:', capErr);
    }
  }

  // 2. Standard Web Browser Geolocation
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          let errorMsg = 'Could not get real GPS location.';
          if (err.code === 1) {
            errorMsg = 'Location permission was denied. Please allow location access to find nearby services.';
          } else if (err.code === 2) {
            errorMsg = 'GPS is disabled or unavailable. Please enable device location/GPS.';
          } else if (err.code === 3) {
            errorMsg = 'Location request timed out. Please retry.';
          }
          reject(new Error(errorMsg));
        },
        opts
      );
    });
  }

  throw new Error('Geolocation is not supported on this browser or device.');
}

/**
 * Live GPS coordinate watcher for Professional tracking (Prompt 2 Section 8 & 21)
 */
export function watchDevicePosition(onSuccess, onError, options = {}) {
  const opts = {
    enableHighAccuracy: true,
    maximumAge: 3000,
    timeout: 10000,
    ...options,
  };

  // 1. Capacitor Native Watch (Android foreground/background)
  if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.Geolocation) {
    let watchHandle = null;
    window.Capacitor.Plugins.Geolocation.watchPosition(opts, (position, err) => {
      if (err) {
        if (onError) onError(err);
      } else if (position) {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp || Date.now(),
        });
      }
    }).then((handle) => {
      watchHandle = handle;
    });

    return () => {
      if (watchHandle && window.Capacitor?.Plugins?.Geolocation?.clearWatch) {
        window.Capacitor.Plugins.Geolocation.clearWatch({ id: watchHandle });
      }
    };
  }

  // 2. Browser watchPosition
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        if (onError) onError(err);
      },
      opts
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }

  return () => {};
}
