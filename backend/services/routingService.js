// OSRM Real-Time Road Routing and ETA Service
// Calculates road travel distance, driving ETA, and exact turn-by-turn road polyline

/**
 * Calculate Haversine distance in KM
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Calculate real road travel ETA, driving distance, and route geometry
 * @param {Object} proLoc { latitude, longitude }
 * @param {Object} custLoc { latitude, longitude }
 * @returns {Promise<Object>} { distanceKm, etaMinutes, routeCoordinates }
 */
async function calculateETA(proLoc, custLoc) {
  if (!proLoc || !custLoc || !proLoc.latitude || !proLoc.longitude || !custLoc.latitude || !custLoc.longitude) {
    return {
      distanceKm: 0,
      etaMinutes: 0,
      routeCoordinates: [],
    };
  }

  const proLat = parseFloat(proLoc.latitude);
  const proLng = parseFloat(proLoc.longitude);
  const custLat = parseFloat(custLoc.latitude);
  const custLng = parseFloat(custLoc.longitude);

  const straightLineKm = haversineDistanceKm(proLat, proLng, custLat, custLng);

  // If already at customer doorstep (< 50 meters)
  if (straightLineKm <= 0.05) {
    return {
      distanceKm: straightLineKm,
      etaMinutes: 1,
      routeCoordinates: [[proLat, proLng], [custLat, custLng]],
      arrived: true,
    };
  }

  // 1. Primary: OSRM Public Routing API for realistic road network
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${proLng},${proLat};${custLng},${custLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const etaMinutes = Math.max(1, Math.round(route.duration / 60));

        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const routeCoordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        return {
          distanceKm,
          etaMinutes,
          routeCoordinates,
          arrived: distanceKm <= 0.1, // <= 100 meters
          source: 'osrm',
        };
      }
    }
  } catch (err) {
    // Fall back to road network estimate
  }

  // 2. High-accuracy fallback: Indian city urban road factor (1.32x straight line, 24 km/h avg speed)
  const roadDistanceKm = parseFloat((straightLineKm * 1.32).toFixed(1));
  const avgSpeedKmh = 24; // 24 km/h in Indian traffic
  const etaMinutes = Math.max(2, Math.round((roadDistanceKm / avgSpeedKmh) * 60));

  // Generate 5 intermediate road points for smooth visual polyline
  const routeCoordinates = [];
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = proLat + (custLat - proLat) * fraction;
    const lng = proLng + (custLng - proLng) * fraction;
    routeCoordinates.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]);
  }

  return {
    distanceKm: roadDistanceKm,
    etaMinutes,
    routeCoordinates,
    arrived: straightLineKm <= 0.1,
    source: 'geometric_fallback',
  };
}

module.exports = {
  haversineDistanceKm,
  calculateETA,
};
