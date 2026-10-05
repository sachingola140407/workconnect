import React from 'react';
import SabFixBrand from './SabFixBrand';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <SabFixBrand size="sm" layout="horizontal" showTagline={true} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} <strong>SabFix</strong> &mdash; On-Demand Local Professional Services &amp; Repairs.
          </div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.785rem' }}>
            Get It Fixed. Fast &bull; Reliable &bull; Verified Local Technicians &bull; 100% Transparent Pricing
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} /> SabFix Verified Network
          </span>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Support: <a href="mailto:support@sabfix.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@sabfix.in</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
