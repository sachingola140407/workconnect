import React from 'react';
import { X, Download, ShieldCheck, CheckCircle2, FileText, Printer } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

export default function InvoiceModal({ invoice, isOpen, onClose }) {
  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    downloadInvoicePDF(invoice);
  };

  const handlePrint = () => {
    window.print();
  };

  const serviceAmount = parseFloat(invoice.service_amount || 0);
  const visitingFee = parseFloat(invoice.visiting_fee || 0);
  const platformFee = parseFloat(invoice.platform_fee || 50.0);
  const totalAmount = parseFloat(invoice.total_amount || serviceAmount + visitingFee);
  const dateStr = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN');

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '1.5rem 1.75rem',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Fixigo Official Tax Invoice
              </h3>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                {invoice.invoice_no || 'FXG-INVOICE'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Invoice Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Header Metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '1.25rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Invoice Issued To
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block', marginTop: '0.15rem' }}>
                {invoice.customer_name || 'Customer'}
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{invoice.customer_phone || 'N/A'}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '280px', marginTop: '0.2rem' }}>
                {invoice.customer_address}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#16a34a', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={14} /> PAID
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Date:</strong> {dateStr}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Payment Mode:</strong> {invoice.payment_method || 'ONLINE'}
              </div>
              {invoice.transaction_id && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Ref: {invoice.transaction_id}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Specialist Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Assigned Specialist
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{invoice.professional_name || 'Professional'}</strong>
                <ShieldCheck size={16} color="#16a34a" fill="#16a34a" />
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{invoice.service_name} Expert</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
              <div>{invoice.professional_phone || '+91 9876543210'}</div>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.775rem' }}>Background Verified ✓</div>
            </div>
          </div>

          {/* Clear Fee Breakdown Table (Required by Section 22) */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f1f5f9', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              <span>Item &amp; Description</span>
              <span>Amount</span>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                  Professional Service Fee
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fee charged by specialist for actual labor &amp; repair work
                </span>
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                ₹{serviceAmount.toFixed(2)}
              </strong>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                  Visiting &amp; Travel Fee
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fee for professional doorstep visit and initial inspection
                </span>
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                ₹{visitingFee.toFixed(2)}
              </strong>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#fafaf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Fixigo Marketplace Platform Fee (included):
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                  Covering 24/7 support, insurance &amp; technology
                </span>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                ₹{platformFee.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Grand Total Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid #bfdbfe',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Grand Total Paid
              </span>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '0.1rem' }}>
                ✓ Payment Verified &amp; Settled
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e3a8a' }}>
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Actions: Download PDF / Print */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{
                flex: 1,
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
              <Download size={18} /> Download PDF Invoice
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{
                borderRadius: '14px',
                padding: '0.85rem 1.25rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={18} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
