import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card">
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderRadius: '50%', marginBottom: '1.25rem' }}>
            <HelpCircle size={40} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem' }}>
            Page Not Found (404)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            The requested page does not exist or has been moved.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={16} /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
