import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <strong>WorkConnect</strong> &copy; {new Date().getFullYear()} &mdash; Location-Based Professional Services Platform
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Built with 100% Free & Open-Source Stack: React &bull; Vite &bull; Node &bull; Express &bull; PostgreSQL &bull; PostGIS &bull; Leaflet &bull; OpenStreetMap
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem' }}>
          <span className="badge badge-verified">Phase 1: Auth & User Roles</span>
          <span>Zero Paid APIs</span>
        </div>
      </div>
    </footer>
  );
}
