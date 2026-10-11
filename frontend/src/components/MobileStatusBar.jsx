import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

export default function MobileStatusBar({ light = false }) {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
      setTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mobile-status-bar"
      style={{
        color: light ? '#ffffff' : 'var(--text-main)',
      }}
    >
      <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.02em', minWidth: '38px' }}>
        {time}
      </span>

      {/* Modern Dynamic Island Notch */}
      <div className="dynamic-island" />

      {/* Status Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>5G</span>
        <Wifi size={14} strokeWidth={2.5} />
        <Battery size={16} strokeWidth={2.5} />
      </div>
    </div>
  );
}
