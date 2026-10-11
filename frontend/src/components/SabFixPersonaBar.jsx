import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Briefcase, Shield, UserCheck, Sparkles, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function SabFixPersonaBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Quick Switcher handler
  const handleQuickPersona = async (personaRole) => {
    if (personaRole === 'customer') {
      if (user?.role !== 'customer') {
        try {
          await login('customer@workconnect.com', 'Password@123');
        } catch (e) {}
      }
      navigate('/');
    } else if (personaRole === 'nearby') {
      navigate('/services?category=Electrician');
    } else if (personaRole === 'pro') {
      // If not logged in as pro, auto-login with seed pro or navigate
      if (user?.role !== 'professional') {
        try {
          await login('rohit@example.com', 'Password@123');
        } catch (e) {
          try {
            await login('vivek.electrician@sabfix.com', 'Password@123');
          } catch (err) {}
        }
      }
      navigate('/professional');
    } else if (personaRole === 'admin') {
      // If not logged in as admin, auto-login with admin or navigate
      if (user?.role !== 'admin') {
        try {
          await login('admin@sabfix.com', 'Admin@123');
        } catch (e) {}
      }
      navigate('/admin');
    } else if (personaRole === 'role-select') {
      navigate('/role-select');
    } else if (personaRole === 'splash') {
      sessionStorage.removeItem('sabfix_splash_shown');
      window.location.href = '/';
    }
  };

  const currentPath = location.pathname;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: '#0b1320',
        borderBottom: '1.5px solid #ff6a00',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Brand Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: '#ff6a00',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 900,
              padding: '2px 6px',
              borderRadius: '6px',
              letterSpacing: '0.05em',
            }}
          >
            SABFIX TESTER
          </span>
          <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
            Active: <strong style={{ color: '#fff' }}>{user?.role?.toUpperCase() || 'GUEST'}</strong> ({user?.name || 'Visitor'})
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleQuickPersona('customer')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: currentPath === '/' ? '#ff6a00' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Smartphone size={12} /> 1. Customer Home
          </button>

          <button
            onClick={() => handleQuickPersona('nearby')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: currentPath.startsWith('/services') ? '#ff6a00' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={12} /> 2. Nearby Pros
          </button>

          <button
            onClick={() => handleQuickPersona('pro')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: currentPath === '/professional' ? '#ff6a00' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Briefcase size={12} /> 3. Pro Dashboard (Screens 5-10)
          </button>

          <button
            onClick={() => handleQuickPersona('admin')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: currentPath === '/admin' ? '#ff6a00' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Shield size={12} /> 4. Admin Command Center
          </button>

          <button
            onClick={() => handleQuickPersona('role-select')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: currentPath === '/role-select' ? '#ff6a00' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UserCheck size={12} /> Role Select
          </button>

          <button
            onClick={() => handleQuickPersona('splash')}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={12} /> Replay Splash
          </button>

          <button
            onClick={() => {
              const current = localStorage.getItem('sabfix_custom_api_url') || 'http://192.168.1.12:5000';
              const input = prompt('Enter SabFix Backend Server URL (e.g. http://192.168.1.12:5000):', current);
              if (input !== null) {
                if (input.trim()) {
                  localStorage.setItem('sabfix_custom_api_url', input.trim());
                } else {
                  localStorage.removeItem('sabfix_custom_api_url');
                }
                window.location.reload();
              }
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(56, 189, 248, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🌐 Server: 192.168.1.12
          </button>
        </div>
      </div>
    </div>
  );
}
