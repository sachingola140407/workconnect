import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Zap,
  Wrench,
  Wind,
  Car,
  Hammer,
  Paintbrush,
  Sparkles,
  Cpu,
  Bug,
  Tv,
  Droplets,
  Flame,
  Laptop,
  Truck,
  LayoutGrid,
} from 'lucide-react';

export const ALL_SERVICES_LIST = [
  { id: '1', name: 'Electrician', category: 'Electrician', icon: Zap, iconColor: '#ff6a00', bg: '#fff4ea' },
  { id: '2', name: 'Plumber', category: 'Plumber', icon: Wrench, iconColor: '#0284c7', bg: '#e0f2fe' },
  { id: '3', name: 'AC Repair', category: 'AC Repairer', icon: Wind, iconColor: '#0891b2', bg: '#ecfeff' },
  { id: '4', name: 'Car Mechanic', category: 'Mechanic', icon: Car, iconColor: '#ef4444', bg: '#fef2f2' },
  { id: '5', name: 'Carpenter', category: 'Carpenter', icon: Hammer, iconColor: '#d97706', bg: '#fef3c7' },
  { id: '6', name: 'Painter', category: 'Painter', icon: Paintbrush, iconColor: '#9333ea', bg: '#faf5ff' },
  { id: '7', name: 'Appliance Repair', category: 'Appliance Repairer', icon: Cpu, iconColor: '#10b981', bg: '#ecfdf5' },
  { id: '8', name: 'Cleaning', category: 'Cleaner', icon: Sparkles, iconColor: '#eab308', bg: '#fefce8' },
  { id: '9', name: 'Pest Control', category: 'Pest Control', icon: Bug, iconColor: '#dc2626', bg: '#fef2f2' },
  { id: '10', name: 'TV Repair', category: 'TV Repair', icon: Tv, iconColor: '#2563eb', bg: '#eff6ff' },
  { id: '11', name: 'RO Repair', category: 'RO Repair', icon: Droplets, iconColor: '#06b6d4', bg: '#ecfeff' },
  { id: '12', name: 'Geyser Repair', category: 'Geyser Repair', icon: Flame, iconColor: '#ea580c', bg: '#fff7ed' },
  { id: '13', name: 'Laptop Repair', category: 'Laptop Repair', icon: Laptop, iconColor: '#7c3aed', bg: '#f5f3ff' },
  { id: '14', name: 'Home Shifting', category: 'Home Shifting', icon: Truck, iconColor: '#e11d48', bg: '#fff1f2' },
  { id: '15', name: 'More Services', category: 'all', icon: LayoutGrid, iconColor: '#475569', bg: '#f1f5f9' },
];

export default function AllServicesModal({ isOpen, onClose, onSelectService }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = ALL_SERVICES_LIST.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem 1.25rem 2.5rem',
        }}
      >
        {/* Top Header Row with Back Button & Centered Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #eae5dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            All Services
          </h2>

          <div style={{ width: '36px' }} />
        </div>

        {/* Search Input Bar with Filter Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '10px 14px',
            border: '1px solid #eae5dd',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '1.5rem',
          }}
        >
          <Search size={18} color="var(--text-light)" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.92rem',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* 3-Column Services Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {filtered.map((service) => {
            const IconComponent = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  if (onSelectService) onSelectService(service);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eae5dd',
                  borderRadius: '18px',
                  padding: '18px 8px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.03)';
                }}
              >
                {/* Pastel Icon Circle/Square */}
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    backgroundColor: service.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)',
                  }}
                >
                  <IconComponent size={26} color={service.iconColor} strokeWidth={2.2} />
                </div>

                {/* Service Name */}
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1.2,
                  }}
                >
                  {service.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
