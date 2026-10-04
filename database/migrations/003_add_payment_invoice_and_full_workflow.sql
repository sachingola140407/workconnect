-- Migration 003: Add Payment, Invoice, Platform Fee, and Complete Booking Lifecycle Statuses

-- 1. Update bookings table status constraint and lifecycle timestamps
DO $$
BEGIN
    -- Drop old check constraint if exists
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
    
    -- Add updated check constraint with full lifecycle statuses
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (
        status IN (
            'pending',
            'accepted',
            'rejected',
            'on_the_way',
            'arrived',
            'working',
            'work_completed',
            'payment_pending',
            'payment_completed',
            'completed',
            'cancelled',
            'reviewed'
        )
    );
END $$;

-- Add booking financial and lifecycle tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_service_amount NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2) DEFAULT 50.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS work_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP WITH TIME ZONE;

-- 2. Enhance payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS service_amount NUMERIC(10, 2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS visiting_charge NUMERIC(10, 2) DEFAULT 99.00;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2) DEFAULT 50.00;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS professional_net_amount NUMERIC(10, 2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_fee_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_fee_payment_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cash_paid_by_customer BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cash_confirmed_by_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    professional_name VARCHAR(150),
    professional_phone VARCHAR(50),
    service_name VARCHAR(150),
    service_amount NUMERIC(10, 2) NOT NULL,
    visiting_fee NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    professional_net_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_professional_id ON invoices(professional_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON invoices(invoice_no);
