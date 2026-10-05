import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingsAPI, paymentsAPI, getSocketUrl } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import LocationPickerMap from '../components/LocationPickerMap';
import {
  Briefcase,
  Star,
  CheckCircle,
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
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const pro = user?.professional || {};

  const [isAvailable, setIsAvailable] = useState(pro.isAvailable ?? true);
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Edit fields
  const [bio, setBio] = useState(pro.bio || '');
  const [experience, setExperience] = useState(pro.experience || 0);
  const [price, setPrice] = useState(pro.price || 0);
  const [address, setAddress] = useState(pro.address || '');
  const [proCoords, setProCoords] = useState({
    lat: pro.latitude || 27.1767,
    lng: pro.longitude || 78.0081,
  });
  const [showEditMapPicker, setShowEditMapPicker] = useState(false);

  // Bookings / Service Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Financial Earnings & Dues state (Section 24 & 16)
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    completedJobs: 0,
    platformFees: 0,
    pendingPlatformFees: 0,
    netEarnings: 0,
    transactions: [],
  });
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  // Bill Submission Modal state
  const [selectedJobForBill, setSelectedJobForBill] = useState(null);
  const [billServiceFee, setBillServiceFee] = useState('');
  const [billVisitingCharge, setBillVisitingCharge] = useState('99');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // Collect Payment / QR / Cash Modal state
  const [selectedJobForPayment, setSelectedJobForPayment] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [isConfirmingCash, setIsConfirmingCash] = useState(false);

  // Settle Platform Fee state
  const [settlingFeeId, setSettlingFeeId] = useState(null);

  // Invoice Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Notifications
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // GPS Streaming state
  const [activeTrackingJobId, setActiveTrackingJobId] = useState(null);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?.professional) {
      setIsAvailable(user.professional.isAvailable ?? true);
      setBio(user.professional.bio || '');
      setExperience(user.professional.experience || 0);
      setPrice(user.professional.price || 0);
      setAddress(user.professional.address || '');
    }
  }, [user]);

  // Connect Socket.IO
  useEffect(() => {
    const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Pro Socket] Connected to SabFix gateway');
    });

    socket.on('payment:cash-customer-paid', ({ bookingId }) => {
      setMessage(`Customer marked cash paid for job #${bookingId.slice(0, 6)}. Please confirm receipt.`);
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
      setJobs(res.data.data || []);
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
        setEarnings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchEarnings();
    const interval = setInterval(() => {
      fetchJobs();
      fetchEarnings();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real GPS tracking using navigator.geolocation.watchPosition (Section 2)
  const startGpsTracking = (jobId) => {
    setActiveTrackingJobId(jobId);

    if (navigator.geolocation) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          console.log(`[GPS Stream] Lat: ${latitude}, Lng: ${longitude}, Acc: ${accuracy}`);

          // Emit over Socket.IO to customer
          if (socketRef.current) {
            socketRef.current.emit('professional:location', {
              bookingId: jobId,
              latitude,
              longitude,
              accuracy,
              speed,
              heading,
            });
          }

          // Update backend location
          bookingsAPI.updateTrackingLocation(jobId, { latitude, longitude }).catch(() => {});
        },
        (err) => {
          console.warn('[GPS Warning] Geolocation permission or sensor issue:', err.message);
          // Fallback simulation for dev/desktop testing
          simulateMovingCoords(jobId);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000,
        }
      );
    } else {
      simulateMovingCoords(jobId);
    }
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setActiveTrackingJobId(null);
  };

  const simulateMovingCoords = (jobId) => {
    let currentLat = 28.6139;
    let currentLng = 77.2090;

    const interval = setInterval(() => {
      currentLat += 0.0005;
      currentLng += 0.0004;

      if (socketRef.current) {
        socketRef.current.emit('professional:location', {
          bookingId: jobId,
          latitude: currentLat,
          longitude: currentLng,
        });
      }
      bookingsAPI.updateTrackingLocation(jobId, { latitude: currentLat, longitude: currentLng }).catch(() => {});
    }, 4000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  // Handle live availability toggle
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
      setMessage(`Status updated: You are now ${newStatus ? 'ONLINE & AVAILABLE' : 'OFFLINE / BUSY'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability status');
    } finally {
      setIsUpdatingAvail(false);
    }
  };

  // Handle saving professional profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await userAPI.updateProfessionalProfile({
        bio,
        experience,
        price,
        address,
        latitude: proCoords?.lat,
        longitude: proCoords?.lng,
      });

      updateUser({
        professional: {
          ...user.professional,
          ...res.data.data,
        },
      });
      setIsEditing(false);
      setMessage('Professional profile updated successfully on SabFix!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update professional profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== COMPLETE LIFECYCLE HANDLERS =====================

  // 1. Accept / Reject
  const handleAcceptJob = async (jobId) => {
    try {
      await bookingsAPI.updateStatus(jobId, 'accepted');
      fetchJobs();
      setMessage('Booking Accepted! You can now start your journey when ready.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await bookingsAPI.updateStatus(jobId, 'rejected');
      fetchJobs();
      setMessage('Booking rejected');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
  };

  // 2. Start Journey -> on_the_way (starts real GPS stream)
  const handleStartJourney = async (jobId) => {
    try {
      await bookingsAPI.updateStatus(jobId, 'on_the_way');
      startGpsTracking(jobId);
      fetchJobs();
      setMessage('🛵 Journey started! Real-time GPS stream is now active for the customer.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start journey');
    }
  };

  // 3. I've Arrived -> arrived
  const handleMarkArrived = async (jobId) => {
    try {
      await bookingsAPI.updateStatus(jobId, 'arrived');
      fetchJobs();
      setMessage('📍 Marked as Arrived! Customer notified that you are at their doorstep.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark arrival');
    }
  };

  // 4. Start Work -> working
  const handleStartWork = async (jobId) => {
    try {
      await bookingsAPI.updateStatus(jobId, 'working');
      fetchJobs();
      setMessage('🔧 Work started! Service stopwatch is now running.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start work');
    }
  };

  // 5. Complete Work -> opens final bill modal
  const handleCompleteWorkPrompt = (job) => {
    setSelectedJobForBill(job);
    setBillServiceFee(job.final_service_amount || job.price || '850');
    setBillVisitingCharge(job.visiting_charge || '100');
  };

  // 6. Submit Final Bill (Section 10 & 11)
  const handleSubmitFinalBill = async (e) => {
    e.preventDefault();
    if (!selectedJobForBill) return;

    setIsSubmittingBill(true);
    setError(null);
    try {
      await paymentsAPI.submitBill({
        bookingId: selectedJobForBill.id,
        serviceAmount: parseFloat(billServiceFee),
        visitingCharge: parseFloat(billVisitingCharge),
      });

      setMessage('Final bill submitted successfully to customer! Waiting for payment.');
      setSelectedJobForBill(null);
      fetchJobs();
      fetchEarnings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit final bill');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // 7. Collect Payment modal (QR & Cash)
  const handleOpenCollectPayment = async (job) => {
    setSelectedJobForPayment(job);
    setLoadingQR(true);
    try {
      const res = await paymentsAPI.generateQR({ bookingId: job.id });
      setQrCodeData(res.data.data);
    } catch (err) {
      console.error('Failed to load payment QR:', err);
    } finally {
      setLoadingQR(false);
    }
  };

  // 8. Confirm Cash Received (Section 15)
  const handleConfirmCashReceived = async (jobId) => {
    setIsConfirmingCash(true);
    try {
      const res = await paymentsAPI.confirmCashReceived({ bookingId: jobId });
      setMessage('Cash payment confirmed and invoice generated! SabFix ₹50 platform fee recorded as due.');
      setSelectedJobForPayment(null);
      fetchJobs();
      fetchEarnings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm cash receipt');
    } finally {
      setIsConfirmingCash(false);
    }
  };

  // 9. Settle Platform Fee (Section 16)
  const handleSettlePlatformFee = async (paymentId, amount = 50) => {
    setSettlingFeeId(paymentId);
    try {
      // Create Razorpay checkout for settling platform fee
      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag',
          amount: Math.round(amount * 100), // ₹50.00 = 5000 paise
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
            name: user?.name || 'Professional Partner',
            email: user?.email || 'partner@sabfix.in',
            contact: user?.phone || '9876543210',
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
        // Instant test settlement
        await paymentsAPI.settlePlatformFee({
          paymentId,
          razorpayPaymentId: `TEST_SETTLE_${Date.now()}`,
        });
        setMessage('Platform fee settled successfully!');
        fetchEarnings();
        setSettlingFeeId(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to settle platform fee');
      setSettlingFeeId(null);
    }
  };

  // View Invoice
  const handleViewInvoice = async (bookingId) => {
    try {
      const res = await paymentsAPI.getInvoice(bookingId);
      if (res.data?.data) {
        setSelectedInvoice(res.data.data);
      } else {
        alert('Invoice not available yet for this booking');
      }
    } catch (err) {
      alert('Invoice not yet generated');
    }
  };

  // Calculate bill preview
  const previewService = parseFloat(billServiceFee) || 0;
  const previewVisiting = parseFloat(billVisitingCharge) || 0;
  const previewTotal = previewService + previewVisiting;
  const previewNet = Math.max(0, previewTotal - 50.0);

  return (
    <div style={{ padding: '2.5rem 0', background: 'var(--bg-main)', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--secondary)' }}>
                SabFix Partner Operations
              </h1>
              <span className="badge badge-professional">Verified Partner</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage active jobs, stream live GPS ride, submit final bills, and track earnings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={15} />
              {isEditing ? 'Cancel Edit' : 'Edit Rates & Bio'}
            </button>
          </div>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle size={18} />
            <div>{message}</div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <div>{error}</div>
          </div>
        )}

        {/* Real-time Status Banner */}
        <div className="card" style={{ marginBottom: '1.75rem', background: isAvailable ? '#f0fdf4' : '#fef2f2', borderColor: isAvailable ? '#bbf7d0' : '#fecaca' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: isAvailable ? 'var(--success)' : 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isAvailable ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: isAvailable ? '#15803d' : '#b91c1c' }}>
                  Status: {isAvailable ? 'Available for Customer Jobs' : 'Currently Offline / Busy'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isAvailable
                    ? 'Customers searching in your neighborhood can view and book your services.'
                    : 'Your profile is temporarily hidden from nearby customer search results.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAvailability}
              disabled={isUpdatingAvail}
              className={`btn ${isAvailable ? 'btn-danger' : 'btn-success'}`}
            >
              {isAvailable ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
              {isUpdatingAvail ? 'Updating...' : isAvailable ? 'Go Offline / Busy' : 'Go Available Now'}
            </button>
          </div>
        </div>

        {/* ===================== FINANCIAL EARNINGS & PLATFORM FEES DASHBOARD (SECTION 24 & 16) ===================== */}
        <div className="card" style={{ marginBottom: '2rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={22} color="#1e3a8a" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Partner Earnings &amp; Platform Fee Balance
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Updated Live</span>
          </div>

          <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* 1. Today's Earnings */}
            <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Today's Earnings
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '0.35rem' }}>
                ₹{earnings.todayEarnings.toFixed(2)}
              </div>
            </div>

            {/* 2. Completed Jobs */}
            <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Completed Jobs
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a', marginTop: '0.35rem' }}>
                {earnings.completedJobs}
              </div>
            </div>

            {/* 3. Platform Fees Paid */}
            <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Platform Fees Paid
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#64748b', marginTop: '0.35rem' }}>
                ₹{earnings.platformFees.toFixed(2)}
              </div>
            </div>

            {/* 4. Pending Platform Fees (Section 16) */}
            <div style={{ background: earnings.pendingPlatformFees > 0 ? '#fffbeb' : '#f0fdf4', padding: '1.1rem', borderRadius: '16px', border: `1.5px solid ${earnings.pendingPlatformFees > 0 ? '#fde68a' : '#bbf7d0'}`, textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: earnings.pendingPlatformFees > 0 ? '#b45309' : '#15803d', textTransform: 'uppercase' }}>
                Platform Fee Due
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: earnings.pendingPlatformFees > 0 ? '#d97706' : '#16a34a', marginTop: '0.35rem' }}>
                ₹{earnings.pendingPlatformFees.toFixed(2)}
              </div>
              {earnings.pendingPlatformFees > 0 ? (
                <button
                  onClick={() => handleSettlePlatformFee(earnings.transactions.find((t) => t.platform_fee_status === 'PENDING')?.payment_id || 1, earnings.pendingPlatformFees)}
                  className="btn btn-sm btn-warning"
                  style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  Pay Platform Fee &rarr;
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'block', marginTop: '0.35rem' }}>
                  ✓ All Settled
                </span>
              )}
            </div>

            {/* 5. Net Earnings */}
            <div style={{ background: 'var(--primary-light)', padding: '1.1rem', borderRadius: '16px', border: '1.5px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 750, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Net Partner Take-Home
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.35rem' }}>
                ₹{earnings.netEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Transaction History Table (Section 24) */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.85rem' }}>
              Recent Completed Transactions
            </h3>

            {earnings.transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                No completed payment transactions recorded yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Gross Total</th>
                      <th>Platform Fee</th>
                      <th>Net Take-Home</th>
                      <th>Mode</th>
                      <th>Fee Status</th>
                      <th style={{ textAlign: 'right' }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.transactions.map((tx) => (
                      <tr key={tx.payment_id}>
                        <td><strong>#{String(tx.booking_id).slice(0, 8).toUpperCase()}</strong></td>
                        <td>{tx.customer_name}</td>
                        <td><span className="badge badge-customer">{tx.service_name}</span></td>
                        <td><strong>₹{tx.total_amount.toFixed(2)}</strong></td>
                        <td style={{ color: '#64748b' }}>₹{tx.platform_fee.toFixed(2)}</td>
                        <td style={{ color: '#10b981', fontWeight: 800 }}>₹{tx.professional_net_amount.toFixed(2)}</td>
                        <td><span className="badge">{tx.payment_method}</span></td>
                        <td>
                          {tx.platform_fee_status === 'PAID' ? (
                            <span className="badge badge-verified">PAID</span>
                          ) : (
                            <button
                              onClick={() => handleSettlePlatformFee(tx.payment_id, tx.platform_fee)}
                              className="btn btn-sm btn-warning"
                              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            >
                              Pay ₹{tx.platform_fee}
                            </button>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleViewInvoice(tx.booking_id)}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                          >
                            <FileText size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ===================== INCOMING & ACTIVE SERVICE REQUESTS (SECTION 9) ===================== */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ClipboardList size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Service Requests &amp; Active Jobs
              </h3>
            </div>
            <span className="badge badge-customer">{jobs.length} Total Jobs</span>
          </div>

          {loadingJobs ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              Loading service inquiries...
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <p>No active service requests right now. Keep your status <strong>Available</strong> to receive nearby customer leads!</p>
            </div>
          ) : (
            <>
              {/* Prompt 2 Section 6: Prominent Incoming Service Request Card */}
              {jobs.filter((j) => j.status === 'pending').map((pj) => {
                const distKm = pj.distance_km || 2.4;
                const travelMins = Math.max(5, Math.round(distKm * 3.5 + 2));
                return (
                  <div
                    key={`pending-${pj.id}`}
                    style={{
                      background: 'var(--primary-light)',
                      border: '2px solid var(--primary)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      boxShadow: '0 4px 16px rgba(255, 106, 0, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            marginBottom: '0.5rem',
                          }}
                        >
                          🔔 New Service Request
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                          Customer: {pj.customer_name}
                        </h4>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                          <strong>Service:</strong> <span className="badge badge-customer">{pj.service_name}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          <strong>Customer Location:</strong> {pj.customer_address}
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                          <span>🚗 Distance: {distKm} KM</span>
                          <span>⏱️ Estimated Travel Time: {travelMins} minutes</span>
                          <span>Visiting Fee: ₹{pj.visiting_charge || 99}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleAcceptJob(pj.id)}
                          className="btn btn-success"
                          style={{ fontWeight: 800, padding: '0.75rem 1.4rem', fontSize: '0.95rem' }}
                        >
                          ✓ ACCEPT REQUEST
                        </button>
                        <button
                          onClick={() => handleRejectJob(pj.id)}
                          className="btn btn-danger"
                          style={{ fontWeight: 700, padding: '0.75rem 1.1rem', fontSize: '0.95rem' }}
                        >
                          ✕ REJECT REQUEST
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                    <th>Fees &amp; Bill</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Lifecycle Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.customer_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.customer_phone || job.customer_email}</div>
                      </td>
                      <td>
                        <span className="badge badge-customer">{job.service_name}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>🛵 Visiting: ₹{job.visiting_charge || 99}</span>
                          {job.final_service_amount ? (
                            <span style={{ color: '#1e3a8a', fontWeight: 800, display: 'block' }}>
                              Total Bill: ₹{job.total_amount || job.final_service_amount}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem', display: 'block' }}>Base: ₹{job.price}/hr</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '240px' }}>{job.customer_address}</td>
                      <td>
                        <span
                          className={`badge ${
                            job.status === 'completed' || job.status === 'payment_completed'
                              ? 'badge-verified'
                              : job.status === 'on_the_way' || job.status === 'working'
                              ? 'badge-available'
                              : 'badge-admin'
                          }`}
                        >
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {/* 1. Pending: [ ACCEPT ] / [ REJECT ] */}
                        {job.status === 'pending' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleAcceptJob(job.id)}
                              className="btn btn-sm btn-success"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectJob(job.id)}
                              className="btn btn-sm btn-danger"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}

                        {/* 2. Accepted: [ START JOURNEY ] */}
                        {job.status === 'accepted' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleStartJourney(job.id)}
                              className="btn btn-sm btn-primary"
                              style={{ fontWeight: 800 }}
                            >
                              🛵 START JOURNEY
                            </button>
                            <button
                              onClick={() => navigate(`/track/${job.id}`)}
                              className="btn btn-sm btn-secondary"
                            >
                              Map View
                            </button>
                          </div>
                        )}

                        {/* 3. On The Way: [ I'VE ARRIVED ] */}
                        {job.status === 'on_the_way' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleMarkArrived(job.id)}
                              className="btn btn-sm btn-primary"
                              style={{ fontWeight: 800, background: '#10b981', borderColor: '#10b981' }}
                            >
                              📍 I'VE ARRIVED
                            </button>
                            <button
                              onClick={() => navigate(`/track/${job.id}`)}
                              className="btn btn-sm btn-secondary"
                            >
                              Map View
                            </button>
                          </div>
                        )}

                        {/* 4. Arrived: [ START WORK ] */}
                        {job.status === 'arrived' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleStartWork(job.id)}
                              className="btn btn-sm btn-primary"
                              style={{ fontWeight: 800 }}
                            >
                              🔧 START WORK
                            </button>
                            <button
                              onClick={() => navigate(`/track/${job.id}`)}
                              className="btn btn-sm btn-secondary"
                            >
                              Map View
                            </button>
                          </div>
                        )}

                        {/* 5. Working: [ COMPLETE WORK ] */}
                        {job.status === 'working' && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleCompleteWorkPrompt(job)}
                              className="btn btn-sm btn-success"
                              style={{ fontWeight: 800 }}
                            >
                              ✓ COMPLETE WORK
                            </button>
                            <button
                              onClick={() => navigate(`/track/${job.id}`)}
                              className="btn btn-sm btn-secondary"
                            >
                              Map View
                            </button>
                          </div>
                        )}

                        {/* 6. Work Completed / Payment Pending: [ ENTER BILL ] / [ COLLECT PAYMENT ] */}
                        {(job.status === 'work_completed' || job.status === 'payment_pending') && (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleCompleteWorkPrompt(job)}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '0.775rem' }}
                            >
                              Edit Bill
                            </button>
                            <button
                              onClick={() => handleOpenCollectPayment(job)}
                              className="btn btn-sm btn-primary"
                              style={{ fontWeight: 800 }}
                            >
                              <QrCode size={14} /> COLLECT PAYMENT
                            </button>
                          </div>
                        )}

                        {/* 7. Completed */}
                        {(job.status === 'payment_completed' || job.status === 'completed' || job.status === 'reviewed') && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800 }}>
                              ✓ PAID &amp; DONE
                            </span>
                            <button
                              onClick={() => handleViewInvoice(job.id)}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                            >
                              Invoice
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* ===================== FINAL SERVICE BILL MODAL (SECTIONS 10 & 11) ===================== */}
        {selectedJobForBill && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedJobForBill(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '520px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: '#1e3a8a', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Final Service Bill Submission
                  </h3>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                    Customer: {selectedJobForBill.customer_name} &bull; #{selectedJobForBill.id.slice(0, 6)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedJobForBill(null)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitFinalBill} style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Professional Service Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    value={billServiceFee}
                    onChange={(e) => setBillServiceFee(e.target.value)}
                    placeholder="e.g. 850"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fee for actual labor and parts supplied</span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Visiting Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    value={billVisitingCharge}
                    onChange={(e) => setBillVisitingCharge(e.target.value)}
                    placeholder="e.g. 100"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Doorstep inspection &amp; travel charge</span>
                </div>

                {/* Platform Fee Readonly Indicator (Section 10) */}
                <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>SabFix Platform Fee:</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'block', fontWeight: 700 }}>ENFORCED BY BACKEND</span>
                  </div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>₹50.00</strong>
                </div>

                {/* Calculation Breakdown Box */}
                <div style={{ background: 'var(--primary-light)', borderRadius: '14px', border: '1.5px solid var(--border)', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Customer Payable Total:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{previewTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a' }}>
                    <span>Your Net Take-Home (Total - ₹50):</span>
                    <strong>₹{previewNet.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBill}
                  className="btn btn-primary btn-block"
                  style={{ borderRadius: '14px', padding: '0.9rem', fontWeight: 800, fontSize: '1rem' }}
                >
                  {isSubmittingBill ? 'Submitting...' : 'Send Final Bill to Customer &rarr;'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================== COLLECT PAYMENT MODAL: QR & CASH (SECTIONS 14 & 15) ===================== */}
        {selectedJobForPayment && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedJobForPayment(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '460px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: '#1e3a8a', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Collect Customer Payment
                  </h3>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                    Payable Amount: ₹{selectedJobForPayment.total_amount || 950}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedJobForPayment(null)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '1rem' }}>
                  Present this QR code to the customer or collect cash below:
                </span>

                {/* QR Code Container */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: '1.25rem' }}>
                  {loadingQR ? (
                    <div style={{ padding: '3rem 2rem', color: '#64748b' }}>Generating QR Code...</div>
                  ) : qrCodeData ? (
                    <div>
                      <img
                        src={qrCodeData.qrCodeDataUrl}
                        alt="Collect Payment QR"
                        style={{ width: '200px', height: '200px', display: 'block' }}
                      />
                      <strong style={{ fontSize: '1.25rem', color: '#1e3a8a', display: 'block', marginTop: '0.5rem' }}>
                        ₹{selectedJobForPayment.total_amount || 950}
                      </strong>
                    </div>
                  ) : (
                    <div>Failed to load QR code</div>
                  )}
                </div>

                {/* Cash Received Button (Section 15) */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <button
                    onClick={() => handleConfirmCashReceived(selectedJobForPayment.id)}
                    disabled={isConfirmingCash}
                    className="btn btn-success btn-block"
                    style={{ borderRadius: '14px', padding: '0.9rem', fontWeight: 800, fontSize: '1rem' }}
                  >
                    <Check size={18} /> {isConfirmingCash ? 'Confirming...' : 'Confirm Cash Received (₹' + (selectedJobForPayment.total_amount || 950) + ')'}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.45rem' }}>
                    Tapping this finalizes the job and marks the ₹50 platform fee as due.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW INVOICE MODAL ===================== */}
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />

        {/* Profile Card & Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Professional Partner Profile
          </h3>

          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Operating / Base Address *</label>
                  <button
                    type="button"
                    onClick={() => setShowEditMapPicker(!showEditMapPicker)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <MapPin size={13} />
                    {showEditMapPicker ? 'Hide Map Picker' : 'Update Location on Map'}
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sanjay Place, Agra or Connaught Place, New Delhi"
                  required
                />

                {showEditMapPicker && (
                  <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                    <LocationPickerMap
                      initialLat={proCoords.lat}
                      initialLng={proCoords.lng}
                      initialAddress={address}
                      height="260px"
                      title="Pin Base Operating Location"
                      helpText="Drag pin or search to set your service home base"
                      onLocationSelect={(loc) => {
                        setProCoords({ lat: loc.latitude, lng: loc.longitude });
                        setAddress(loc.address);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Professional Bio &amp; Skill Specialties</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your expertise, certifications, and service equipment..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Saving Changes...' : 'Save Profile Rates'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Base Service Rate</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>₹{pro.price || 0}/hr</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Field Experience</span>
                <strong style={{ fontSize: '1.1rem' }}>{pro.experience || 0} Years</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Operating Address</span>
                <strong style={{ fontSize: '1rem' }}>{pro.address || 'New Delhi NCR'}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Rating &amp; Reviews</span>
                <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  {parseFloat(pro.rating || 0).toFixed(1)} ({pro.reviewCount || 0} reviews)
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
