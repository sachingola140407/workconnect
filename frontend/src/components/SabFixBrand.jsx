import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SabFix Brand Component
 * Replicates the exact visual identity from RealSabFix.png:
 * - Logo Mark (/Logo_Sabfix.png or /sabfix-icon-clean.png)
 * - "Sab" in bold dark text (switches to white in dark mode)
 * - "Fix" in bold vibrant orange (#FF6A00)
 * - Tagline "— Get It Fixed. —" with orange accent lines
 */
export default function SabFixBrand({
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'mark-only' | 'text-only'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  to = '/',
  clickable = true,
  className = '',
}) {
  // Dimensions based on size
  const sizes = {
    sm: {
      markWidth: 32,
      markHeight: 22,
      fontSize: '1.25rem',
      taglineSize: '0.62rem',
      gap: '0.5rem',
      dashWidth: '12px',
    },
    md: {
      markWidth: 44,
      markHeight: 30,
      fontSize: '1.6rem',
      taglineSize: '0.72rem',
      gap: '0.65rem',
      dashWidth: '16px',
    },
    lg: {
      markWidth: 64,
      markHeight: 44,
      fontSize: '2.1rem',
      taglineSize: '0.85rem',
      gap: '0.85rem',
      dashWidth: '22px',
    },
    xl: {
      markWidth: 96,
      markHeight: 65,
      fontSize: '3rem',
      taglineSize: '1.05rem',
      gap: '1.1rem',
      dashWidth: '32px',
    },
  };

  const s = sizes[size] || sizes.md;

  const logoMark = (
    <div
      className="sabfix-logo-mark-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <img
        src="/Logo_Sabfix.png"
        alt="SabFix Logo"
        style={{
          width: `${s.markWidth}px`,
          height: 'auto',
          maxHeight: `${s.markHeight * 1.3}px`,
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 6px rgba(255, 106, 0, 0.2))',
          borderRadius: '6px',
        }}
        onError={(e) => {
          // Fallback to clean transparent icon if needed
          e.target.src = '/sabfix-icon-clean.png';
        }}
      />
    </div>
  );

  const brandName = (
    <div
      className="sabfix-brand-text-block"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: layout === 'vertical' ? 'center' : 'flex-start',
        lineHeight: 1,
      }}
    >
      <div
        className="sabfix-name"
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          fontSize: s.fontSize,
          fontWeight: 900,
          letterSpacing: '-0.035em',
          display: 'flex',
          alignItems: 'baseline',
          lineHeight: 1.05,
          userSelect: 'none',
        }}
      >
        <span className="sabfix-word-sab" style={{ color: 'var(--brand-sab-color, #0f172a)' }}>
          Sab
        </span>
        <span
          className="sabfix-word-fix"
          style={{
            background: 'linear-gradient(135deg, #ff7a00 0%, #ff5500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: '#ff6a00',
          }}
        >
          Fix
        </span>
      </div>

      {showTagline && (
        <div
          className="sabfix-tagline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginTop: size === 'sm' ? '1px' : '3px',
            fontSize: s.taglineSize,
            fontWeight: 650,
            letterSpacing: '0.14em',
            textTransform: 'none',
            color: 'var(--brand-tagline-color, #334155)',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: s.dashWidth,
              height: '1.5px',
              backgroundColor: '#ff6a00',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          <span style={{ whiteSpace: 'nowrap' }}>Get It Fixed.</span>
          <span
            style={{
              width: s.dashWidth,
              height: '1.5px',
              backgroundColor: '#ff6a00',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
        </div>
      )}
    </div>
  );

  const content = (
    <div
      className={`sabfix-brand-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        textDecoration: 'none',
      }}
    >
      {layout !== 'text-only' && logoMark}
      {layout !== 'mark-only' && brandName}
    </div>
  );

  if (clickable) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
}
