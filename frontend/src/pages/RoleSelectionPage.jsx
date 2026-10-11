import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import MobileStatusBar from '../components/MobileStatusBar';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState('professional');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === 'professional') {
      navigate('/register?role=professional');
    } else {
      navigate('/register?role=customer');
    }
  };

  return (
    <div className="sabfix-app-wrapper">
      <div className="sabfix-mobile-shell" style={{ paddingBottom: '2rem' }}>
        <MobileStatusBar />

        {/* Header Block */}
        <div style={{ textAlign: 'center', padding: '1.25rem 1.5rem 0.5rem' }}>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              margin: '0 0 0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Join SabFix
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-muted)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Start earning with your skills
          </p>
        </div>

        {/* Hero Technician Image */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem 1.5rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '300px',
              height: '240px',
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#fff4ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(255, 106, 0, 0.1)',
            }}
          >
            <img
              src="/hero-technician.png"
              alt="Join SabFix Professional"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
              onError={(e) => {
                e.target.src = '/pro-arrived-avatar.png';
              }}
            />
          </div>
        </div>

        {/* Role Cards Container */}
        <div
          style={{
            padding: '0.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {/* Customer Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 1rem',
                borderRadius: '18px',
                backgroundColor: selectedRole === 'customer' ? '#fff4ea' : '#ffffff',
                border: `2px solid ${selectedRole === 'customer' ? '#ff6a00' : '#eae5dd'}`,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: selectedRole === 'customer' ? '#ff6a00' : '#f1ede6',
                  color: selectedRole === 'customer' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <User size={22} />
              </div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                I'm a Customer
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Book home services
              </span>
            </button>

            {/* Professional Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('professional')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 1rem',
                borderRadius: '18px',
                backgroundColor: selectedRole === 'professional' ? '#fff4ea' : '#ffffff',
                border: `2px solid ${selectedRole === 'professional' ? '#ff6a00' : '#eae5dd'}`,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: selectedRole === 'professional' ? '#ff6a00' : '#f1ede6',
                  color: selectedRole === 'professional' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <Briefcase size={22} />
              </div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                I'm a Professional
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Offer my services
              </span>
            </button>
          </div>

          {/* Continue CTA Button */}
          <button
            type="button"
            onClick={handleContinue}
            style={{
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '1rem',
              boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
