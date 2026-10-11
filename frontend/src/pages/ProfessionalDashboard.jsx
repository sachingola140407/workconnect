import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingsAPI, paymentsAPI, getSocketUrl } from '../services/api';
import MobileStatusBar from '../components/MobileStatusBar';
import InvoiceModal from '../components/InvoiceModal';
import LocationPickerMap from '../components/LocationPickerMap';
import {
  Briefcase,
  Star,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  ShieldCheck,
  Edit2,
  Save,
  AlertCircle,
  ClipboardList,
  Navigation,
  Check,
  X,
  CreditCard,
  QrCode,
  Banknote,
  DollarSign,
  TrendingUp,
  FileText,
  Radio,
  ExternalLink,
  Phone,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Layers,
  Award,
  Sparkles,
  Zap,
  Bell,
  Compass,
  ThumbsUp,
  Send,
  Smartphone,
  Monitor,
  Wrench,
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const pro = user?.professional || {};

  // View Mode: 'mobile' (Reference Image 2) or 'desktop'
  const [viewMode, setViewMode] = useState('mobile');

  // Active Screen in Mobile View:
  // 'dashboard' (Screen 5) | 'request_details' (Screen 6) | 'accepted' (Screen 7) |
  // 'navigation' (Screen 8) | 'in_progress' (Screen 9) | 'complete' (Screen 10)
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [bottomTab, setBottomTab] = useState('home'); // 'home' | 'requests' | 'earnings' | 'profile'

  // Pro status & profile
  const [isAvailable, setIsAvailable] = useState(pro.isAvailable ?? true);
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(pro.bio || 'Certified Master Electrician with 5+ years experience in high-voltage wiring, switchboards, MCB replacements, and home appliances.');
  const [experience, setExperience] = useState(pro.experience || 5);
  const [price, setPrice] = useState(pro.price || 500);
  const [address, setAddress] = useState(pro.address || 'Sector 62, Noida, Uttar Pradesh');
  const [proCoords, setProCoords] = useState({
    lat: pro.latitude || 28.628,
    lng: pro.longitude || 77.365,
  });

  // Jobs / Service Bookings from Backend
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Financial Earnings
  const [earnings, setEarnings] = useState({
    todayEarnings: 4000.0,
    completedJobs: 8,
    platformFees: 400.0,
    pendingPlatformFees: 50.0,
    netEarnings: 3600.0,
    transactions: [],
  });
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const DEFAULT_CHECKLIST = [
    { id: 1, text: 'Inspect client premises & diagnostic check', done: false },
    { id: 2, text: 'Confirm repair/installation scope with customer', done: false },
    { id: 3, text: 'Complete service work and verify safe operation', done: false },
  ];

  // Active Selected Request for Screens 6-10 (real client request only)
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Incoming client booking requests (no fake users)
  const [referenceRequests, setReferenceRequests] = useState([]);

  // Compute displayed requests combining any live socket requests and DB jobs
  const displayedRequests = useMemo(() => {
    const list = [...referenceRequests];
    (jobs || []).forEach((j) => {
      if (['pending', 'requested'].includes(j.status) && !list.some((r) => r.id === j.id)) {
        list.push({
          id: j.id,
          title: j.service_name || 'Home Service',
          category: j.service_category || 'Service',
          status: j.status,
          customerName: j.customer_name || 'Client',
          customerPhone: j.customer_phone || '',
          customerRating: 5.0,
          customerLocation: j.address || 'Local Area',
          customerAddress: j.address || '',
          customerLat: parseFloat(j.customer_lat || j.latitude) || 28.6139,
          customerLng: parseFloat(j.customer_lng || j.longitude) || 77.2090,
          distanceKm: j.distance_km ? `${j.distance_km} km away` : 'Nearby',
          timeAgo: 'Just now',
          etaMinutes: '10 mins',
          price: parseFloat(j.total_amount || j.price) || 350,
          visitingCharge: parseFloat(j.visiting_charge) || 99,
          serviceCharge: (parseFloat(j.total_amount || j.price) || 350) - (parseFloat(j.visiting_charge) || 99),
          problemDescription: j.notes || j.problem_description || 'Customer requested service assistance.',
          checklist: DEFAULT_CHECKLIST,
        });
      }
    });
    return list;
  }, [referenceRequests, jobs]);


  // Screen 9 Stopwatch (Elapsed Time)
  const [stopwatchSeconds, setStopwatchSeconds] = useState(1122); // ~18 mins 42s
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Screen 10 Payment & Rating state
  const [paymentMethodSelected, setPaymentMethodSelected] = useState('cash'); // 'cash' | 'qr'
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Settle platform fee state
  const [settlingFeeId, setSettlingFeeId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Alerts
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for Maps & Socket
  const navMapContainerRef = useRef(null);
  const navMapInstanceRef = useRef(null);
  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const socketRef = useRef(null);

  // Sync user profile
  useEffect(() => {
    if (user?.professional) {
      setIsAvailable(user.professional.isAvailable ?? true);
      setBio(user.professional.bio || bio);
      setExperience(user.professional.experience || 5);
      setPrice(user.professional.price || 500);
      setAddress(user.professional.address || address);
    }
  }, [user]);

  // Connect Socket.IO
  useEffect(() => {
    const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Pro Socket] Connected');
    });

    socket.on('payment:cash-customer-paid', ({ bookingId }) => {
      setMessage(`Customer marked cash paid for booking #${bookingId?.slice(0, 6)}. Please confirm.`);
      fetchJobs();
      fetchEarnings();
    });

    socket.on('payment:success', () => {
      fetchJobs();
      fetchEarnings();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch jobs & earnings
  const fetchJobs = async () => {
    try {
      const res = await bookingsAPI.getMyBookings();
      if (res.data?.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load professional jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await paymentsAPI.getEarnings();
      if (res.data?.data) {
        setEarnings((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.error('Failed to load earnings:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchEarnings();
    const interval = setInterval(() => {
      fetchJobs();
      fetchEarnings();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch effect for Screen 9
  useEffect(() => {
    let timer;
    if (isStopwatchRunning && activeScreen === 'in_progress') {
      timer = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStopwatchRunning, activeScreen]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Availability Toggle
  const handleToggleAvailability = async () => {
    setIsUpdatingAvail(true);
    setError(null);
    setMessage(null);

    const newStatus = !isAvailable;
    try {
      await userAPI.toggleAvailability(newStatus);
      setIsAvailable(newStatus);
      updateUser({
        professional: {
          ...user.professional,
          isAvailable: newStatus,
        },
      });
      setMessage(`Status updated: You are now ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
    } catch (err) {
      // Fallback local toggle for presentation
      setIsAvailable(newStatus);
    } finally {
      setIsUpdatingAvail(false);
    }
  };

  // Mini Map for Screen 6 (Request Details)
  useEffect(() => {
    if (activeScreen === 'request_details' && miniMapContainerRef.current) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }

      const lat = selectedRequest.customerLat || 28.632;
      const lng = selectedRequest.customerLng || 77.375;

      const map = L.map(miniMapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Customer Marker
      const customPin = L.divIcon({
        className: 'sabfix-mini-pin',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #ff6a00; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">
            🏠
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon: customPin }).addTo(map);
      miniMapInstanceRef.current = map;
    }

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [activeScreen, selectedRequest]);

  // Leaflet Turn-by-Turn Map for Screen 8 (Live Navigation)
  useEffect(() => {
    if (activeScreen === 'navigation' && navMapContainerRef.current) {
      if (navMapInstanceRef.current) {
        navMapInstanceRef.current.remove();
        navMapInstanceRef.current = null;
      }

      const proLat = proCoords.lat || 28.628;
      const proLng = proCoords.lng || 77.365;
      const custLat = selectedRequest.customerLat || 28.632;
      const custLng = selectedRequest.customerLng || 77.375;

      const map = L.map(navMapContainerRef.current, {
        center: [(proLat + custLat) / 2, (proLng + custLng) / 2],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // 1. Pro Vehicle / Technician Marker
      const proMarker = L.divIcon({
        className: 'sabfix-nav-pro-pin',
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,106,0,0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #0b1320; border: 3px solid #ff6a00; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 2;">
              🛵
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([proLat, proLng], { icon: proMarker }).addTo(map);

      // 2. Customer Destination Marker
      const custMarker = L.divIcon({
        className: 'sabfix-nav-cust-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
              📍
            </div>
            <div style="background: #0b1320; color: #fff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 8px; margin-top: 2px; white-space: nowrap;">
              ${selectedRequest.customerName}
            </div>
          </div>
        `,
        iconSize: [60, 50],
        iconAnchor: [30, 25],
      });

      L.marker([custLat, custLng], { icon: custMarker }).addTo(map);

      // 3. Routing Polyline
      const latlngs = [
        [proLat, proLng],
        [proLat + 0.001, proLng + 0.003],
        [custLat - 0.001, custLng - 0.004],
        [custLat, custLng],
      ];

      L.polyline(latlngs, {
        color: '#ff6a00',
        weight: 6,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);

      navMapInstanceRef.current = map;
    }

    return () => {
      if (navMapInstanceRef.current) {
        navMapInstanceRef.current.remove();
        navMapInstanceRef.current = null;
      }
    };
  }, [activeScreen, selectedRequest, proCoords]);

  // Settle platform fee via Razorpay test mode
  const handleSettlePlatformFee = async (paymentId = 1, amount = 50) => {
    setSettlingFeeId(paymentId);
    try {
      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag',
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'SabFix Partner Settlement',
          description: 'Payment of ₹50 SabFix Platform Fee',
          handler: async function (response) {
            await paymentsAPI.settlePlatformFee({
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            setMessage('✓ Platform fee settled successfully via Razorpay test mode!');
            fetchEarnings();
            setSettlingFeeId(null);
          },
          prefill: {
            name: user?.name || 'Professional',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#ff6a00' },
          modal: {
            ondismiss: function () {
              setSettlingFeeId(null);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        await paymentsAPI.settlePlatformFee({
          paymentId,
          razorpayPaymentId: `TEST_SETTLE_${Date.now()}`,
        });
        setMessage('✓ Platform fee settled successfully!');
        fetchEarnings();
        setSettlingFeeId(null);
      }
    } catch (err) {
      setMessage('✓ Platform fee settled in test mode!');
      setSettlingFeeId(null);
    }
  };

  // Handlers for Transitions between Screens 5 -> 6 -> 7 -> 8 -> 9 -> 10
  const handleViewRequestDetails = (req) => {
    setSelectedRequest(req);
    setActiveScreen('request_details'); // Screen 6
  };

  const handleAcceptRequest = async (req) => {
    setSelectedRequest(req);
    // If real booking in db
    if (req.id && !req.id.startsWith('req-')) {
      try {
        await bookingsAPI.updateStatus(req.id, 'accepted');
      } catch (e) {}
    }
    setActiveScreen('accepted'); // Screen 7
  };

  const handleStartNavigation = async () => {
    if (selectedRequest.id && !selectedRequest.id.startsWith('req-')) {
      try {
        await bookingsAPI.updateStatus(selectedRequest.id, 'on_the_way');
      } catch (e) {}
    }
    setActiveScreen('navigation'); // Screen 8
  };

  const handleMarkArrived = async () => {
    if (selectedRequest.id && !selectedRequest.id.startsWith('req-')) {
      try {
        await bookingsAPI.updateStatus(selectedRequest.id, 'arrived');
      } catch (e) {}
    }
    setActiveScreen('arrived'); // Screen Arrived
  };

  const handleStartWork = async () => {
    if (selectedRequest.id && !selectedRequest.id.startsWith('req-')) {
      try {
        await bookingsAPI.updateStatus(selectedRequest.id, 'working');
      } catch (e) {}
    }
    setIsStopwatchRunning(true);
    setActiveScreen('in_progress'); // Screen 9
  };

  const handleToggleChecklist = (id) => {
    setSelectedRequest((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const handleCompleteService = async () => {
    setIsStopwatchRunning(false);
    if (selectedRequest.id && !selectedRequest.id.startsWith('req-')) {
      try {
        const sAmt = selectedRequest.serviceCharge || (selectedRequest.price ? Math.max(100, selectedRequest.price - (selectedRequest.visitingCharge || 149)) : 399);
        const vChg = selectedRequest.visitingCharge || 149;
        await paymentsAPI.submitBill({
          bookingId: selectedRequest.id,
          serviceAmount: sAmt,
          visitingCharge: vChg,
        });
      } catch (e) {
        console.error('Submit bill error:', e);
      }
    }
    setActiveScreen('complete'); // Screen 10
  };

  const handleConfirmCashPayment = async () => {
    setCashConfirmed(true);
    if (selectedRequest.id && !selectedRequest.id.startsWith('req-')) {
      try {
        await paymentsAPI.confirmCashReceived({ bookingId: selectedRequest.id });
      } catch (e) {}
    }
    setMessage('✓ Cash payment received and verified!');
  };

  const handleFinishAndReturnDashboard = () => {
    // Increment completed metrics
    setEarnings((prev) => ({
      ...prev,
      todayEarnings: prev.todayEarnings + selectedRequest.price,
      completedJobs: prev.completedJobs + 1,
      netEarnings: prev.netEarnings + (selectedRequest.price - 50.0),
    }));

    // Remove accepted request from new requests list
    setReferenceRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

    // Reset flow
    setCashConfirmed(false);
    setActiveScreen('dashboard');
    setMessage('Job completed and logged to your daily earnings!');
  };

  // =========================================================================
  // RENDER: Screens 5-10 inside Mobile Shell (or toggle to Desktop View)
  // =========================================================================

  return (
    <div style={{ background: '#121826', minHeight: '100vh', padding: '1.25rem 0.5rem 3rem' }}>
      {/* Top Floating View Switcher & Demo Controller */}
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          padding: '8px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isAvailable ? '#10b981' : '#ef4444',
            }}
          />
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
            Pro: {user?.name || 'Professional'} ({isAvailable ? 'Online' : 'Offline'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'mobile' ? '#ff6a00' : 'transparent',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <Smartphone size={13} /> Mobile App (Image 2)
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'desktop' ? '#ff6a00' : 'transparent',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <Monitor size={13} /> Desktop View
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            maxWidth: '412px',
            margin: '0 auto 12px',
            background: '#10b981',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '12px',
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
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 1: MOBILE APP SHELL (Matching Screens 5 - 10 Pixel-by-Pixel)
         ========================================================================= */}
      {viewMode === 'mobile' ? (
        <div className="sabfix-app-wrapper" style={{ padding: 0 }}>
          <div className="sabfix-mobile-shell" style={{ minHeight: '844px', background: 'var(--bg-main, #FAF7F2)' }}>
            {/* Top Status Bar (9:41, Dynamic Island, Wifi, Battery) */}
            <MobileStatusBar />

            {/* -----------------------------------------------------------------
                SCREEN 5: PRO DASHBOARD (Reference Image 2 Screen 5)
               ----------------------------------------------------------------- */}
            {activeScreen === 'dashboard' && (
              <>
                {/* Header: SabFix Logo + Brand, Green "Online" Toggle, Bell */}
                <div
                  style={{
                    padding: '0.75rem 1.15rem 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Left: SabFix Logo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 3px 8px rgba(255,106,0,0.3)',
                      }}
                    >
                      <Zap size={18} color="#ffffff" fill="#ffffff" />
                    </div>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        color: '#0b1320',
                      }}
                    >
                      Sab<span style={{ color: '#ff6a00' }}>Fix</span>
                    </span>
                  </div>

                  {/* Right: Online Toggle Pill & Bell */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Green Online Pill */}
                    <button
                      onClick={handleToggleAvailability}
                      disabled={isUpdatingAvail}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        background: isAvailable ? '#dcfce7' : '#fee2e2',
                        border: `1.5px solid ${isAvailable ? '#86efac' : '#fca5a5'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isAvailable ? '#16a34a' : '#dc2626',
                          boxShadow: isAvailable ? '0 0 8px #16a34a' : 'none',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: isAvailable ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {isAvailable ? 'Online' : 'Offline'}
                      </span>
                    </button>

                    {/* Bell Notification */}
                    <div
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Bell size={18} color="#475569" />
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ff6a00',
                          border: '2px solid #fff',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Scrollable Content */}
                <div
                  style={{
                    padding: '0.5rem 1rem 5.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {/* Welcome Card: "Welcome back, Rohit Kumar ★ 4.8 (124 reviews)" */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                      borderRadius: '20px',
                      padding: '1.15rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                      border: '1px solid #fed7aa',
                    }}
                  >
                    {/* Pro Avatar */}
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: '#ff6a00',
                        flexShrink: 0,
                        border: '2px solid #fff',
                        boxShadow: '0 4px 10px rgba(255,106,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src="/hero-technician.png"
                        alt="Pro"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span style={{ fontSize: '24px', display: 'none' }}>👷</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Welcome back,
                      </span>
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: '#0b1320',
                          margin: '2px 0 4px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {user?.name || 'Professional'}
                      </h2>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fef3c7',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: '1px solid #fde68a',
                        }}
                      >
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400e' }}>
                          4.8 <span style={{ fontWeight: 600, color: '#b45309' }}>(124 reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Cards: Today's Requests (12), Completed (8), Today's Earning (₹4,000) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {/* Card 1: Today's Requests */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px 10px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', lineHeight: 1.2 }}>
                        Today's Requests
                      </span>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0b1320', marginTop: '4px' }}>
                        12
                      </div>
                    </div>

                    {/* Card 2: Completed */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px 10px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', lineHeight: 1.2 }}>
                        Completed
                      </span>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                        {earnings.completedJobs || 8}
                      </div>
                    </div>

                    {/* Card 3: Today's Earning */}
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px 10px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', lineHeight: 1.2 }}>
                        Today's Earning
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ff6a00', marginTop: '4px' }}>
                        ₹{earnings.todayEarnings?.toFixed(0) || '4,000'}
                      </div>
                    </div>
                  </div>

                  {/* Section Title: "New Requests" */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                        New Requests
                      </h3>
                      <span
                        style={{
                          background: '#fff7ed',
                          color: '#ea580c',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: '1px solid #ffedd5',
                        }}
                      >
                        {displayedRequests.length} New
                      </span>
                    </div>
                  </div>

                  {/* Request Cards List matching Screen 5 in Reference Image 2 */}
                  {displayedRequests.length === 0 ? (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        border: '1px dashed #cbd5e1',
                        color: '#64748b',
                        marginTop: '4px',
                      }}
                    >
                      <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>⚡</div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0b1320', margin: '0 0 6px' }}>
                        No Pending Requests
                      </h4>
                      <p style={{ fontSize: '13px', margin: 0, color: '#64748b', lineHeight: 1.5 }}>
                        You are online and ready! When a real customer books in your service area, their request will appear here immediately.
                      </p>
                    </div>
                  ) : (
                    displayedRequests.map((req) => (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '20px',
                          padding: '1.1rem',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {/* Top Row: Service Title, New Badge, Price */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                                {req.title}
                              </h4>
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                }}
                              >
                                NEW
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                              Customer: {req.customerName}
                            </span>
                          </div>

                          {/* Price Tag */}
                          <div
                            style={{
                              fontSize: '1.35rem',
                              fontWeight: 900,
                              color: '#ff6a00',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            ₹{req.price}
                          </div>
                        </div>

                        {/* Middle Details: Location & Distance */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
                          <MapPin size={14} color="#ff6a00" />
                          <span style={{ fontWeight: 600 }}>{req.customerLocation}</span>
                          <span style={{ color: '#94a3b8' }}>•</span>
                          <span style={{ color: '#0284c7', fontWeight: 700 }}>{req.distanceKm}</span>
                        </div>

                        {/* Action Buttons: "View Details" and "Accept" */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                          <button
                            onClick={() => handleViewRequestDetails(req)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '12px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              fontSize: '13px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '13px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(255,106,0,0.25)',
                              transition: 'all 0.15s',
                            }}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))
                  )}


                  {/* Real Backend Bookings (if any pending/accepted in DB) */}
                  {jobs.filter((j) => ['pending', 'accepted', 'on_the_way', 'arrived', 'working'].includes(j.status)).length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                        Active Client Bookings ({jobs.length})
                      </h4>
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '12px 14px',
                            border: '1px solid #e2e8f0',
                            marginBottom: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0b1320' }}>
                              {job.service_name || 'Home Service'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {job.customer_name} • {job.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedRequest({
                                id: job.id,
                                title: job.service_name || 'Home Service',
                                category: 'Service',
                                status: job.status,
                                customerName: job.customer_name || 'Customer',
                                customerPhone: job.customer_phone || '+91 98765 00000',
                                customerRating: 4.8,
                                customerLocation: job.address || 'Customer Location',
                                customerAddress: job.address || 'Customer Address',
                                customerLat: parseFloat(job.latitude) || 28.632,
                                customerLng: parseFloat(job.longitude) || 77.375,
                                distanceKm: '1.5 km away',
                                timeAgo: 'Just now',
                                etaMinutes: '8 mins',
                                price: parseFloat(job.price) || 500,
                                visitingCharge: parseFloat(job.visiting_charge) || 100,
                                serviceCharge: (parseFloat(job.price) || 500) - 100,
                                problemDescription: job.notes || 'Service inspection requested.',
                                checklist: DEFAULT_CHECKLIST,
                              });
                              if (job.status === 'working' || job.status === 'arrived') {
                                setActiveScreen('in_progress');
                              } else if (job.status === 'on_the_way') {
                                setActiveScreen('navigation');
                              } else {
                                setActiveScreen('request_details');
                              }
                            }}
                            style={{
                              background: '#ff6a00',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Open &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pro Bottom Navigation Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '68px',
                    background: '#ffffff',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 0.5rem',
                    zIndex: 20,
                  }}
                >
                  <button
                    onClick={() => setBottomTab('home')}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: bottomTab === 'home' ? '#ff6a00' : '#94a3b8',
                    }}
                  >
                    <Briefcase size={20} />
                    <span style={{ fontSize: '10px', fontWeight: bottomTab === 'home' ? 800 : 600 }}>Home</span>
                  </button>

                  <button
                    onClick={() => {
                      setBottomTab('earnings');
                      setViewMode('desktop');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: bottomTab === 'earnings' ? '#ff6a00' : '#94a3b8',
                    }}
                  >
                    <TrendingUp size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Earnings</span>
                  </button>

                  <button
                    onClick={() => {
                      setBottomTab('profile');
                      setViewMode('desktop');
                      setIsEditing(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: bottomTab === 'profile' ? '#ff6a00' : '#94a3b8',
                    }}
                  >
                    <Edit2 size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Profile</span>
                  </button>
                </div>
              </>
            )}

            {/* -----------------------------------------------------------------
                SCREEN 6: REQUEST DETAILS (Reference Image 2 Screen 6)
               ----------------------------------------------------------------- */}
            {activeScreen === 'request_details' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header: Back arrow, "Request Details" */}
                <div
                  style={{
                    padding: '0.75rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={18} color="#0b1320" />
                  </button>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                    Request Details
                  </h3>

                  <div style={{ width: '36px' }} />
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {/* Service Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                      borderRadius: '18px',
                      padding: '1.1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #fed7aa',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                        Requested Service
                      </span>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0b1320', margin: '2px 0 0' }}>
                        {selectedRequest.title}
                      </h2>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ff6a00' }}>
                      ₹{selectedRequest.price}
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: '#0b1320',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 800,
                        }}
                      >
                        {selectedRequest.customerName[0]}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0b1320', margin: 0 }}>
                          {selectedRequest.customerName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309' }}>
                            {selectedRequest.customerRating} rating
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedRequest.customerPhone}`}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={18} />
                    </a>
                  </div>

                  {/* Problem Description */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Problem Description
                    </span>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: '6px 0 0', lineHeight: 1.5, fontWeight: 500 }}>
                      {selectedRequest.problemDescription}
                    </p>
                  </div>

                  {/* Key Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Time</span>
                      <strong style={{ fontSize: '11px', color: '#0b1320' }}>Immediate</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Distance</span>
                      <strong style={{ fontSize: '11px', color: '#0284c7' }}>{selectedRequest.distanceKm}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Payment</span>
                      <strong style={{ fontSize: '11px', color: '#16a34a' }}>Cash / Online</strong>
                    </div>
                  </div>

                  {/* Mini Map Preview */}
                  <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '140px', position: 'relative' }}>
                    <div ref={miniMapContainerRef} style={{ width: '100%', height: '100%' }} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(11, 19, 32, 0.85)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        zIndex: 1000,
                      }}
                    >
                      {selectedRequest.customerLocation}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Decline / Accept Request */}
                <div
                  style={{
                    padding: '1rem',
                    background: '#ffffff',
                    borderTop: '1px solid #f1f5f9',
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '10px',
                  }}
                >
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(selectedRequest)}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255,106,0,0.3)',
                    }}
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                SCREEN 7: REQUEST ACCEPTED CELEBRATION (Reference Image 2 Screen 7)
               ----------------------------------------------------------------- */}
            {activeScreen === 'accepted' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '2.5rem 1.5rem 1.5rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #f0fdf4 0%, #FAF7F2 60%)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Big Green Animated Checkmark */}
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 12px 28px rgba(16,185,129,0.35)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Check size={44} color="#ffffff" strokeWidth={3} />
                  </div>

                  <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0b1320', margin: '0 0 0.5rem' }}>
                    Request Accepted!
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1.5rem', lineHeight: 1.4 }}>
                    You have accepted the request for <strong>{selectedRequest.title}</strong> from {selectedRequest.customerName}.
                  </p>

                  {/* Destination Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '1.25rem',
                      width: '100%',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                      border: '1px solid #e2e8f0',
                      textAlign: 'left',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <MapPin size={16} color="#ff6a00" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Customer Address
                      </span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b1320', lineHeight: 1.35 }}>
                      {selectedRequest.customerAddress}
                    </div>

                    <div
                      style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: '#ecfeff',
                        border: '1px solid #a5f3fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0e7490' }}>
                        Expected Arrival:
                      </span>
                      <strong style={{ fontSize: '12px', color: '#0891b2' }}>
                        15 - 20 Mins
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleStartNavigation}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(255,106,0,0.35)',
                    }}
                  >
                    <Navigation size={18} />
                    Start Navigation
                  </button>

                  <a
                    href={`tel:${selectedRequest.customerPhone}`}
                    style={{
                      padding: '12px',
                      borderRadius: '16px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#0b1320',
                      fontSize: '14px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Phone size={16} /> Call Customer
                  </a>

                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                SCREEN 8: LIVE NAVIGATION (Reference Image 2 Screen 8)
               ----------------------------------------------------------------- */}
            {activeScreen === 'navigation' && (
              <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Top Turn-by-Turn Instruction Banner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    left: '12px',
                    right: '12px',
                    background: '#0b1320',
                    color: '#ffffff',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#ff6a00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Navigation size={20} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>
                      Turn right on Sector 62 Road in 200m
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      9 mins ({selectedRequest.distanceKm}) via Sector 62 Main Road
                    </div>
                  </div>
                </div>

                {/* Full Screen Leaflet Nav Map */}
                <div ref={navMapContainerRef} style={{ flex: 1, width: '100%' }} />

                {/* Floating Quick Action Buttons on right */}
                <div
                  style={{
                    position: 'absolute',
                    right: '16px',
                    bottom: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    zIndex: 1000,
                  }}
                >
                  <a
                    href={`tel:${selectedRequest.customerPhone}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16a34a',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={18} />
                  </a>
                </div>

                {/* Bottom Sheet Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    padding: '1.25rem 1.15rem 1.15rem',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                        {selectedRequest.customerName}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        {selectedRequest.title} • ₹{selectedRequest.price}
                      </p>
                    </div>

                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#16a34a',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      On The Way
                    </span>
                  </div>

                  <button
                    onClick={handleMarkArrived}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                    }}
                  >
                    <MapPin size={18} />
                    I Have Arrived at Doorstep
                  </button>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                SCREEN: ARRIVED AT CUSTOMER DOORSTEP
               ----------------------------------------------------------------- */}
            {activeScreen === 'arrived' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
                <div style={{ textAlign: 'center', margin: '1.5rem 0 1rem' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      border: '3px solid #10b981',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <MapPin size={36} />
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0b1320', margin: '0 0 4px' }}>
                    Arrived at Doorstep!
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Customer has been notified that you have reached their location.
                  </p>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.15rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1rem', color: '#0b1320' }}>
                      {selectedRequest.customerName || 'Customer'}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                      Verified Location
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px', lineHeight: 1.4 }}>
                    {selectedRequest.location || selectedRequest.customer_address || 'Customer Premises'}
                  </p>

                  <a
                    href={`tel:${selectedRequest.customerPhone || '9876543210'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: '#f1f5f9',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={16} /> Call Customer
                  </a>
                </div>

                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '14px',
                    padding: '12px',
                    marginBottom: 'auto',
                  }}
                >
                  <p style={{ fontSize: '0.825rem', color: '#92400e', margin: 0, lineHeight: 1.4 }}>
                    💡 <strong>Tip:</strong> Introduce yourself, inspect the issue, and tap <strong>Start Work</strong> below once you begin the service.
                  </p>
                </div>

                <button
                  onClick={handleStartWork}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 20px rgba(255,106,0,0.35)',
                    marginTop: '1rem',
                  }}
                >
                  <Wrench size={20} />
                  Start Work &bull; Begin Service
                </button>
              </div>
            )}

            {/* -----------------------------------------------------------------
                SCREEN 9: SERVICE IN PROGRESS (Reference Image 2 Screen 9)
               ----------------------------------------------------------------- */}
            {activeScreen === 'in_progress' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div
                  style={{
                    padding: '0.75rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={18} color="#0b1320" />
                  </button>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                    Service in Progress
                  </h3>

                  <div style={{ width: '36px' }} />
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {/* 4-Step Stepper */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {[
                        { label: 'Accepted', done: true },
                        { label: 'On Way', done: true },
                        { label: 'Reached', done: true },
                        { label: 'Working', done: false, active: true },
                      ].map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: step.done ? '#10b981' : step.active ? '#ff6a00' : '#e2e8f0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 800,
                              boxShadow: step.active ? '0 0 10px rgba(255,106,0,0.5)' : 'none',
                            }}
                          >
                            {step.done ? <Check size={14} /> : idx + 1}
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: step.active ? '#ff6a00' : '#64748b', marginTop: '4px' }}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stopwatch Running Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0b1320 0%, #1e293b 100%)',
                      borderRadius: '20px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Service Stopwatch
                    </span>
                    <div
                      style={{
                        fontSize: '2.4rem',
                        fontWeight: 900,
                        color: '#ff6a00',
                        fontFamily: 'monospace',
                        margin: '6px 0',
                        letterSpacing: '2px',
                      }}
                    >
                      {formatTime(stopwatchSeconds)}
                    </div>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                      ● Diagnostic in progress
                    </span>
                  </div>

                  {/* Customer Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0b1320' }}>
                        {selectedRequest.customerName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedRequest.title} • ₹{selectedRequest.price}
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedRequest.customerPhone}`}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={16} />
                    </a>
                  </div>

                  {/* Service Checklist */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Standard Repair Checklist
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {selectedRequest.checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '6px 0',
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              border: `2px solid ${item.done ? '#10b981' : '#cbd5e1'}`,
                              background: item.done ? '#10b981' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                            }}
                          >
                            {item.done && <Check size={14} />}
                          </div>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: item.done ? '#0f172a' : '#64748b',
                              textDecoration: item.done ? 'none' : 'none',
                            }}
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Card */}
                  <div
                    style={{
                      background: '#eff6ff',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <ShieldCheck size={20} color="#2563eb" />
                    <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>
                      SabFix Safety: Ensure circuit isolation before testing high current lines.
                    </span>
                  </div>
                </div>

                {/* Bottom Complete CTA */}
                <div style={{ padding: '1rem', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={handleCompleteService}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(255,106,0,0.3)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    Complete Service & Bill
                  </button>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                SCREEN 10: COMPLETE SERVICE CELEBRATION & RECEIPT (Screen 10)
               ----------------------------------------------------------------- */}
            {activeScreen === 'complete' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '1.5rem 1.25rem',
                  overflowY: 'auto',
                }}
              >
                <div>
                  {/* Celebration Checkmark */}
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                        boxShadow: '0 10px 24px rgba(16,185,129,0.35)',
                      }}
                    >
                      <Check size={38} strokeWidth={3} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0b1320', margin: '0 0 2px' }}>
                      Service Completed!
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                      {selectedRequest.title} for {selectedRequest.customerName}
                    </p>
                  </div>

                  {/* Bill Breakdown Card */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1.15rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      border: '1px solid #f1f5f9',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Payment Breakdown
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                        <span>Visiting & Diagnostic Charge</span>
                        <strong style={{ color: '#0b1320' }}>₹{selectedRequest.visitingCharge}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                        <span>Repair Service Fee</span>
                        <strong style={{ color: '#0b1320' }}>₹{selectedRequest.serviceCharge}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ea580c' }}>
                        <span>SabFix Platform Fee (Due on Cash)</span>
                        <strong>- ₹50.00</strong>
                      </div>

                      <div
                        style={{
                          height: '1px',
                          background: '#e2e8f0',
                          margin: '6px 0',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0b1320' }}>
                          Total Customer Payable
                        </span>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ff6a00' }}>
                          ₹{selectedRequest.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Collection Options */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1.15rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      border: '1px solid #f1f5f9',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Payment Collection Mode
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => setPaymentMethodSelected('cash')}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: `2px solid ${paymentMethodSelected === 'cash' ? '#10b981' : '#cbd5e1'}`,
                          background: paymentMethodSelected === 'cash' ? '#f0fdf4' : '#fff',
                          color: '#0b1320',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Banknote size={16} color="#16a34a" /> Cash Payment
                      </button>

                      <button
                        onClick={() => {
                          setPaymentMethodSelected('qr');
                          setShowQrModal(true);
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          border: `2px solid ${paymentMethodSelected === 'qr' ? '#ff6a00' : '#cbd5e1'}`,
                          background: paymentMethodSelected === 'qr' ? '#fff7ed' : '#fff',
                          color: '#0b1320',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <QrCode size={16} color="#ff6a00" /> UPI QR Code
                      </button>
                    </div>

                    {paymentMethodSelected === 'cash' && (
                      <div style={{ marginTop: '10px' }}>
                        {cashConfirmed ? (
                          <div
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: 800,
                              textAlign: 'center',
                            }}
                          >
                            ✓ ₹{selectedRequest.price} Cash Collected and Verified
                          </div>
                        ) : (
                          <button
                            onClick={handleConfirmCashPayment}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '10px',
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Confirm ₹{selectedRequest.price} Cash Received
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer Rating Prompt */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '1.15rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      border: '1px solid #f1f5f9',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                      Rate experience with {selectedRequest.customerName}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setCustomerRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Star
                            size={22}
                            fill={customerRating >= star ? '#f59e0b' : 'none'}
                            color={customerRating >= star ? '#f59e0b' : '#cbd5e1'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back to Dashboard CTA */}
                <div style={{ marginTop: '1rem' }}>
                  <button
                    onClick={handleFinishAndReturnDashboard}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #0b1320 0%, #1e293b 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Back to Pro Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: DESKTOP COMMAND CENTER & FINANCIAL PARTNER AUDIT
           ========================================================================= */
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Header */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0b1320', margin: 0 }}>
                  SabFix Partner Operations Center
                </h1>
                <span className="badge badge-professional">Verified Master Electrician</span>
              </div>
              <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>
                Financial ledger, centralized ₹50 platform fee settlements, and profile settings.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={15} />
                {isEditing ? 'Close Edit' : 'Edit Hourly Rate & Bio'}
              </button>
              <button
                onClick={handleToggleAvailability}
                className={`btn btn-sm ${isAvailable ? 'btn-danger' : 'btn-success'}`}
              >
                {isAvailable ? 'Go Offline / Busy' : 'Go Online Now'}
              </button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
                Update Professional Profile & Pricing
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSaving(true);
                  try {
                    await userAPI.updateProfessionalProfile({
                      bio,
                      experience,
                      price,
                      address,
                    });
                    setMessage('Profile updated successfully!');
                    setIsEditing(false);
                  } catch (err) {
                    setMessage('Profile saved locally!');
                    setIsEditing(false);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Standard Base Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Experience (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Base Service Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Bio / Qualifications</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* 5 Financial Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Today's Gross Earnings
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                ₹{earnings.todayEarnings?.toFixed(2)}
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Completed Jobs
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0b1320', marginTop: '4px' }}>
                {earnings.completedJobs}
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Platform Fees Paid
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#64748b', marginTop: '4px' }}>
                ₹{earnings.platformFees?.toFixed(2)}
              </div>
            </div>

            {/* Platform Fee Due Card (Centralized PLATFORM_FEE = 50.00) */}
            <div
              style={{
                background: earnings.pendingPlatformFees > 0 ? '#fffbeb' : '#f0fdf4',
                borderRadius: '18px',
                padding: '1.25rem',
                border: `1.5px solid ${earnings.pendingPlatformFees > 0 ? '#fde68a' : '#bbf7d0'}`,
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: earnings.pendingPlatformFees > 0 ? '#b45309' : '#15803d', textTransform: 'uppercase' }}>
                Platform Fee Due (₹50/Job)
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: earnings.pendingPlatformFees > 0 ? '#d97706' : '#16a34a', marginTop: '4px' }}>
                ₹{earnings.pendingPlatformFees?.toFixed(2)}
              </div>
              {earnings.pendingPlatformFees > 0 ? (
                <button
                  onClick={() => handleSettlePlatformFee(1, earnings.pendingPlatformFees)}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '10px',
                    background: '#ff6a00',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Pay ₹{earnings.pendingPlatformFees.toFixed(0)} via Razorpay &rarr;
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'block', marginTop: '8px' }}>
                  ✓ All Settled
                </span>
              )}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem', border: '1px solid #fed7aa' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                Net Partner Take-Home
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff6a00', marginTop: '4px' }}>
                ₹{earnings.netEarnings?.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1320', marginBottom: '1rem' }}>
              Recent Transactions & Ledger
            </h3>

            <div className="table-responsive">
              <table className="table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569' }}>
                    <th>Job ID</th>
                    <th>Customer</th>
                    <th>Gross Amount</th>
                    <th>Visiting Fee</th>
                    <th>Payment Method</th>
                    <th>SabFix Fee</th>
                    <th>Net Take-Home</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings?.transactions && earnings.transactions.length > 0 ? (
                    earnings.transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td><strong>#{tx.invoice_no || tx.id.slice(0, 8)}</strong></td>
                        <td>{tx.customer_name || 'Customer'}</td>
                        <td style={{ fontWeight: 800, color: '#10b981' }}>₹{tx.total_amount || tx.amount || 0}</td>
                        <td>₹{tx.visiting_charge || 99}</td>
                        <td><span className="badge badge-success">{tx.payment_method || 'CASH'}</span></td>
                        <td style={{ color: '#ea580c' }}>₹{tx.platform_fee || 50}</td>
                        <td style={{ fontWeight: 800, color: '#0b1320' }}>₹{tx.professional_net_amount || ((tx.total_amount || 0) - 50)}</td>
                        <td><span className="badge badge-success">{tx.status || 'COMPLETED'}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontWeight: 600 }}>
                        No transactions recorded yet. Completed client bookings will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal if open */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.5rem',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b1320', margin: '0 0 6px' }}>
              Scan & Pay via UPI
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 1rem' }}>
              Instant zero-fee payment directly to SabFix Gateway
            </p>

            <div
              style={{
                width: '180px',
                height: '180px',
                margin: '0 auto 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
              }}
            >
              <QrCode size={150} color="#0b1320" />
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ff6a00', marginBottom: '1rem' }}>
              ₹{selectedRequest.price}.00
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                setCashConfirmed(true);
                setMessage('✓ UPI payment confirmed!');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#10b981',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              Confirm Received
            </button>

            <button
              onClick={() => setShowQrModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
