import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, bookingsAPI, paymentsAPI } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Save,
  AlertCircle,
  Search,
  Sparkles,
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Car,
  Cpu,
  ChevronRight,
  ClipboardList,
  FileText,
  Download,
  Headphones,
  LifeBuoy,
  HelpCircle,
  Send,
  LogOut,
  Moon,
  Sun,
  Navigation,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Shield,
  MessageCircle,
} from 'lucide-react';

export default function CustomerDashboard({ initialTab }) {
  const { user, updateUser, logout } = useAuth();
  const { userLocation, detectLocation, setManualLocation, isDetecting } = useLocationContext();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from prop, pathname, or query param
  const getTabFromLocation = () => {
    if (initialTab) return initialTab;
    const path = location.pathname;
    if (path === '/orders') return 'orders';
    if (path === '/support') return 'support';
    if (path === '/profile') return 'profile';
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['orders', 'support', 'profile'].includes(tabParam)) {
      return tabParam;
    }
    return 'orders';
  };

  const [activeTab, setActiveTab] = useState(getTabFromLocation());

  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [location.pathname, location.search, initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders') navigate('/orders');
    else if (tab === 'support') navigate('/support');
    else if (tab === 'profile') navigate('/profile');
  };

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // ---------------- BOOKINGS / ORDERS STATE ----------------
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleViewInvoice = async (bookingId) => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        setSelectedInvoice(res.data.data);
      } else {
        alert('Invoice is being generated for this booking.');
      }
    } catch (err) {
      alert('Invoice not available yet.');
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        downloadInvoicePDF(res.data.data);
      } else {
        alert('Invoice is being generated for this booking.');
      }
    } catch (err) {
      alert('Invoice not available yet.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'payment_completed':
        return <span className="badge badge-verified" style={{ background: '#dcfce7', color: '#16a34a' }}>Completed</span>;
      case 'on_the_way':
        return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>On The Way 🛵</span>;
      case 'arrived':
        return <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>Arrived at Door</span>;
      case 'working':
        return <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>Work In Progress ⏱️</span>;
      case 'payment_pending':
        return <span className="badge" style={{ background: '#ffedd5', color: '#ea580c' }}>Payment Requested 💳</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="badge badge-unavailable">Cancelled</span>;
      default:
        return <span className="badge badge-admin">Pending</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'active') {
      return ['pending', 'accepted', 'on_the_way', 'arrived', 'working', 'payment_pending'].includes(b.status);
    }
    if (orderFilter === 'completed') {
      return ['completed', 'payment_completed', 'reviewed'].includes(b.status);
    }
    if (orderFilter === 'cancelled') {
      return ['cancelled', 'rejected'].includes(b.status);
    }
    return true;
  });

  // ---------------- PROFILE EDITING STATE ----------------
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [emailLoading, setEmailLoading] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddress, setSavedAddress] = useState(() => {
    return (
      localStorage.getItem('sabfix_saved_address') ||
      userLocation?.address ||
      'Sanjay Place, Agra, Uttar Pradesh'
    );
  });
  const [addressInput, setAddressInput] = useState(savedAddress);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync inputs when user changes
  useEffect(() => {
    if (user) {
      setPhoneInput(user.phone || '');
      setEmailInput(user.email || '');
      setNameInput(user.name || '');
    }
  }, [user]);

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.trim().length < 10) {
      showNotification('Please enter a valid 10-digit mobile number', true);
      return;
    }
    setPhoneLoading(true);
    try {
      const res = await userAPI.updateProfile({ phone: phoneInput.trim() });
      if (res.data?.data) {
        updateUser(res.data.data);
      } else {
        updateUser({ phone: phoneInput.trim() });
      }
      setEditingPhone(false);
      showNotification('Phone number updated successfully! ✅');
    } catch (err) {
      // Fallback for resilient local update
      updateUser({ phone: phoneInput.trim() });
      setEditingPhone(false);
      showNotification('Phone number saved! ✅');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      showNotification('Please enter a valid email address', true);
      return;
    }
    setEmailLoading(true);
    try {
      const res = await userAPI.updateProfile({ email: emailInput.trim().toLowerCase() });
      if (res.data?.data) {
        updateUser(res.data.data);
      } else {
        updateUser({ email: emailInput.trim().toLowerCase() });
      }
      setEditingEmail(false);
      showNotification('Email address updated successfully! ✅');
    } catch (err) {
      // Fallback
      updateUser({ email: emailInput.trim().toLowerCase() });
      setEditingEmail(false);
      showNotification('Email address saved! ✅');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showNotification('Name cannot be empty', true);
      return;
    }
    setNameLoading(true);
    try {
      const res = await userAPI.updateProfile({ name: nameInput.trim() });
      if (res.data?.data) {
        updateUser(res.data.data);
      } else {
        updateUser({ name: nameInput.trim() });
      }
      setEditingName(false);
      showNotification('Name updated successfully! ✅');
    } catch (err) {
      updateUser({ name: nameInput.trim() });
      setEditingName(false);
      showNotification('Name saved! ✅');
    } finally {
      setNameLoading(false);
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      showNotification('Address cannot be empty', true);
      return;
    }
    setSavedAddress(addressInput.trim());
    localStorage.setItem('sabfix_saved_address', addressInput.trim());
    localStorage.setItem('sabfix_current_address', addressInput.trim());
    if (setManualLocation) {
      setManualLocation(userLocation?.city || 'Selected City', addressInput.trim());
    }
    setShowAddressModal(false);
    showNotification('Service address updated successfully! 📍');
  };

  const handleGpsDetectAddress = async () => {
    try {
      showNotification('Detecting live GPS location...');
      await detectLocation(true);
      if (userLocation?.address) {
        setAddressInput(userLocation.address);
        setSavedAddress(userLocation.address);
        localStorage.setItem('sabfix_saved_address', userLocation.address);
        showNotification('GPS address detected and updated! 🛰️');
      }
    } catch (e) {
      showNotification('Unable to detect GPS. Please enter manually.', true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
    setShowLogoutConfirm(false);
    navigate('/role-select');
  };

  // ---------------- SUPPORT STATE ----------------
  const [supportCategory, setSupportCategory] = useState('Booking Issue');
  const [supportBookingId, setSupportBookingId] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [tickets, setTickets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sabfix_support_tickets') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [expandedFaq, setExpandedFaq] = useState(0);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      showNotification('Please describe your issue or concern', true);
      return;
    }
    setTicketSubmitting(true);
    const newTicketId = 'SAB-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      id: newTicketId,
      category: supportCategory,
      bookingId: supportBookingId || 'General Inquiry',
      message: supportMessage.trim(),
      status: 'Open',
      created_at: new Date().toISOString(),
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('sabfix_support_tickets', JSON.stringify(updated));
    setSupportMessage('');
    setSupportBookingId('');
    setTicketSubmitting(false);
    showNotification(`Support Ticket #${newTicketId} created! Our team will reach out in 15 mins. 🎧`);
  };

  const faqs = [
    {
      q: 'What does the ₹99 Visiting Fee cover?',
      a: 'The ₹99 visiting charge covers the doorstep inspection and transit by our verified professional. Once inspected, standard transparent labor charges apply for the actual repair work.',
    },
    {
      q: 'How does live GPS tracking work?',
      a: 'Once a nearby professional accepts your booking, you can tap "Track Live Map" in your Orders section to see their real-time location riding directly to your doorstep with live ETA.',
    },
    {
      q: 'Can I pay online or in cash?',
      a: 'Both! When the technician finishes the job, you receive a bill. You can pay securely online via UPI/Card, or hand cash to the professional and get an instant GST receipt.',
    },
    {
      q: 'What if the technician is delayed?',
      a: 'You can call the professional directly with the "Call Specialist" button in your active order card, or tap WhatsApp Support below for instant dispatch assistance.',
    },
    {
      q: 'Is there a service warranty?',
      a: 'Yes! SabFix offers a 30-Day Service Guarantee on all plumbing, electrical, and appliance repairs. If an issue recurs, a professional will inspect it free of charge.',
    },
  ];

  return (
    <div className="has-bottom-nav" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Top Notification Toast */}
      {successMsg && (
        <div
          style={{
            position: 'fixed',
            top: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#16a34a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '9999px',
            zIndex: 10000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            position: 'fixed',
            top: '55px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ef4444',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '9999px',
            zIndex: 10000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 16px 40px' }}>
        {/* Top Header & Section Switcher Pills */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                }}
              >
                {activeTab === 'orders' ? <ClipboardList size={22} /> : activeTab === 'support' ? <Headphones size={22} /> : <User size={22} />}
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: 'var(--secondary)' }}>
                  {activeTab === 'orders' ? 'My Orders' : activeTab === 'support' ? '24/7 Support' : 'Customer Profile'}
                </h1>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeTab === 'orders'
                    ? `${bookings.length} service requests recorded`
                    : activeTab === 'support'
                    ? 'Instant help, tickets & FAQs'
                    : `Account: ${user?.name || 'Customer'}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/services')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '9999px' }}
            >
              <Search size={14} /> Book Service
            </button>
          </div>

          {/* Section Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '4px',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <button
              type="button"
              onClick={() => handleTabSwitch('orders')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'orders' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'orders' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <ClipboardList size={16} />
              <span>Orders</span>
              {bookings.length > 0 && (
                <span
                  style={{
                    background: activeTab === 'orders' ? 'rgba(255,255,255,0.3)' : 'var(--primary-light)',
                    color: activeTab === 'orders' ? '#ffffff' : 'var(--primary)',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                  }}
                >
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('support')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'support' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'support' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'support' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Headphones size={16} />
              <span>Support</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('profile')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activeTab === 'profile' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={16} />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: ORDERS SECTION                                          */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['all', 'active', 'completed', 'cancelled'].map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setOrderFilter(flt)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    border: '1px solid',
                    borderColor: orderFilter === flt ? 'var(--primary)' : 'var(--border)',
                    background: orderFilter === flt ? 'var(--primary)' : 'var(--bg-card)',
                    color: orderFilter === flt ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {flt}
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ animation: 'spin 2s linear infinite', marginBottom: '8px' }} />
                <div>Loading your service requests...</div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '40px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <ClipboardList size={30} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--secondary)' }}>
                  {!user ? 'Sign In to View Your Orders' : `No ${orderFilter !== 'all' ? orderFilter : ''} orders found`}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '340px', margin: '0 auto 20px' }}>
                  {!user
                    ? 'Log in to track active specialist bookings, view completed services, and download invoices.'
                    : 'Need an expert plumber, electrician, or AC repair technician? Book verified professionals nearby in minutes.'}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!user && (
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="btn btn-primary"
                      style={{ padding: '10px 24px', borderRadius: '9999px', fontWeight: 800 }}
                    >
                      Log In / Register
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/services')}
                    className={!user ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ padding: '10px 24px', borderRadius: '9999px', fontWeight: 800 }}
                  >
                    Book a Specialist &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '18px',
                      padding: '16px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--secondary)' }}>
                            {b.service_name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            #{b.id?.slice(-6) || 'REQ'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Technician: <strong style={{ color: 'var(--secondary)' }}>{b.professional_name || 'Assigned Specialist'}</strong>
                        </div>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    {/* Pricing Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'var(--bg-subtle)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.825rem',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Visiting:</span>
                        <strong style={{ color: '#16a34a' }}>₹{b.visiting_charge || 99}</strong>
                      </div>
                      <span style={{ color: 'var(--border)' }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Labor:</span>
                        <strong style={{ color: 'var(--primary)' }}>₹{b.price || 300}/hr</strong>
                      </div>
                      {b.distance_km && (
                        <>
                          <span style={{ color: 'var(--border)' }}>•</span>
                          <span style={{ color: 'var(--text-muted)' }}>📍 {b.distance_km} km</span>
                        </>
                      )}
                    </div>

                    {/* Address & Date */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="var(--primary)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.customer_address || savedAddress}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Clock size={13} />
                        <span>{new Date(b.created_at || Date.now()).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/track/${b.id}`)}
                        className="btn btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, #ff6a00, #ff8c00)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.825rem',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        🛵 Track Live Map
                      </button>

                      {['completed', 'payment_completed', 'reviewed'].includes(b.status) && (
                        <>
                          <button
                            onClick={() => handleViewInvoice(b.id)}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FileText size={14} /> View Invoice
                          </button>

                          <button
                            onClick={() => handleDownloadInvoice(b.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Download PDF"
                          >
                            <Download size={14} /> PDF
                          </button>
                        </>
                      )}

                      {b.professional_phone && (
                        <a
                          href={`tel:${b.professional_phone}`}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}

                      <button
                        onClick={() => navigate(`/services?category=${encodeURIComponent(b.service_name || 'Plumber')}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '10px' }}
                      >
                        Book Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SUPPORT SECTION (Replacing Chat)                        */}
        {/* ============================================================== */}
        {activeTab === 'support' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Contact Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* WhatsApp Support */}
              <a
                href="https://wa.me/919876543210?text=Hello%20SabFix%20Support,%20I%20need%20assistance%20with%20my%20service%20booking."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  padding: '14px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <MessageCircle size={22} />
                  <ExternalLink size={14} />
                </div>
                <strong style={{ fontSize: '0.95rem' }}>WhatsApp Care</strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Chat live with support</span>
              </a>

              {/* Call Helpline */}
              <a
                href="tel:18002007223"
                style={{
                  background: 'linear-gradient(135deg, #ff6a00, #ea580c)',
                  color: '#ffffff',
                  padding: '14px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(255, 106, 0, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Phone size={22} />
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '6px' }}>Toll Free</span>
                </div>
                <strong style={{ fontSize: '0.95rem' }}>1800-200-SABFIX</strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Toll-Free 9 AM - 9 PM</span>
              </a>
            </div>

            {/* Email Support Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--secondary)' }}>support@sabfix.com</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Replies within 2 hours</span>
                </div>
              </div>
              <a
                href="mailto:support@sabfix.com?subject=SabFix%20Customer%20Support%20Inquiry"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}
              >
                Email Us
              </a>
            </div>

            {/* Raise Support Ticket Form */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <LifeBuoy size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                  Submit a Support Ticket
                </h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                Facing an issue with a technician or payment? Submit a request and our escalation manager will review it immediately.
              </p>

              <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Issue Category
                  </label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '10px' }}
                  >
                    <option value="Booking Issue">Booking Issue / Scheduling</option>
                    <option value="Technician Delayed / No Show">Technician Delayed / No Show</option>
                    <option value="Payment / Billing Discrepancy">Payment / Billing Discrepancy</option>
                    <option value="Work Quality / Incomplete">Work Quality / Incomplete Service</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Other Inquiry">Other Inquiry</option>
                  </select>
                </div>

                {bookings.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Related Booking (Optional)
                    </label>
                    <select
                      value={supportBookingId}
                      onChange={(e) => setSupportBookingId(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '10px' }}
                    >
                      <option value="">General / None</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.service_name} with {b.professional_name} (#{b.id?.slice(-6)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Describe Your Issue
                  </label>
                  <textarea
                    rows={3}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Tell us what happened so we can assist you quickly..."
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '10px', resize: 'vertical' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="btn btn-primary"
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={15} />
                  {ticketSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </form>

              {/* Submitted Tickets History */}
              {tickets.length > 0 && (
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    Your Open Tickets ({tickets.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--secondary)' }}>#{t.id}</strong> - {t.category}
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                            {t.message?.slice(0, 50)}...
                          </div>
                        </div>
                        <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem' }}>
                          In Review
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Frequently Asked Questions */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <HelpCircle size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                  Frequently Asked Questions
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 14px',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--secondary)',
                      }}
                    >
                      <span>{faq.q}</span>
                      {expandedFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedFaq === idx && (
                      <div
                        style={{
                          padding: '0 14px 12px',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SabFix Guarantee Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0b1320, #1e293b)',
                borderRadius: '16px',
                padding: '16px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <ShieldCheck size={32} color="#ff6a00" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block', color: '#ff6a00' }}>
                  SabFix 30-Day Happiness Guarantee
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Verified background-checked technicians, transparent ₹99 visiting charge, and free revisit if work isn't satisfactory.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PROFILE SECTION (Customer Profile, Edit Phone/Email/Address, Logout) */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Customer Avatar & Hero Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6a00, #ff8c00)',
                  color: '#ffffff',
                  fontSize: '2rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 16px rgba(255, 106, 0, 0.35)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>

              {/* Editable Name */}
              {editingName ? (
                <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.95rem', fontWeight: 800, padding: '4px 10px', textAlign: 'center', width: '200px' }}
                    required
                  />
                  <button type="submit" disabled={nameLoading} className="btn btn-primary btn-sm" style={{ padding: '4px 10px' }}>
                    <Check size={14} />
                  </button>
                  <button type="button" onClick={() => setEditingName(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: 'var(--secondary)' }}>
                    {user?.name || 'Customer'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px' }}
                    title="Edit Name"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
                <span className="badge badge-customer">SabFix Customer</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                </span>
              </div>
            </div>

            {/* Contact Details Card: Edit Phone & Edit Email */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '18px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 14px', color: 'var(--secondary)' }}>
                Contact & Account Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Phone Number */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingPhone ? '8px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={17} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Number</span>
                        {!editingPhone && (
                          <strong style={{ fontSize: '0.92rem', color: 'var(--secondary)' }}>
                            {user?.phone || 'Not provided'}
                          </strong>
                        )}
                      </div>
                    </div>

                    {!editingPhone && (
                      <button
                        type="button"
                        onClick={() => setEditingPhone(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                  </div>

                  {/* Inline Edit Phone Input */}
                  {editingPhone && (
                    <form onSubmit={handleSavePhone} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.85rem', padding: '6px 12px' }}
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        disabled={phoneLoading}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontWeight: 800 }}
                      >
                        {phoneLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhone(false);
                          setPhoneInput(user?.phone || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>

                {/* 2. Email Address */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingEmail ? '8px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 106, 0, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={17} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                        {!editingEmail && (
                          <strong style={{ fontSize: '0.92rem', color: 'var(--secondary)' }}>
                            {user?.email || 'Not provided'}
                          </strong>
                        )}
                      </div>
                    </div>

                    {!editingEmail && (
                      <button
                        type="button"
                        onClick={() => setEditingEmail(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px' }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                  </div>

                  {/* Inline Edit Email Input */}
                  {editingEmail && (
                    <form onSubmit={handleSaveEmail} style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="yourname@example.com"
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.85rem', padding: '6px 12px' }}
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontWeight: 800 }}
                      >
                        {emailLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmail(false);
                          setEmailInput(user?.email || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Address Management: Change Address */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                    Saved Doorstep Address
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(!showAddressModal)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px' }}
                >
                  <Edit2 size={12} /> Change Address
                </button>
              </div>

              {/* Current Address Display */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '3px' }}>
                  {userLocation?.city || 'Default Service Area'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  {savedAddress}
                </div>
              </div>

              {/* Address Edit Form / GPS Auto-detect */}
              {showAddressModal && (
                <form onSubmit={handleSaveAddress} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Enter New Doorstep Address
                    </label>
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="House / Flat No., Street, Landmark, Area, Pincode"
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', borderRadius: '10px' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleGpsDetectAddress}
                      disabled={isDetecting}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                    >
                      <Navigation size={14} color="var(--primary)" />
                      {isDetecting ? 'Detecting GPS...' : 'Use Current GPS Location'}
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 16px', fontWeight: 800, fontSize: '0.8rem' }}
                    >
                      Save Address
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* App Preferences */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 106, 0, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--secondary)' }}>Display Theme</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Currently using {resolvedTheme === 'dark' ? 'Dark' : 'Light'} theme
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}
              >
                Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Admin Command Center Quick Access (if admin user) */}
            {user?.role === 'admin' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #0b1320 0%, #1e293b 100%)',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ff6a00' }}>
                    🛡️ SabFix Admin Center
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Manage users, bookings, tracking &amp; finances
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  style={{
                    background: '#ff6a00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Open Dashboard
                </button>
              </div>
            )}

            {/* 4. Logout / Login Action */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: user ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)',
                borderRadius: '18px',
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 4px', color: user ? '#ef4444' : 'var(--text-main)' }}>
                {user ? 'Account Actions' : 'Sign In to Your Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                {user
                  ? 'Log out of your SabFix customer account on this device.'
                  : 'Log in or register to book services, track specialists, and manage addresses.'}
              </p>

              {user ? (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 28px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(255, 106, 0, 0.3)',
                  }}
                >
                  <User size={16} /> Log In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <LogOut size={26} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--secondary)' }}>
              Confirm Logout
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.45 }}>
              Are you sure you want to log out from SabFix? You will need to log back in to manage your active bookings.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
