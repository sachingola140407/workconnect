import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export default function InstallAppModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if running inside Capacitor native app
  const isCapacitor =
    typeof window !== 'undefined' &&
    (window.Capacitor !== undefined || window.location.protocol === 'capacitor:');

  useEffect(() => {
    // If inside the native Android/Capacitor app, never show the install prompt
    if (isCapacitor) return;

    // Listen for browser PWA install event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for external open triggers (e.g. clicking "Install App" in Navbar)
    const handleOpenTrigger = () => {
      setIsOpen(true);
    };
    window.addEventListener('sabfix:open-install-modal', handleOpenTrigger);

    // Auto popup after opening website
    const dismissedTime = sessionStorage.getItem('sabfix_install_modal_dismissed_at');
    const isRecentlyDismissed = dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 120000;
    let timer;
    if (!isRecentlyDismissed) {
      timer = setTimeout(() => {
        setIsOpen(true);
      }, 1600);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('sabfix:open-install-modal', handleOpenTrigger);
      if (timer) clearTimeout(timer);
    };
  }, [isCapacitor]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('sabfix_install_modal_dismissed_at', Date.now().toString());
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        handleClose();
        return;
      }
    }
    // Fallback: Trigger direct APK download
    handleDownloadAPK();
  };

  const handleDownloadAPK = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/SabFix.apk';
    link.download = 'SabFix.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setIsDownloading(false);
      handleClose();
    }, 1500);
  };

  if (!isOpen || isCapacitor) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 19, 32, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0b1320)',
          borderRadius: '24px',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Decorative Gradient Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 50%, #d44d00 100%)',
            padding: '1.5rem 1.5rem 1rem',
            position: 'relative',
            color: '#ffffff',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.2)')}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#ffffff',
                padding: '6px',
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/favicon.png"
                alt="SabFix App"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span style="font-size:24px;font-weight:900;color:#ff6a00">SF</span>';
                }}
              />
            </div>

            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.22)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                  marginBottom: '4px',
                }}
              >
                Official Android App
              </span>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.2 }}>
                Install SabFix App
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.25rem', fontSize: '14px', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
            Experience 10x faster service booking, live GPS tracking of electricians &amp; plumbers, and direct notifications right on your phone!
          </p>

          {/* Benefits Feature List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '1.5rem',
              background: 'var(--bg-card-hover, #f8fafc)',
              borderRadius: '16px',
              padding: '12px 14px',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
              <div style={{ color: '#ff6a00', display: 'flex' }}><Zap size={16} /></div>
              <span>Instant Live GPS Professional Tracking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
              <div style={{ color: '#10b981', display: 'flex' }}><ShieldCheck size={16} /></div>
              <span>100% Verified Local Technicians in 10 KM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
              <div style={{ color: '#0284c7', display: 'flex' }}><Smartphone size={16} /></div>
              <span>One-Tap Quick Bookings without Browser</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Primary Install Button */}
            <button
              onClick={deferredPrompt ? handleInstallPWA : handleDownloadAPK}
              disabled={isDownloading}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ff6a00 0%, #ee5a00 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(255, 106, 0, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              {isDownloading ? (
                <>Downloading SabFix...</>
              ) : (
                <>
                  <Download size={18} />
                  {deferredPrompt ? 'Install App on Device' : 'Download SabFix APK (12.8 MB)'}
                </>
              )}
            </button>

            {/* Direct APK Link fallback button if PWA is supported */}
            {deferredPrompt && (
              <button
                onClick={handleDownloadAPK}
                disabled={isDownloading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#ff6a00',
                  border: '1.5px solid #ff6a00',
                  fontSize: '13px',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download size={15} /> Download APK Directly
              </button>
            )}

            {/* Dismiss Option */}
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                color: 'var(--text-light, #94a3b8)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Continue on Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
