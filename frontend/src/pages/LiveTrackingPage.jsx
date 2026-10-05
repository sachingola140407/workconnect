import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { bookingsAPI, paymentsAPI, getSocketUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';
import SabFixBrand from '../components/SabFixBrand';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  CheckCircle,
  Star,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Play,
  RotateCcw,
  MessageSquare,
  Wrench,
  Check,
  ChevronRight,
  Sparkles,
  Compass,
  CheckSquare,
  CreditCard,
  QrCode,
  Banknote,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';

export default function LiveTrackingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view stage: 'confirmed', 'on_the_way', 'arrived', 'working', 'payment_pending', 'completed'
  const [activeStage, setActiveStage] = useState('on_the_way');

  // Live coordinates & movement state
  const [proCoords, setProCoords] = useState(null);
  const [custCoords, setCustCoords] = useState(null);
  const [liveDistance, setLiveDistance] = useState(0.8);
  const [liveEta, setLiveEta] = useState(3);
  const [gpsStatus, setGpsStatus] = useState('live'); // 'live' | 'updating' | 'offline'
  const [lastGpsUpdate, setLastGpsUpdate] = useState(Date.now());
  const [secondsSinceGpsUpdate, setSecondsSinceGpsUpdate] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Working stopwatch timer
  const [workingSeconds, setWorkingSeconds] = useState(0);

  // Payment states
  const [paymentMethodTab, setPaymentMethodTab] = useState('online'); // 'online' | 'qr' | 'cash'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [cashPaidMarked, setCashPaidMarked] = useState(false);

  // Invoice state
  const [invoice, setInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Customer rating state
  const [rating, setRating] = useState(5);
  const [hasRated, setHasRated] = useState(false);

  // Leaflet map refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const proMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const simIntervalRef = useRef(null);
  const socketRef = useRef(null);

  // Map backend status to UI stage
  const mapStatusToStage = (status) => {
    switch (status) {
      case 'pending':
      case 'accepted':
        return 'confirmed';
      case 'on_the_way':
        return 'on_the_way';
      case 'arrived':
        return 'arrived';
      case 'working':
        return 'working';
      case 'work_completed':
      case 'payment_pending':
        return 'payment_pending';
      case 'payment_completed':
      case 'completed':
      case 'reviewed':
        return 'completed';
      default:
        return 'confirmed';
    }
  };

  // 1. Fetch live booking details
  const fetchTrackingData = async (initial = false) => {
    try {
      const res = await bookingsAPI.getTracking(bookingId);
      const data = res.data.data;
      setBooking(data);

      const pLat = data.professional_lat || 28.6139;
      const pLng = data.professional_lng || 77.2090;
      const cLat = data.customer_lat || 28.6315;
      const cLng = data.customer_lng || 77.2167;

      if (initial || !proCoords) {
        setProCoords({ lat: pLat, lng: pLng });
        setCustCoords({ lat: cLat, lng: cLng });
        setLiveDistance(data.distance_km || 0.8);
        setLiveEta(data.eta_minutes !== undefined ? data.eta_minutes : 3);
        setActiveStage(mapStatusToStage(data.status));
      }

      // If already paid or completed, load invoice
      if (['payment_completed', 'completed', 'reviewed'].includes(data.status)) {
        loadInvoice();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load live tracking details');
    } finally {
      if (initial) setLoading(false);
    }
  };

  // Load invoice for booking
  const loadInvoice = async () => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      // Invoice might not exist yet if payment is pending
    }
  };

  // 2. Real-time Socket.IO Connection
  useEffect(() => {
    fetchTrackingData(true);

    // Initialize Socket.IO client
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to SabFix live gateway');
      socket.emit('join:booking', {
        bookingId,
        userId: user?.id,
        role: user?.role || 'customer',
      });
    });

    // Handle real-time GPS stream from professional device (Prompt 2 Section 9, 17)
    const handleLocationUpdate = (loc) => {
      if (loc && loc.latitude && loc.longitude) {
        setProCoords({ lat: loc.latitude, lng: loc.longitude });
        setLastGpsUpdate(Date.now());
        if (loc.distanceKm !== null && loc.distanceKm !== undefined) {
          setLiveDistance(loc.distanceKm);
        }
        if (loc.etaMinutes !== null && loc.etaMinutes !== undefined) {
          setLiveEta(loc.etaMinutes);
        }
        if (loc.routeCoordinates && loc.routeCoordinates.length > 0 && polylineRef.current) {
          polylineRef.current.setLatLngs(loc.routeCoordinates);
        }
        setGpsStatus('live');
      }
    };

    socket.on('professional:location', handleLocationUpdate);
    socket.on('professional:location-updated', handleLocationUpdate);

    // Handle real-time status change (Prompt 2 Section 10, 17)
    const handleStatusUpdate = (data) => {
      if (data && data.status) {
        const norm = (data.normalizedStatus || data.status).toLowerCase();
        setBooking((prev) => ({ ...prev, ...data, status: norm }));
        setActiveStage(mapStatusToStage(norm));
        if (norm === 'payment_completed' || norm === 'completed') {
          loadInvoice();
        }
      }
    };

    socket.on('booking:status', handleStatusUpdate);
    socket.on('booking:status-change', handleStatusUpdate);

    // Handle bill submission
    socket.on('booking:bill-submitted', (data) => {
      setActiveStage('payment_pending');
      fetchTrackingData(false);
    });

    // Handle payment success
    socket.on('payment:success', (data) => {
      setPaymentSuccessData(data);
      setActiveStage('completed');
      loadInvoice();
    });

    // Handle cash confirmed
    socket.on('payment:cash-confirmed', (data) => {
      setPaymentSuccessData(data);
      setActiveStage('completed');
      loadInvoice();
    });

    const pollTimer = setInterval(() => {
      fetchTrackingData(false);
    }, 7000);

    return () => {
      clearInterval(pollTimer);
      if (socketRef.current) {
        socketRef.current.emit('leave:booking', { bookingId });
        socketRef.current.disconnect();
      }
    };
  }, [bookingId]);

  // GPS staleness timer (Prompt 2 Section 23)
  useEffect(() => {
    const timer = setInterval(() => {
      const diffSecs = Math.floor((Date.now() - lastGpsUpdate) / 1000);
      setSecondsSinceGpsUpdate(diffSecs);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastGpsUpdate]);

  // Working stopwatch timer
  useEffect(() => {
    let interval = null;
    if (activeStage === 'working') {
      interval = setInterval(() => {
        setWorkingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeStage]);

  const formatTimer = (totalSecs) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!loading && mapRef.current && !mapInstance.current && custCoords && proCoords) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView(
        [custCoords.lat, custCoords.lng],
        15
      );
      mapInstance.current = map;

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Customer Destination Pin
      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="background: #ff6a00; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(255,106,0,0.45); border: 3px solid white; font-size: 20px; z-index: 10;">
              🏠
            </div>
            <div style="position: absolute; width: 62px; height: 62px; border-radius: 50%; background: rgba(255,106,0,0.22); animation: pulse 2s infinite;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Specialist Moving Pin
      const proIcon = L.divIcon({
        className: 'custom-pro-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: white; border: 1.5px solid #ff6a00; padding: 4px 10px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 800; font-size: 11px; color: #0f172a; white-space: nowrap; margin-bottom: 4px;">
              ${booking?.professional_name || 'Specialist'} &bull; ${liveEta} mins away
            </div>
            <div style="position: relative;">
              <div style="background: #10b981; color: white; width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16,185,129,0.5); border: 3px solid white; font-size: 22px; z-index: 10;">
                🛵
              </div>
              <div style="position: absolute; top: -6px; left: -6px; width: 58px; height: 58px; border-radius: 50%; background: rgba(16,185,129,0.25); animation: pulse 1.6s infinite;"></div>
            </div>
          </div>
        `,
        iconSize: [120, 75],
        iconAnchor: [60, 68],
      });

      L.marker([custCoords.lat, custCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>Your Address</b><br/>${booking?.customer_address || 'Delivery Location'}`);

      const proMarker = L.marker([proCoords.lat, proCoords.lng], { icon: proIcon }).addTo(map);
      proMarkerRef.current = proMarker;

      const line = L.polyline(
        [
          [proCoords.lat, proCoords.lng],
          [custCoords.lat, custCoords.lng],
        ],
        { color: '#ff6a00', weight: 4.5, opacity: 0.85, dashArray: '6, 6' }
      ).addTo(map);
      polylineRef.current = line;

      const bounds = L.latLngBounds([
        [proCoords.lat, proCoords.lng],
        [custCoords.lat, custCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [loading, custCoords]);

  // 4. Update marker positions and tooltip when coords or ETA change
  useEffect(() => {
    if (proMarkerRef.current && proCoords) {
      proMarkerRef.current.setLatLng([proCoords.lat, proCoords.lng]);

      const proIcon = L.divIcon({
        className: 'custom-pro-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: white; border: 1.5px solid #ff6a00; padding: 4px 10px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 800; font-size: 11px; color: #0f172a; white-space: nowrap; margin-bottom: 4px;">
              ${booking?.professional_name || 'Specialist'} &bull; ${liveEta} mins away
            </div>
            <div style="position: relative;">
              <div style="background: #10b981; color: white; width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16,185,129,0.5); border: 3px solid white; font-size: 22px; z-index: 10;">
                🛵
              </div>
              <div style="position: absolute; top: -6px; left: -6px; width: 58px; height: 58px; border-radius: 50%; background: rgba(16,185,129,0.25); animation: pulse 1.6s infinite;"></div>
            </div>
          </div>
        `,
        iconSize: [120, 75],
        iconAnchor: [60, 68],
      });
      proMarkerRef.current.setIcon(proIcon);
    }

    if (polylineRef.current && proCoords && custCoords) {
      polylineRef.current.setLatLngs([
        [proCoords.lat, proCoords.lng],
        [custCoords.lat, custCoords.lng],
      ]);
    }
  }, [proCoords, custCoords, liveEta]);

  // Live simulation for testing
  const handleStartSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      return;
    }

    if (!custCoords || !proCoords) return;

    setActiveStage('on_the_way');
    setIsSimulating(true);
    let step = 0;
    const totalSteps = 15;
    const startLat = proCoords.lat;
    const startLng = proCoords.lng;
    const destLat = custCoords.lat;
    const destLng = custCoords.lng;

    simIntervalRef.current = setInterval(() => {
      step += 1;
      const progress = step / totalSteps;
      const currentLat = startLat + (destLat - startLat) * progress;
      const currentLng = startLng + (destLng - startLng) * progress;

      setProCoords({ lat: currentLat, lng: currentLng });

      const remDistance = Math.max(0.05, Number((0.8 * (1 - progress)).toFixed(2)));
      setLiveDistance(remDistance);
      const remEta = Math.max(1, Math.round(3 * (1 - progress)));
      setLiveEta(remEta);

      // Also emit simulation coordinates through socket
      if (socketRef.current) {
        socketRef.current.emit('professional:location', {
          bookingId,
          latitude: currentLat,
          longitude: currentLng,
          etaMinutes: remEta,
          distanceKm: remDistance,
        });
      }

      if (step >= totalSteps) {
        clearInterval(simIntervalRef.current);
        setIsSimulating(false);
        setLiveEta(0);
        setLiveDistance(0);
        setActiveStage('arrived');
        bookingsAPI.updateStatus(bookingId, 'arrived');
      }
    }, 1200);
  };

  const handleResetSimulation = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setIsSimulating(false);
    setLiveEta(3);
    setLiveDistance(0.8);
    setActiveStage('on_the_way');
    fetchTrackingData(true);
  };

  const handleRecenter = () => {
    if (mapInstance.current && custCoords && proCoords) {
      const bounds = L.latLngBounds([
        [proCoords.lat, proCoords.lng],
        [custCoords.lat, custCoords.lng],
      ]);
      mapInstance.current.fitBounds(bounds, { padding: [80, 80] });
    }
  };

  const handleSetStage = async (stage) => {
    setActiveStage(stage);
    let newStatus = 'accepted';
    if (stage === 'on_the_way') newStatus = 'on_the_way';
    else if (stage === 'arrived') newStatus = 'arrived';
    else if (stage === 'working') newStatus = 'working';
    else if (stage === 'payment_pending') newStatus = 'payment_pending';
    else if (stage === 'completed') newStatus = 'payment_completed';

    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      setBooking((prev) => ({ ...prev, status: newStatus }));
      if (newStatus === 'payment_completed') {
        loadInvoice();
      }
    } catch (err) {
      console.warn('Status update sync error:', err);
    }
  };

  // ===================== RAZORPAY TEST MODE ONLINE PAYMENT =====================
  const handleRazorpayOnlinePayment = async () => {
    setIsProcessingPayment(true);
    try {
      // 1. Create order on backend
      const orderRes = await paymentsAPI.createOrder({ bookingId });
      const orderData = orderRes.data.data;

      // 2. Open Razorpay Checkout modal
      if (!window.Razorpay) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'SabFix Marketplace',
        description: `Payment for ${booking?.service_name || 'Home Repair'}`,
        image: '/Logo_Sabfix.png',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify signature strictly on backend
            const verifyRes = await paymentsAPI.verifyPayment({
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifiedData = verifyRes.data.data;
            setPaymentSuccessData({
              paymentMethod: 'RAZORPAY',
              transactionId: response.razorpay_payment_id,
              totalAmount: verifiedData.payment?.total_amount || orderData.amountInRupees,
              invoiceNo: verifiedData.invoice?.invoice_no,
            });
            setInvoice(verifiedData.invoice);
            setActiveStage('completed');
            setBooking((prev) => ({ ...prev, status: 'payment_completed' }));
          } catch (verErr) {
            alert(verErr.response?.data?.message || 'Payment signature verification failed');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || booking?.customer_name || 'Customer',
          email: user?.email || 'customer@sabfix.in',
          contact: user?.phone || booking?.customer_phone || '9876543210',
        },
        theme: {
          color: '#ff6a00',
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate Razorpay payment');
      setIsProcessingPayment(false);
    }
  };

  // ===================== QR CODE GENERATION =====================
  const handleLoadQRCode = async () => {
    setLoadingQR(true);
    try {
      const res = await paymentsAPI.generateQR({ bookingId });
      setQrCodeData(res.data.data);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setLoadingQR(false);
    }
  };

  useEffect(() => {
    if (activeStage === 'payment_pending' && paymentMethodTab === 'qr' && !qrCodeData) {
      handleLoadQRCode();
    }
  }, [activeStage, paymentMethodTab]);

  // ===================== CASH PAYMENT (CUSTOMER CONFIRMATION) =====================
  const handleMarkCashPaid = async () => {
    setIsProcessingPayment(true);
    try {
      await paymentsAPI.markCashPaid({ bookingId });
      setCashPaidMarked(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark cash payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Connecting to SabFix Live Tracking...
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Fetching GPS coordinates &amp; real-time specialist location</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="card">
          <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Unable to Load Live Tracking</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
            {error || 'Booking record could not be found'}
          </p>
          <button onClick={() => navigate('/customer')} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const proName = booking.professional_name || 'Ramesh Kumar';
  const proPhone = booking.professional_phone || '+91 9876500101';
  const proRating = booking.professional_rating || 4.8;
  const proReviews = booking.professional_review_count || 124;
  const proExp = booking.professional_experience || 3;
  const serviceName = booking.service_name || 'Tap Repair';
  const bookingCode = booking.id ? `#FXG${booking.id.slice(0, 6).toUpperCase()}` : '#FXG123456';
  const customerAddress = booking.customer_address || 'B-302, Green Park Apartments, Connaught Place, New Delhi';

  // Fee calculation values (backend enforced ₹50)
  const serviceFee = parseFloat(booking.final_service_amount || booking.price || 350);
  const visitingCharge = parseFloat(booking.visiting_charge || 99);
  const platformFee = 50.0;
  const totalAmount = parseFloat(booking.total_amount || (serviceFee + visitingCharge).toFixed(2));

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-main)', minHeight: 'calc(100vh - 76px)', padding: '1.5rem 0 3rem' }}>
      <div className="container">
        {/* ===================== TOP BRANDING & CALLIGRAPHY HEADER ===================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <SabFixBrand size="md" showTagline={false} />
            </Link>
            <div style={{ width: '1px', height: '22px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.925rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Live Service Tracking &amp; Payment
            </span>
          </div>

          <div>
            <img
              src="/book-track-getitdone.png"
              alt="Book • Track • Get It Done"
              style={{ height: '36px', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* ===================== INTERACTIVE STAGE SWITCHER TABS ===================== */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'confirmed', label: '1. Confirmed' },
            { id: 'on_the_way', label: '2. Live Ride' },
            { id: 'arrived', label: '3. Arrived' },
            { id: 'working', label: '4. In Progress' },
            { id: 'payment_pending', label: '5. Bill & Pay' },
            { id: 'completed', label: '6. Receipt & Done' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSetStage(tab.id)}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: activeStage === tab.id ? 'var(--primary)' : 'transparent',
                color: activeStage === tab.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== RESPONSIVE MAIN WORKFLOW CONTAINER ===================== */}
        <div className="tracking-grid">
          {/* ===================== LEFT COLUMN: THE STATE CARD ===================== */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Top Back & Stage Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <button
                onClick={() => navigate('/customer')}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={18} />
                {activeStage === 'confirmed' && 'Booking Confirmed'}
                {activeStage === 'on_the_way' && 'Live GPS Tracking'}
                {activeStage === 'arrived' && 'Professional Arrived'}
                {activeStage === 'working' && 'Service In Progress'}
                {activeStage === 'payment_pending' && 'Pay Service Bill'}
                {activeStage === 'completed' && 'Booking Completed'}
              </button>

              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 106, 0, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={17} />
              </div>
            </div>

            {/* Location staleness indicator (Prompt 2 Section 23) */}
            {secondsSinceGpsUpdate >= 20 && ['confirmed', 'on_the_way'].includes(activeStage) && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.825rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Clock size={16} color="#d97706" />
                <span>
                  Professional's location was last updated {secondsSinceGpsUpdate} seconds ago.
                </span>
              </div>
            )}

            {/* ---------- STAGE 1: BOOKING CONFIRMED ---------- */}
            {activeStage === 'confirmed' && (
              <>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.65rem',
                    }}
                  >
                    <Check size={26} strokeWidth={3} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', marginBottom: '0.35rem' }}>
                    Your booking is confirmed!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#15803d', margin: 0, lineHeight: 1.45 }}>
                    {proName} will be at your location shortly. Track his live ride on the map.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-main)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src="/pro-arrived-avatar.png"
                      alt={proName}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{proName}</strong>
                        <ShieldCheck size={16} color="#16a34a" fill="#16a34a" />
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{serviceName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <span>{proRating} ({proReviews} reviews)</span>
                        <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
                        <span style={{ color: 'var(--text-muted)' }}>{proExp}+ yrs exp.</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${proPhone}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(255, 106, 0, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 106, 0, 0.25)',
                    }}
                  >
                    <Phone size={18} />
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Wrench size={18} color="var(--primary)" />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Category</span>
                      <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>{serviceName}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={18} color="var(--primary)" />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Expected Arrival</span>
                      <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>In ~{liveEta} mins</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛵</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Doorstep Visiting Charge:</span>
                      <strong style={{ color: '#16a34a', fontSize: '1rem' }}>₹{booking.visiting_charge || 99}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStage('on_the_way')}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '14px', padding: '0.85rem' }}
                >
                  View Live Map Ride &rarr;
                </button>
              </>
            )}

            {/* ---------- STAGE 2: LIVE TRACKING (ON THE WAY) ---------- */}
            {activeStage === 'on_the_way' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src="/pro-arrived-avatar.png"
                      alt={proName}
                      style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{proName}</strong>
                        <ShieldCheck size={16} color="#16a34a" fill="#16a34a" />
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {serviceName} &bull; {proExp}+ yrs exp.
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.15rem' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <span>{proRating} ({proReviews})</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${proPhone}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(255, 106, 0, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 106, 0, 0.25)',
                    }}
                  >
                    <Phone size={18} />
                  </a>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid rgba(255, 106, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 15px -2px rgba(255, 106, 0, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(255, 106, 0, 0.12)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}
                    >
                      🛵
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary)', display: 'block' }}>
                        On the way to your door
                      </strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 750 }}>
                        {liveEta > 0 ? `Arriving in ${liveEta} mins` : 'Arrived at your location'} &bull; {liveDistance} km
                      </span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(95, Math.max(15, 100 - (liveDistance / 1.2) * 100))}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: '999px',
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Delivery Address</span>
                      <strong style={{ color: 'var(--text-main)' }}>{customerAddress}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------- STAGE 3: PROFESSIONAL ARRIVED ---------- */}
            {activeStage === 'arrived' && (
              <>
                <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
                  <img
                    src="/pro-arrived-avatar.png"
                    alt={proName}
                    style={{ width: '110px', height: '110px', objectFit: 'contain', margin: '0 auto 1.25rem' }}
                  />
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {proName} has arrived at your location!
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                    Please meet the specialist to explain the problem and start the repair.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a
                    href={`tel:${proPhone}`}
                    className="btn"
                    style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      borderRadius: '14px',
                      padding: '0.95rem',
                      fontSize: '1rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)',
                    }}
                  >
                    <Phone size={18} /> Call Professional ({proPhone})
                  </a>

                  <button
                    onClick={() => handleSetStage('working')}
                    className="btn"
                    style={{
                      background: 'transparent',
                      color: 'var(--primary)',
                      border: '1.5px solid var(--primary)',
                      borderRadius: '14px',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Wrench size={18} /> Specialist Started Work &rarr;
                  </button>
                </div>
              </>
            )}

            {/* ---------- STAGE 4: SERVICE IN PROGRESS ---------- */}
            {activeStage === 'working' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <img
                    src="/pro-arrived-avatar.png"
                    alt={proName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{proName}</strong>
                      <ShieldCheck size={15} color="#16a34a" fill="#16a34a" />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {serviceName} &bull; {proExp}+ yrs exp.
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16a34a', fontWeight: 800, fontSize: '0.95rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
                      Service In Progress
                    </div>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a', fontFamily: 'monospace' }}>
                      {formatTimer(workingSeconds)}
                    </strong>
                  </div>
                  <p style={{ color: '#15803d', fontSize: '0.875rem', margin: 0 }}>
                    Professional is currently repairing and addressing your requested service.
                  </p>
                </div>

                <button
                  onClick={() => handleSetStage('payment_pending')}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '14px', padding: '0.9rem', fontWeight: 800 }}
                >
                  Work Completed &bull; Proceed to Final Bill &rarr;
                </button>
              </>
            )}

            {/* ---------- STAGE 5: FINAL SERVICE BILL & PAYMENT (SECTIONS 10-15) ---------- */}
            {activeStage === 'payment_pending' && (
              <>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <span className="badge badge-verified" style={{ marginBottom: '0.35rem' }}>
                    ✓ Work Completed
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                    Final Service Bill
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Review charges entered by {proName} and select your payment mode.
                  </p>
                </div>

                {/* Itemized charges table */}
                <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                        Professional Service Fee
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual repair &amp; labor charges</span>
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                      ₹{serviceFee.toFixed(2)}
                    </strong>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                        Visiting Charge
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Doorstep inspection &amp; travel</span>
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                      ₹{visitingCharge.toFixed(2)}
                    </strong>
                  </div>

                  <div style={{ padding: '0.65rem 1rem', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        SabFix Platform Fee (included):
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ₹{platformFee.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255, 106, 0, 0.08)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>Total Amount Payable</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.85, display: 'block' }}>Verified by SabFix backend</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Select Payment Method:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      onClick={() => setPaymentMethodTab('online')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '12px',
                        border: paymentMethodTab === 'online' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethodTab === 'online' ? 'rgba(255, 106, 0, 0.12)' : 'var(--bg-main)',
                        color: paymentMethodTab === 'online' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <CreditCard size={18} color={paymentMethodTab === 'online' ? 'var(--primary)' : 'var(--text-muted)'} />
                      Razorpay Online
                    </button>

                    <button
                      onClick={() => setPaymentMethodTab('qr')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '12px',
                        border: paymentMethodTab === 'qr' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethodTab === 'qr' ? 'rgba(255, 106, 0, 0.12)' : 'var(--bg-main)',
                        color: paymentMethodTab === 'qr' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <QrCode size={18} color={paymentMethodTab === 'qr' ? 'var(--primary)' : 'var(--text-muted)'} />
                      Scan UPI QR
                    </button>

                    <button
                      onClick={() => setPaymentMethodTab('cash')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '12px',
                        border: paymentMethodTab === 'cash' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethodTab === 'cash' ? 'rgba(255, 106, 0, 0.12)' : 'var(--bg-main)',
                        color: paymentMethodTab === 'cash' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Banknote size={18} color={paymentMethodTab === 'cash' ? 'var(--primary)' : 'var(--text-muted)'} />
                      Pay Cash
                    </button>
                  </div>

                  {/* Mode 1: Razorpay Online */}
                  {paymentMethodTab === 'online' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Pay safely via UPI, Credit/Debit Card, or Netbanking using Razorpay test mode.
                      </p>

                      <button
                        onClick={handleRazorpayOnlinePayment}
                        disabled={isProcessingPayment}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          borderRadius: '14px',
                          padding: '0.95rem',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)',
                        }}
                      >
                        {isProcessingPayment ? 'Connecting Razorpay...' : `Pay ₹${totalAmount.toFixed(2)} Online`}
                      </button>
                    </div>
                  )}

                  {/* Mode 2: Dynamic UPI QR Code */}
                  {paymentMethodTab === 'qr' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      {loadingQR ? (
                        <div style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>Generating payment QR...</div>
                      ) : qrCodeData ? (
                        <div>
                          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'inline-block', marginBottom: '0.75rem' }}>
                            <img
                              src={qrCodeData.qrCodeDataUrl}
                              alt="Payment QR"
                              style={{ width: '180px', height: '180px', display: 'block' }}
                            />
                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', display: 'block', marginTop: '0.5rem' }}>
                              ₹{totalAmount.toFixed(2)}
                            </strong>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            Scan using Google Pay, PhonePe, Paytm or any UPI app.
                          </p>
                        </div>
                      ) : (
                        <button onClick={handleLoadQRCode} className="btn btn-secondary btn-sm">
                          Generate QR Code
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Cash Payment Two-Way Confirmation */}
                  {paymentMethodTab === 'cash' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Cash Amount to Hand Over:</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>
                          ₹{totalAmount.toFixed(2)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Please hand cash directly to {proName}</span>
                      </div>

                      {cashPaidMarked ? (
                        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '14px', padding: '1rem', color: '#b45309', fontSize: '0.85rem' }}>
                          <Clock size={18} style={{ margin: '0 auto 0.4rem', display: 'block' }} />
                          <strong>Cash Marked Paid!</strong>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                            Waiting for {proName} to tap "Confirm Cash Received" on their dashboard.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handleMarkCashPaid}
                          disabled={isProcessingPayment}
                          className="btn btn-success"
                          style={{
                            width: '100%',
                            borderRadius: '14px',
                            padding: '0.9rem',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                          }}
                        >
                          <Check size={18} /> I Have Paid Cash (₹{totalAmount.toFixed(2)})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ---------- STAGE 6: COMPLETED & INVOICE GENERATED (SECTIONS 18-22) ---------- */}
            {activeStage === 'completed' && (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={36} strokeWidth={3} />
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Payment Successful! ✓
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  ₹{totalAmount.toFixed(2)} paid via {booking.payment_method || 'Online'}
                </p>

                {/* Receipt Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Invoice No:</span>
                    <strong style={{ color: '#0f172a' }}>{invoice?.invoice_no || booking.invoice_id || 'FXG-2026-INV'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Labor &amp; Service Fee:</span>
                    <strong>₹{serviceFee.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Visiting Charge:</span>
                    <strong>₹{visitingCharge.toFixed(2)}</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
                    <span>Total Paid:</span>
                    <span style={{ color: '#16a34a' }}>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Invoice Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => {
                      if (!invoice) loadInvoice();
                      setIsInvoiceModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
                  >
                    <FileText size={18} /> View Official Invoice
                  </button>

                  <button
                    onClick={() => {
                      if (invoice) downloadInvoicePDF(invoice);
                      else loadInvoice();
                    }}
                    className="btn btn-secondary"
                    style={{ borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Download size={18} /> Download Invoice (PDF)
                  </button>
                </div>

                {/* Rate Specialist Section */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                    Rate {proName}'s Service:
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={26}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setRating(star);
                          setHasRated(true);
                        }}
                      />
                    ))}
                  </div>
                  {hasRated && (
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Thank you for rating {rating} stars!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ===================== BOTTOM STEPPER (MATCHING REFERENCE UI) ===================== */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                {[
                  { id: 'confirmed', label: 'Confirmed', icon: '✓' },
                  { id: 'on_the_way', label: 'On Ride', icon: '🛵' },
                  { id: 'arrived', label: 'Arrived', icon: '📍' },
                  { id: 'working', label: 'Working', icon: '🔧' },
                  { id: 'payment_pending', label: 'Pay', icon: '💳' },
                  { id: 'completed', label: 'Done', icon: '🎉' },
                ].map((s) => {
                  const order = ['confirmed', 'on_the_way', 'arrived', 'working', 'payment_pending', 'completed'];
                  const currIdx = order.indexOf(activeStage);
                  const thisIdx = order.indexOf(s.id);
                  const isDone = thisIdx < currIdx;
                  const isCurrent = thisIdx === currIdx;

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSetStage(s.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isDone ? '#10b981' : isCurrent ? 'var(--primary)' : 'var(--border)',
                          color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(255, 106, 0, 0.25)' : 'none',
                        }}
                      >
                        {isDone ? '✓' : s.icon}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? 'var(--primary)' : isDone ? '#10b981' : 'var(--text-muted)',
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN: THE INTERACTIVE LIVE MAP ===================== */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Map Header & Simulator Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  REAL-TIME GPS &bull; SOCKET.IO STREAM
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.1rem 0 0' }}>
                  Live OpenStreetMap Tracking
                </h3>
              </div>

              {/* Simulation Toolbar */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleStartSimulation}
                  className="btn btn-sm"
                  style={{
                    background: isSimulating ? '#ef4444' : 'var(--primary)',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: 700,
                    padding: '0.5rem 0.85rem',
                  }}
                >
                  <Play size={14} className={isSimulating ? 'animate-spin' : ''} />
                  {isSimulating ? 'Pause GPS Ride' : 'Simulate Live GPS Movement'}
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="btn btn-sm btn-secondary"
                  style={{ borderRadius: '10px' }}
                  title="Reset positions"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  onClick={handleRecenter}
                  className="btn btn-sm btn-secondary"
                  style={{ borderRadius: '10px' }}
                  title="Recenter Map"
                >
                  <Compass size={14} />
                </button>
              </div>
            </div>

            {/* Map Canvas Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '540px',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              {/* Floating "• Live location" pill badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#0f172a',
                  color: 'white',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '999px',
                  zIndex: 400,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: gpsStatus === 'live' ? '#10b981' : '#f59e0b',
                    boxShadow: `0 0 0 3px ${gpsStatus === 'live' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  }}
                />
                {activeStage === 'arrived' || liveEta === 0
                  ? 'Specialist at your doorstep'
                  : `🟢 Live location &bull; ${liveEta} mins away (${liveDistance} km)`}
              </div>

              {/* Leaflet Map DOM Node */}
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Bottom Map Info Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-main)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓ Zero Paid APIs:</span>
                <span style={{ color: 'var(--text-muted)' }}>PostgreSQL PostGIS GPS + OpenStreetMap &amp; Leaflet</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Doorstep Visiting Fee:</span>{' '}
                <strong style={{ color: 'var(--primary)' }}>₹{booking.visiting_charge || 99}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal for Viewing and Downloading */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={
          invoice || {
            invoice_no: booking.invoice_id || 'SABFIX-20261004-98124',
            booking_id: booking.id,
            customer_name: booking.customer_name || user?.name || 'Customer',
            customer_phone: booking.customer_phone || user?.phone || '9876543210',
            customer_address: customerAddress,
            professional_name: proName,
            professional_phone: proPhone,
            service_name: serviceName,
            service_amount: serviceFee,
            visiting_fee: visitingCharge,
            platform_fee: 50.0,
            total_amount: totalAmount,
            professional_net_amount: totalAmount - 50.0,
            payment_method: booking.payment_method || 'RAZORPAY',
            payment_status: 'PAID',
            created_at: booking.completed_at || new Date().toISOString(),
          }
        }
      />
    </div>
  );
}
