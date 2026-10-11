import React, { useEffect, useState } from 'react';
import MobileStatusBar from './MobileStatusBar';

export default function SabFixSplash({ onDismiss, autoDismissTimeout = 1800 }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (autoDismissTimeout > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissTimeout);
      return () => clearTimeout(timer);
    }
  }, [autoDismissTimeout]);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 350);
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 2rem',
        cursor: 'pointer',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(1.02)' : 'scale(1)',
        overflow: 'hidden',
      }}
    >
      {/* Top Mobile Status Bar */}
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <MobileStatusBar />
      </div>

      {/* Decorative Warm Orange Waves in Background */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-15%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 106, 0, 0.08) 0%, rgba(255, 247, 237, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Center Logo Block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          maxWidth: '380px',
          textAlign: 'center',
        }}
      >
        <img
          src="/RealSabFix.png"
          alt="SabFix - Get It Fixed"
          style={{
            width: '100%',
            maxWidth: '280px',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 24px rgba(255, 106, 0, 0.18))',
            animation: 'sabfix-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
          onError={(e) => {
            e.target.src = '/Logo_Sabfix.png';
          }}
        />

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ff6a00',
              animation: 'sabfix-pulse 1.2s infinite ease-in-out',
            }}
          />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '0.05em',
            }}
          >
            Tap anywhere to continue
          </span>
        </div>
      </div>

      {/* Bottom Orange Wave Curve */}
      <div
        style={{
          width: '100%',
          height: '140px',
          background: 'linear-gradient(180deg, rgba(255, 106, 0, 0) 0%, rgba(255, 106, 0, 0.15) 100%)',
          borderTopLeftRadius: '50% 30px',
          borderTopRightRadius: '50% 30px',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
