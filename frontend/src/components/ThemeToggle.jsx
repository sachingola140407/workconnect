import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';

export default function ThemeToggle({ variant = 'segmented', size = 'md' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Laptop },
  ];

  if (variant === 'segmented') {
    return (
      <div
        className="theme-segmented-control"
        role="group"
        aria-label="Theme mode selector"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--theme-toggle-bg, rgba(0, 0, 0, 0.05))',
          borderRadius: '999px',
          padding: '3px',
          border: '1px solid var(--border)',
          gap: '2px',
        }}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              title={`${opt.label} mode`}
              aria-label={`${opt.label} mode`}
              aria-pressed={isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: isActive ? 'var(--theme-toggle-active-bg, #ff6a00)' : 'transparent',
                color: isActive
                  ? '#ffffff'
                  : 'var(--text-muted)',
                padding: size === 'sm' ? '0.28rem 0.55rem' : '0.35rem 0.65rem',
                borderRadius: '999px',
                fontSize: size === 'sm' ? '0.75rem' : '0.825rem',
                fontWeight: isActive ? 750 : 600,
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 2px 6px rgba(255, 106, 0, 0.3)' : 'none',
              }}
            >
              <Icon size={size === 'sm' ? 13 : 15} />
              <span className="theme-toggle-label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact dropdown variant
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label="Toggle color theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.65rem',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          fontSize: '0.85rem',
          fontWeight: 650,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <CurrentIcon size={16} color="var(--primary)" />
        <span style={{ textTransform: 'capitalize' }}>{theme}</span>
        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '115%',
            right: 0,
            minWidth: '150px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            padding: '0.4rem',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTheme(opt.key);
                  setDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isSelected ? 750 : 550,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon size={15} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
