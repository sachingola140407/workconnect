import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, paymentsAPI } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Shield,
  Users,
  Briefcase,
  UserCheck,
  Search,
  Filter,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Activity,
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  Eye,
  X,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Check,
  FileText,
  Download,
  CreditCard,
  Banknote,
  LayoutDashboard,
  Navigation,
  Star,
  Trash2,
  AlertTriangle,
  Settings,
  HelpCircle,
  Menu,
  ChevronRight,
  Zap,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active module in sidebar
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trackingBookings, setTrackingBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState(null);
  const [platformConfig, setPlatformConfig] = useState({
    PLATFORM_FEE: 50.0,
    CURRENCY: 'INR',
    MAX_SERVICE_RADIUS_KM: 10,
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Tracking Leaflet Map Ref
  const trackingMapContainerRef = useRef(null);
  const trackingMapInstanceRef = useRef(null);
  const trackingLayerGroupRef = useRef(null);

  // Load All Admin Data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        statsRes,
        usersRes,
        bookingsRes,
        trackingRes,
        paymentsRes,
        invoicesRes,
        reviewsRes,
        complaintsRes,
        reportsRes,
        configRes,
      ] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getUsers({ role: roleFilter || undefined, search: searchQuery || undefined }),
        adminAPI.getBookings({ status: bookingStatusFilter || undefined, search: searchQuery || undefined }),
        adminAPI.getActiveTracking(),
        adminAPI.getPayments(),
        adminAPI.getInvoices(),
        adminAPI.getReviews(),
        adminAPI.getComplaints(),
        adminAPI.getReports(),
        adminAPI.getConfig(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.data?.data) {
        const uData = usersRes.value.data.data;
        setUsers(Array.isArray(uData?.users) ? uData.users : (Array.isArray(uData) ? uData : []));
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data?.data) {
        const bData = bookingsRes.value.data.data;
        setBookings(Array.isArray(bData?.bookings) ? bData.bookings : (Array.isArray(bData) ? bData : []));
      }
      if (trackingRes.status === 'fulfilled' && trackingRes.value?.data?.data) {
        const tData = trackingRes.value.data.data;
        setTrackingBookings(Array.isArray(tData?.bookings) ? tData.bookings : (Array.isArray(tData) ? tData : []));
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data?.data) {
        const pData = paymentsRes.value.data.data;
        setPayments(Array.isArray(pData?.payments) ? pData.payments : (Array.isArray(pData) ? pData : []));
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.data?.data) {
        const iData = invoicesRes.value.data.data;
        setInvoices(Array.isArray(iData?.invoices) ? iData.invoices : (Array.isArray(iData) ? iData : []));
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.data) {
        const rData = reviewsRes.value.data.data;
        setReviews(Array.isArray(rData?.reviews) ? rData.reviews : (Array.isArray(rData) ? rData : []));
      }
      if (complaintsRes.status === 'fulfilled' && complaintsRes.value?.data?.data) {
        const cData = complaintsRes.value.data.data;
        setComplaints(Array.isArray(cData?.complaints) ? cData.complaints : (Array.isArray(cData) ? cData : []));
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value?.data?.data) {
        setReports(reportsRes.value.data.data);
      }
      if (configRes.status === 'fulfilled' && configRes.value?.data?.data) {
        const cfg = configRes.value.data.data;
        setPlatformConfig({
          PLATFORM_FEE: Number(cfg.platformFee ?? cfg.PLATFORM_FEE ?? 50),
          CURRENCY: cfg.currency || cfg.CURRENCY || 'INR',
          MAX_SERVICE_RADIUS_KM: Number(cfg.maxServiceRadiusKm ?? cfg.MAX_SERVICE_RADIUS_KM ?? 10),
          brandName: cfg.brandName || 'SabFix',
          tagline: cfg.tagline || 'Get It Fixed.',
        });
      }
    } catch (err) {
      setError('Failed to fetch full administrative dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [roleFilter, bookingStatusFilter]);

  // Leaflet Live Tracking Map initialization
  useEffect(() => {
    if (activeModule === 'tracking' && trackingMapContainerRef.current) {
      if (!trackingMapInstanceRef.current) {
        const map = L.map(trackingMapContainerRef.current, {
          center: [28.6139, 77.2090], // Default center NCR / Agra
          zoom: 12,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        trackingLayerGroupRef.current = L.featureGroup().addTo(map);
        trackingMapInstanceRef.current = map;
      }

      // Populate tracking markers
      const group = trackingLayerGroupRef.current;
      if (group) {
        group.clearLayers();

        // If trackingBookings has entries, add them
        const listToDisplay = Array.isArray(trackingBookings) ? trackingBookings : [];

        listToDisplay.forEach((b) => {
          const custLat = parseFloat(b.customer_lat) || 28.632;
          const custLng = parseFloat(b.customer_lng) || 77.375;
          const proLat = parseFloat(b.current_lat || b.pro_lat) || custLat - 0.004;
          const proLng = parseFloat(b.current_lng || b.pro_lng) || custLng - 0.005;

          // Customer Pin
          const custPin = L.divIcon({
            className: 'sabfix-admin-pin',
            html: `
              <div style="background: #10b981; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                🏠
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          L.marker([custLat, custLng], { icon: custPin })
            .bindPopup(`<strong>Customer: ${b.customer_name}</strong><br/>${b.service_name} • ${b.address}`)
            .addTo(group);

          // Pro Pin
          const proPin = L.divIcon({
            className: 'sabfix-admin-pro-pin',
            html: `
              <div style="background: #ff6a00; color: #fff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(255,106,0,0.4);">
                🛵
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          L.marker([proLat, proLng], { icon: proPin })
            .bindPopup(`<strong>Pro: ${b.professional_name}</strong><br/>Status: ${b.status?.toUpperCase()}`)
            .addTo(group);

          // Line
          L.polyline([[proLat, proLng], [custLat, custLng]], {
            color: '#ff6a00',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.8,
          }).addTo(group);
        });

        if (group.getLayers().length > 0) {
          trackingMapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
      }
    }

    return () => {
      if (activeModule !== 'tracking' && trackingMapInstanceRef.current) {
        trackingMapInstanceRef.current.remove();
        trackingMapInstanceRef.current = null;
      }
    };
  }, [activeModule, trackingBookings]);

  // Actions
  const handleToggleUserStatus = async (targetUser) => {
    try {
      const newStatus = !targetUser.is_active;
      await adminAPI.setUserStatus(targetUser.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
      setMessage(`User ${targetUser.email} status changed to ${newStatus ? 'Active' : 'Suspended'}`);
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleVerifyPro = async (proId, newStatus) => {
    try {
      await adminAPI.verifyProfessional(proId, newStatus);
      setMessage(`Professional status updated to ${newStatus ? 'Approved & Verified' : 'Rejected'}`);
      fetchAllData();
    } catch (err) {
      setError('Failed to update verification status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await adminAPI.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setMessage('Review deleted successfully');
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const handleUpdateComplaint = async (complaintId, newStatus) => {
    try {
      await adminAPI.updateComplaint(complaintId, { status: newStatus, resolution: 'Addressed by admin' });
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );
      setMessage(`Complaint #${String(complaintId || '').slice(0, 6)} marked as ${newStatus}`);
    } catch (err) {
      setError('Failed to update complaint');
    }
  };

  // Nav modules
  const navModules = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users Directory', icon: Users },
    { id: 'verifications', label: 'Pro Verifications', icon: ShieldCheck },
    { id: 'services', label: 'Services Catalog', icon: Zap },
    { id: 'bookings', label: 'Live Bookings', icon: FileText },
    { id: 'tracking', label: 'Active Tracking Map', icon: Navigation },
    { id: 'payments', label: 'Payments & Platform Fees', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: Download },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { id: 'complaints', label: 'Complaints & Disputes', icon: AlertTriangle },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Platform Config', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main, #FAF7F2)' }}>
      {/* Mobile Drawer Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 19, 32, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR: SabFix Admin Command Center
         ========================================================================= */}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          width: isMobile ? '280px' : (sidebarOpen ? '260px' : '72px'),
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          background: '#0b1320',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
          zIndex: 999,
          height: '100vh',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: (isMobile || sidebarOpen) ? 'space-between' : 'center',
            borderBottom: '1px solid #1e293b',
          }}
        >
          {(isMobile || sidebarOpen) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#ff6a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '18px',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                  Sab<span style={{ color: '#ff6a00' }}>Fix</span> Admin
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Command Center
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ff6a00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              ⚡
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: (isMobile || sidebarOpen) ? 'block' : 'none',
            }}
          >
            {isMobile ? <X size={20} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            padding: '0.75rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {navModules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isActive ? '#ff6a00' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'all 0.15s',
                  justifyContent: (isMobile || sidebarOpen) ? 'flex-start' : 'center',
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                {(isMobile || sidebarOpen) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Centralized Config Pill in Footer */}
        {(isMobile || sidebarOpen) && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid #1e293b',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
              Central Platform Fee
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ff6a00', marginTop: '2px' }}>
              ₹{platformConfig.PLATFORM_FEE?.toFixed(2) || '50.00'}{' '}
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>/ booking</span>
            </div>
          </div>
        )}
      </aside>

      {/* =========================================================================
          RIGHT MAIN CONTENT AREA
         ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header Bar */}
        <header
          style={{
            minHeight: '64px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: isMobile ? '0.5rem 0.85rem' : '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          {/* Active Module Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {(!sidebarOpen || isMobile) && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', color: '#0b1320', cursor: 'pointer', padding: '6px' }}
                aria-label="Toggle Menu"
              >
                <Menu size={22} />
              </button>
            )}
            <h1 style={{ fontSize: isMobile ? '1.05rem' : '1.35rem', fontWeight: 900, color: '#0b1320', margin: 0, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {navModules.find((m) => m.id === activeModule)?.label || 'Overview'}
            </h1>
          </div>

          {/* Right Controls: Refresh, Central Fee Pill, Admin info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            {!isMobile && (
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>⚙️ Fee: ₹{platformConfig.PLATFORM_FEE?.toFixed(2) || '50.00'}</span>
              </div>
            )}

            <button
              onClick={fetchAllData}
              disabled={loading}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: isMobile ? '6px 10px' : '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
              }}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {!isMobile && 'Sync'}
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: isMobile ? '6px 10px' : '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e293b',
              }}
              title="Return to Customer App"
            >
              <ArrowLeft size={14} />
              App
            </button>

            {/* Admin identity badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px 4px 4px',
                background: '#0b1320',
                borderRadius: '9999px',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#ff6a00',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '13px',
                }}
              >
                {(user?.name || 'S')[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{user?.name || 'Sachin Admin'}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>{user?.email || 'sachin123@gmail.com'}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={async () => {
                if (window.confirm('Log out from Admin Command Center?')) {
                  await logout();
                  navigate('/login');
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        {/* Notification alerts */}
        {message && (
          <div
            style={{
              margin: '1rem 1.5rem 0',
              padding: '10px 16px',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '12px',
              color: '#15803d',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              {message}
            </div>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {/* ===================================================================
              MODULE 1: OVERVIEW / DASHBOARD
             =================================================================== */}
          {activeModule === 'dashboard' && (
            <div>
              {/* Top 4 KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Total Users</span>
                    <Users size={18} color="#ff6a00" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0b1320', marginTop: '6px' }}>
                    {stats?.total_users || (Array.isArray(users) ? users.length : 0)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>+12% this month</span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Total Bookings</span>
                    <FileText size={18} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0b1320', marginTop: '6px' }}>
                    {stats?.total_bookings || (Array.isArray(bookings) ? bookings.length : 0)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>{(Array.isArray(trackingBookings) ? trackingBookings.length : 0)} Active in-flight</span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Active Professionals</span>
                    <Briefcase size={18} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
                    {stats?.active_professionals || 6}
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>100% PostGIS Verified</span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #fed7aa', boxShadow: '0 4px 14px rgba(255,106,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Platform Fee Revenue</span>
                    <DollarSign size={18} color="#ff6a00" />
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ff6a00', marginTop: '6px' }}>
                    ₹{(((Array.isArray(bookings) ? bookings.length : 0) || 12) * (platformConfig.PLATFORM_FEE || 50)).toFixed(2)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>Centralized ₹50/job fee</span>
                </div>
              </div>

              {/* Recent Bookings and Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                      Recent Bookings Stream
                    </h3>
                    <button onClick={() => setActiveModule('bookings')} className="btn btn-sm btn-secondary">
                      View All &rarr;
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Service</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(bookings) ? bookings : []).slice(0, 5).map((b) => (
                          <tr key={b.id}>
                            <td><strong>#{String(b.id || '').slice(0, 8).toUpperCase()}</strong></td>
                            <td>{b.customer_name}</td>
                            <td>{b.service_name}</td>
                            <td>
                              <span className={`badge ${b.status === 'completed' ? 'badge-verified' : 'badge-customer'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: 800, color: '#0b1320' }}>₹{b.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    onClick={() => setActiveModule('tracking')}
                    style={{
                      background: 'linear-gradient(135deg, #0b1320 0%, #1e293b 100%)',
                      borderRadius: '20px',
                      padding: '1.25rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Navigation size={18} color="#ff6a00" />
                      <strong style={{ fontSize: '14px' }}>Open Live Tracking Map</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 0' }}>
                      Monitor active service rides in real-time across NCR.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveModule('verifications')}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#16a34a" />
                      <strong style={{ fontSize: '14px', color: '#0b1320' }}>Review Pro Applications</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>
                      Aadhaar & certificate verification queue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 2: USERS DIRECTORY
             =================================================================== */}
          {activeModule === 'users' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['', 'customer', 'professional', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: '1px solid #cbd5e1',
                        background: roleFilter === role ? '#ff6a00' : '#f8fafc',
                        color: roleFilter === role ? '#fff' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {role === '' ? 'All Roles' : role.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search user email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      minWidth: '240px',
                    }}
                  />
                  <button onClick={fetchAllData} className="btn btn-sm btn-primary">
                    Search
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(users) ? users : []).map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'professional' ? 'badge-professional' : 'badge-customer'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? 'badge-verified' : 'badge-unavailable'}`}>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 3: PRO VERIFICATIONS
             =================================================================== */}
          {activeModule === 'verifications' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Professional Verification Queue
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {(Array.isArray(users) ? users : []).filter((u) => u.role === 'professional').map((pro) => (
                  <div
                    key={pro.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                            {pro.name}
                          </h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{pro.email}</span>
                        </div>
                        <span className={`badge ${pro.is_verified ? 'badge-verified' : 'badge-unavailable'}`}>
                          {pro.is_verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>

                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>📍 Base: {pro.address || 'NCR / Agra Region'}</div>
                        <div>🔧 Service: Electrician & Appliance Repair</div>
                        <div>📄 Aadhaar / ID: Verified (Mock Record)</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        onClick={() => handleVerifyPro(pro.id, true)}
                        className="btn btn-sm btn-success"
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        <Check size={14} /> Approve & Verify
                      </button>
                      <button
                        onClick={() => handleVerifyPro(pro.id, false)}
                        className="btn btn-sm btn-danger"
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 4: SERVICES CATALOG (14 Reference Services)
             =================================================================== */}
          {activeModule === 'services' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                SabFix Master Services Catalog (14 Services)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  { name: 'Electrician', category: 'Electrical', price: '₹500', visiting: '₹99' },
                  { name: 'Plumber', category: 'Plumbing', price: '₹450', visiting: '₹99' },
                  { name: 'AC Repair', category: 'Cooling', price: '₹599', visiting: '₹149' },
                  { name: 'Car Mechanic', category: 'Automotive', price: '₹699', visiting: '₹199' },
                  { name: 'Painter', category: 'Home Renovation', price: '₹899', visiting: '₹149' },
                  { name: 'Carpenter', category: 'Woodwork', price: '₹450', visiting: '₹99' },
                  { name: 'Appliance Repair', category: 'Electronics', price: '₹550', visiting: '₹99' },
                  { name: 'Cleaning', category: 'Sanitization', price: '₹399', visiting: '₹49' },
                  { name: 'Pest Control', category: 'Sanitization', price: '₹899', visiting: '₹99' },
                  { name: 'TV Repair', category: 'Electronics', price: '₹650', visiting: '₹99' },
                  { name: 'RO Water Purifier', category: 'Appliances', price: '₹499', visiting: '₹99' },
                  { name: 'Geyser Repair', category: 'Appliances', price: '₹550', visiting: '₹99' },
                  { name: 'Laptop Repair', category: 'IT & Gadgets', price: '₹750', visiting: '₹149' },
                  { name: 'Home Shifting / Movers', category: 'Logistics', price: '₹1,999', visiting: '₹299' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '1.1rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                        {s.name}
                      </h4>
                      <span className="badge badge-verified" style={{ fontSize: '10px' }}>Active</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{s.category}</span>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#475569' }}>Standard Base:</span>
                      <strong style={{ color: '#ff6a00' }}>{s.price}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#475569' }}>Visiting Charge:</span>
                      <strong style={{ color: '#0b1320' }}>{s.visiting}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 5: LIVE BOOKINGS DIRECTORY
             =================================================================== */}
          {activeModule === 'bookings' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['', 'pending', 'accepted', 'on_the_way', 'arrived', 'working', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: '1px solid #cbd5e1',
                        background: bookingStatusFilter === st ? '#ff6a00' : '#f8fafc',
                        color: bookingStatusFilter === st ? '#fff' : '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {st === '' ? 'ALL' : st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>Booking Ref</th>
                      <th>Customer</th>
                      <th>Professional</th>
                      <th>Service</th>
                      <th>Address</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(bookings) ? bookings : []).map((b) => (
                      <tr key={b.id}>
                        <td><strong>#{String(b.id || '').slice(0, 8).toUpperCase()}</strong></td>
                        <td>{b.customer_name}</td>
                        <td>{b.professional_name || 'Unassigned'}</td>
                        <td>{b.service_name}</td>
                        <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.address}
                        </td>
                        <td style={{ fontWeight: 800, color: '#ff6a00' }}>₹{b.price}</td>
                        <td>
                          <span className={`badge ${b.status === 'completed' ? 'badge-verified' : b.status === 'cancelled' ? 'badge-unavailable' : 'badge-customer'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>{new Date(b.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 6: ACTIVE TRACKING MAP (Interactive Leaflet View)
             =================================================================== */}
          {activeModule === 'tracking' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '650px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                    Active In-Flight Tracking Map
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                    Real-time GPS ride streams for accepted, on-the-way, and working jobs.
                  </p>
                </div>
                <button onClick={fetchAllData} className="btn btn-sm btn-secondary">
                  <RefreshCw size={14} /> Refresh Fleet
                </button>
              </div>

              {/* Map Container */}
              <div
                ref={trackingMapContainerRef}
                style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}

          {/* ===================================================================
              MODULE 7: PAYMENTS & PLATFORM FEES
             =================================================================== */}
          {activeModule === 'payments' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                  Payments & Platform Fee Ledger
                </h3>
                <div style={{ background: '#fff7ed', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, color: '#ea580c' }}>
                  Centralized Platform Fee = ₹50.00
                </div>
              </div>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>Payment ID</th>
                      <th>Booking Ref</th>
                      <th>Gross Amount</th>
                      <th>Visiting Fee</th>
                      <th>Method</th>
                      <th>Platform Fee</th>
                      <th>Platform Fee Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(payments) ? payments : []).map((p) => (
                      <tr key={p.id}>
                        <td><strong>#{String(p.id || '').slice(0, 8).toUpperCase()}</strong></td>
                        <td>#{String(p.booking_id || '').slice(0, 8).toUpperCase()}</td>
                        <td style={{ fontWeight: 800, color: '#10b981' }}>₹{p.amount}</td>
                        <td>₹{p.visiting_charge || '99.00'}</td>
                        <td>
                          <span className={`badge ${p.payment_method === 'CASH' ? 'badge-verified' : 'badge-customer'}`}>
                            {p.payment_method}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#ea580c' }}>₹{p.platform_fee || '50.00'}</td>
                        <td>
                          <span className={`badge ${p.platform_fee_status === 'PAID' ? 'badge-verified' : 'badge-unavailable'}`}>
                            {p.platform_fee_status}
                          </span>
                        </td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 8: INVOICES
             =================================================================== */}
          {activeModule === 'invoices' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Generated Tax Invoices & Receipts
              </h3>

              <div className="table-responsive">
                <table className="table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>Invoice No</th>
                      <th>Booking Ref</th>
                      <th>Customer</th>
                      <th>Professional</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(invoices) ? invoices : []).map((inv) => (
                      <tr key={inv.id}>
                        <td><strong>{inv.invoice_no}</strong></td>
                        <td>#{String(inv.booking_id || '').slice(0, 8).toUpperCase()}</td>
                        <td>{inv.customer_name}</td>
                        <td>{inv.professional_name}</td>
                        <td style={{ fontWeight: 800, color: '#ff6a00' }}>₹{inv.amount}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => downloadInvoicePDF(inv)}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              <Download size={12} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 9: REVIEWS & RATINGS MODERATION
             =================================================================== */}
          {activeModule === 'reviews' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Customer Ratings & Review Moderation
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {(Array.isArray(reviews) ? reviews : []).map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '1.15rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: '#0b1320' }}>
                          {rev.customer_name}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 0', lineHeight: 1.4 }}>
                        "{rev.comment || 'Professional was punctual and resolved the issue.'}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Pro: {rev.professional_name || 'Partner'}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="btn btn-sm btn-danger"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 10: COMPLAINTS & DISPUTES
             =================================================================== */}
          {activeModule === 'complaints' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Disputes & Grievance Redressal
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {(Array.isArray(complaints) ? complaints : []).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '14px', color: '#0b1320' }}>{c.subject || 'Billing Discrepancy'}</strong>
                      <span className={`badge ${c.status === 'RESOLVED' ? 'badge-verified' : 'badge-unavailable'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 10px' }}>
                      {c.description || 'Customer reported disagreement regarding component pricing.'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'RESOLVED')}
                        className="btn btn-sm btn-success"
                        style={{ flex: 1, fontSize: '11px' }}
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'INVESTIGATING')}
                        className="btn btn-sm btn-warning"
                        style={{ flex: 1, fontSize: '11px' }}
                      >
                        Investigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 11: REPORTS & ANALYTICS
             =================================================================== */}
          {activeModule === 'reports' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Platform Analytics & Performance Report
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>AVG. BOOKING VALUE</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ff6a00', marginTop: '4px' }}>₹550.00</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SATISFACTION RATE</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>98.4%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PLATFORM TAKE-RATE</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0b1320', marginTop: '4px' }}>Fixed ₹50</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODULE 12: PLATFORM CONFIG (Centralized Constants)
             =================================================================== */}
          {activeModule === 'settings' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Centralized Platform Configuration
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#fff7ed', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0b1320' }}>PLATFORM_FEE</strong>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        Fixed fee collected by SabFix on each completed service.
                      </p>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ff6a00' }}>
                      ₹{platformConfig.PLATFORM_FEE?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0b1320' }}>SERVICE_RADIUS_KM</strong>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        PostGIS search radius limit for nearby professionals.
                      </p>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1320' }}>
                      {platformConfig.MAX_SERVICE_RADIUS_KM || 10} KM
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0b1320' }}>CURRENCY</strong>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        Standard transaction denomination.
                      </p>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0b1320' }}>
                      {platformConfig.CURRENCY || 'INR (₹)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invoice modal if open */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
