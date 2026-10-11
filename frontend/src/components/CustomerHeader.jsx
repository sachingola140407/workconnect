import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, Bell, Moon, Sun, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocationContext } from '../context/LocationContext';
import SabFixBrand from './SabFixBrand';

export default function CustomerHeader({ onOpenLocationModal }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentCity } = useLocationContext();
  const navigate = useNavigate();

  const isCapacitor =
    typeof window !== 'undefined' &&
    (window.Capacitor !== undefined || window.location.protocol === 'capacitor:');

  return (
    <header style={{ padding: '0.5rem 1rem 0.75rem', backgroundColor: 'transparent' }}>
      {/* Top Location & Settings Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        {/* Location Dropdown */}
        <button
          type="button"
          onClick={() => {
            if (onOpenLocationModal) onOpenLocationModal();
            else window.dispatchEvent(new Event('open-location-modal'));
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '8px',
            color: 'var(--text-main)',
          }}
        >
          <MapPin size={18} color="#ff6a00" />
          <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>
            {currentCity || 'Greater Noida'}
          </span>
          <ChevronDown size={15} color="var(--text-light)" />
        </button>

        {/* Right Row: Install App + Theme Pill Toggle + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Install App Button (Visible on Website) */}
          {!isCapacitor && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('sabfix:open-install-modal'))}
              title="Install SabFix Mobile App"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(255, 106, 0, 0.12)',
                color: '#ff6a00',
                border: '1px solid rgba(255, 106, 0, 0.3)',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Smartphone size={13} strokeWidth={2.5} />
              <span>Install App</span>
            </button>
          )}

          {/* Theme Pill Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '24px',
              borderRadius: '9999px',
              backgroundColor: isDark ? '#2a3142' : '#f1ede6',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'pointer',
              padding: '2px',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#ff7a18' : '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isDark ? 'translateX(9px)' : 'translateX(-9px)',
                transition: 'transform 0.2s ease',
              }}
            >
              {isDark ? <Moon size={11} color="#ffffff" /> : <Sun size={11} color="#ff6a00" />}
            </div>
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => navigate(user?.role === 'customer' ? '/customer' : '/login')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              backgroundColor: '#e2e8f0',
            }}
          >
            <img
              src="/pro-arrived-avatar.png"
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Brand Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <SabFixBrand size="md" clickable={true} to="/" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => alert('No new notifications')}
            style={{
              position: 'relative',
              background: '#ffffff',
              border: '1px solid #eae5dd',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ff6a00',
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
