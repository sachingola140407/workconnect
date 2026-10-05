import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Star, ShieldCheck, Wrench, Plus, Minus } from 'lucide-react';

export default function ServiceExploreMap({
  userLocation,
  professionals = [],
  selectedProId = null,
  onSelectProfessional,
  onRequestBooking,
  onRecenter,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Initialize or re-center map when userLocation changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const userLat = userLocation?.latitude || 27.1767;
    const userLng = userLocation?.longitude || 78.0081;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 14,
        zoomControl: false, // We render custom zoom controls matching reference image
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView([userLat, userLng], 14);
    }

    return () => {
      // Map cleanup on unmount
    };
  }, []);

  // Update User Pin & Radar Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const userLat = userLocation?.latitude || 27.1767;
    const userLng = userLocation?.longitude || 78.0081;

    // 1. Remove previous user marker and circle if any
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // 2. Add Soft Blue 10 KM Coverage Circle (Prompt 2 Section 4)
    const circle = L.circle([userLat, userLng], {
      radius: 10000, // 10 KM service boundary
      color: '#2563eb',
      weight: 2,
      opacity: 0.6,
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      dashArray: '6, 6',
    }).addTo(map);
    circleRef.current = circle;

    // 3. User Location Center Pin
    const userPinIcon = L.divIcon({
      className: 'custom-user-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: #2563eb; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(37,99,235,0.45); border: 3px solid #ffffff; font-size: 20px; z-index: 20;">
            🏠
          </div>
          <div style="background: #1e40af; color: white; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; margin-top: 4px; border: 1.5px solid white;">
            Your Location
          </div>
          <div style="position: absolute; top: -6px; left: -6px; width: 56px; height: 56px; border-radius: 50%; background: rgba(37,99,235,0.25); animation: pulse 2.2s infinite; z-index: 10;"></div>
        </div>
      `,
      iconSize: [85, 75],
      iconAnchor: [42, 22],
    });

    const userMarker = L.marker([userLat, userLng], {
      icon: userPinIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    userMarkerRef.current = userMarker;
  }, [userLocation]);

  // Update Professional Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;

    // Clear existing pro markers
    group.clearLayers();

    professionals.forEach((pro) => {
      if (!pro.latitude || !pro.longitude) return;

      const isSelected = selectedProId === pro.id;
      const serviceName = pro.services?.[0]?.name || 'Specialist';
      const distanceText = pro.distance_km !== null ? `${pro.distance_km} km` : 'Nearby';

      // Custom marker matching Fixigo reference layout
      const proIcon = L.divIcon({
        className: `pro-map-pin ${isSelected ? 'selected' : ''}`,
        html: `
          <div style="cursor: pointer; display: flex; align-items: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.18)); transition: transform 0.2s ease;">
            <!-- Avatar Pin -->
            <div style="position: relative; z-index: 2;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: ${
                isSelected ? '#2563eb' : '#0284c7'
              }; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                ${pro.name.charAt(0).toUpperCase()}
              </div>
              <div style="position: absolute; bottom: -4px; right: -4px; width: 14px; height: 14px; background: #10b981; border: 2px solid white; border-radius: 50%;"></div>
            </div>

            <!-- Attached Pill Label -->
            <div style="background: white; border: 1.5px solid ${
              isSelected ? '#2563eb' : '#cbd5e1'
            }; padding: 3px 8px 3px 12px; margin-left: -8px; border-radius: 0 999px 999px 0; display: flex; flex-direction: column; justify-content: center; min-width: 80px; z-index: 1;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; white-space: nowrap; line-height: 1.1;">
                ${pro.name}
              </div>
              <div style="font-size: 9.5px; color: #2563eb; font-weight: 700; line-height: 1.1;">
                ${serviceName}
              </div>
              <div style="font-size: 9px; color: #64748b; font-weight: 600; line-height: 1.1;">
                ${distanceText}
              </div>
            </div>
          </div>
        `,
        iconSize: [140, 44],
        iconAnchor: [19, 22],
      });

      const marker = L.marker([pro.latitude, pro.longitude], {
        icon: proIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      // Popup on click with Request Service button
      const popupHtml = `
        <div style="font-family: inherit; padding: 2px 0; min-width: 190px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <strong style="font-size: 13px; color: #0f172a;">${pro.name}</strong>
            ${pro.is_verified ? '<span style="color: #16a34a; font-size: 11px; font-weight: 700;">✓ Verified</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #2563eb; font-weight: 700; margin-bottom: 6px;">
            ${serviceName} &bull; ★ ${pro.rating.toFixed(1)} (${pro.review_count})
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">
            <span>Hourly: <strong style="color: #2563eb;">₹${pro.price}/hr</strong></span>
            <span>Fee: <strong style="color: #059669;">₹${pro.visiting_charge || 99}</strong></span>
          </div>
          <button 
            id="book-pro-${pro.id}" 
            style="width: 100%; background: #2563eb; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;"
          >
            Request Service
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { offset: [0, -10] });

      marker.on('click', () => {
        if (onSelectProfessional) {
          onSelectProfessional(pro);
        }
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-pro-${pro.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onRequestBooking) onRequestBooking(pro);
          };
        }
      });

      group.addLayer(marker);
    });

    // If a professional is specifically selected, center on them slightly
    if (selectedProId) {
      const activePro = professionals.find((p) => p.id === selectedProId);
      if (activePro && activePro.latitude && activePro.longitude) {
        map.panTo([activePro.latitude, activePro.longitude], { animate: true });
      }
    }
  }, [professionals, selectedProId, onSelectProfessional, onRequestBooking]);

  // Map Controls Helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleCenterUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo(
        [userLocation.latitude || 27.1767, userLocation.longitude || 78.0081],
        14,
        { duration: 1 }
      );
    }
    if (onRecenter) onRecenter();
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        minHeight: '410px',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Top-Left: "Show on Map" floating indicator badge (matching reference image) */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #cbd5e1',
          padding: '0.4rem 0.85rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          fontSize: '0.825rem',
          fontWeight: 700,
          color: '#1e40af',
          pointerEvents: 'none',
        }}
      >
        <MapPin size={15} color="#2563eb" />
        <span>Show on Map</span>
      </div>

      {/* Top-Right: Custom Controls (+, -, Recenter) matching reference image */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: '34px',
              height: '34px',
              background: 'white',
              border: 'none',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: '34px',
              height: '34px',
              background: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            <Minus size={16} />
          </button>
        </div>

        <button
          onClick={handleCenterUser}
          title="Center My Location"
          style={{
            width: '34px',
            height: '34px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
