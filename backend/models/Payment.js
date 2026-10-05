const db = require('../config/db');
const Invoice = require('./Invoice');
const { verifyRazorpaySignature } = require('../services/razorpayService');
const { emitToBooking } = require('../services/socketService');

class Payment {
  static PLATFORM_FEE = 50.0;

  /**
   * Submit or update final service bill submitted by professional
   * Enforces backend calculation: total = service + visiting, net = total - 50
   */
  static async submitFinalBill({ bookingId, professionalId, serviceAmount, visitingCharge }) {
    // 1. Fetch booking and verify ownership
    const bookingQuery = `
      SELECT b.*, u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
             p.user_id AS pro_user_id, pu.name AS pro_name, pu.phone AS pro_phone,
             s.name AS service_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN professionals p ON b.professional_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1;
    `;
    const { rows: bRows } = await db.query(bookingQuery, [bookingId]);
    if (!bRows[0]) {
      throw new Error('Booking not found');
    }

    const booking = bRows[0];
    if (booking.professional_id !== professionalId && booking.pro_user_id !== professionalId) {
      throw new Error('Unauthorized: You are not the assigned professional for this booking');
    }

    // 2. Strict backend fee calculation
    const sAmount = parseFloat(serviceAmount);
    if (isNaN(sAmount) || sAmount <= 0) {
      throw new Error('Please enter a valid positive service fee');
    }

    const vCharge = visitingCharge !== undefined && visitingCharge !== null ? parseFloat(visitingCharge) : parseFloat(booking.visiting_charge || 99.0);
    const platformFee = Payment.PLATFORM_FEE; // Strictly enforced ₹50.00
    const totalAmount = parseFloat((sAmount + vCharge).toFixed(2));
    const professionalNetAmount = parseFloat((totalAmount - platformFee).toFixed(2));

    // 3. Update or Insert into payments table
    const checkPaymentQuery = 'SELECT id FROM payments WHERE booking_id = $1';
    const { rows: existingPayment } = await db.query(checkPaymentQuery, [bookingId]);

    let paymentRecord;
    if (existingPayment[0]) {
      const updatePaymentQuery = `
        UPDATE payments
        SET 
          service_amount = $1,
          visiting_charge = $2,
          platform_fee = $3,
          total_amount = $4,
          professional_net_amount = $5,
          amount = $4,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *;
      `;
      const { rows } = await db.query(updatePaymentQuery, [
        sAmount,
        vCharge,
        platformFee,
        totalAmount,
        professionalNetAmount,
        existingPayment[0].id,
      ]);
      paymentRecord = rows[0];
    } else {
      const insertPaymentQuery = `
        INSERT INTO payments (
          booking_id,
          customer_id,
          professional_id,
          service_amount,
          visiting_charge,
          platform_fee,
          total_amount,
          professional_net_amount,
          amount,
          payment_status,
          platform_fee_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'PENDING')
        RETURNING *;
      `;
      const { rows } = await db.query(insertPaymentQuery, [
        bookingId,
        booking.customer_id,
        booking.professional_id,
        sAmount,
        vCharge,
        platformFee,
        totalAmount,
        professionalNetAmount,
        totalAmount,
      ]);
      paymentRecord = rows[0];
    }

    // 4. Update booking status to payment_pending
    const updateBookingQuery = `
      UPDATE bookings
      SET 
        final_service_amount = $1,
        visiting_charge = $2,
        platform_fee = $3,
        total_amount = $4,
        payment_status = 'pending',
        status = 'payment_pending',
        work_completed_at = COALESCE(work_completed_at, NOW()),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;
    const { rows: updatedBookingRows } = await db.query(updateBookingQuery, [
      sAmount,
      vCharge,
      platformFee,
      totalAmount,
      bookingId,
    ]);

    const updatedBooking = updatedBookingRows[0];

    // 5. Broadcast real-time bill event
    emitToBooking(bookingId, 'booking:status-change', {
      bookingId,
      status: 'payment_pending',
      serviceAmount: sAmount,
      visitingCharge: vCharge,
      platformFee,
      totalAmount,
    });

    emitToBooking(bookingId, 'booking:bill-submitted', {
      bookingId,
      bill: {
        serviceAmount: sAmount,
        visitingCharge: vCharge,
        platformFee,
        totalAmount,
        professionalNetAmount,
      },
    });

    return {
      booking: updatedBooking,
      payment: paymentRecord,
      billSummary: {
        serviceAmount: sAmount,
        visitingCharge: vCharge,
        platformFee,
        totalAmount,
        professionalNetAmount,
      },
    };
  }

  /**
   * Get payment details for a booking
   */
  static async getByBookingId(bookingId) {
    const query = `
      SELECT p.*, b.status AS booking_status, b.customer_address
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.booking_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [bookingId]);
    if (!rows[0]) return null;
    return this._format(rows[0]);
  }

  /**
   * Verify and process Razorpay online payment
   */
  static async verifyRazorpayPayment({ bookingId, customerId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    // 1. Verify Razorpay HMAC-SHA256 signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      throw new Error('Payment signature verification failed. Tampered or invalid transaction.');
    }

    // 2. Fetch booking and customer details
    const bookingQuery = `
      SELECT b.*, u.name AS customer_name, u.phone AS customer_phone,
             pu.name AS pro_name, pu.phone AS pro_phone,
             s.name AS service_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN professionals p ON b.professional_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1;
    `;
    const { rows: bRows } = await db.query(bookingQuery, [bookingId]);
    if (!bRows[0]) {
      throw new Error('Booking not found');
    }
    const b = bRows[0];

    // Ensure customer authorized
    if (customerId && b.customer_id !== customerId) {
      throw new Error('Unauthorized customer');
    }

    const sAmount = parseFloat(b.final_service_amount || b.price || 0);
    const vCharge = parseFloat(b.visiting_charge || 99.0);
    const platformFee = Payment.PLATFORM_FEE;
    const totalAmount = parseFloat(b.total_amount || (sAmount + vCharge).toFixed(2));
    const proNetAmount = parseFloat((totalAmount - platformFee).toFixed(2));

    // 3. Update payment record
    const updatePaymentQuery = `
      UPDATE payments
      SET 
        payment_status = 'COMPLETED',
        payment_method = 'RAZORPAY',
        razorpay_order_id = $1,
        razorpay_payment_id = $2,
        razorpay_signature = $3,
        platform_fee_status = 'PAID',
        service_amount = $4,
        visiting_charge = $5,
        platform_fee = $6,
        total_amount = $7,
        professional_net_amount = $8,
        amount = $7,
        updated_at = NOW()
      WHERE booking_id = $9
      RETURNING *;
    `;
    let { rows: pRows } = await db.query(updatePaymentQuery, [
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sAmount,
      vCharge,
      platformFee,
      totalAmount,
      proNetAmount,
      bookingId,
    ]);

    if (!pRows[0]) {
      // If payment record wasn't pre-created
      const insertQuery = `
        INSERT INTO payments (
          booking_id, customer_id, professional_id, payment_status, payment_method,
          razorpay_order_id, razorpay_payment_id, razorpay_signature, platform_fee_status,
          service_amount, visiting_charge, platform_fee, total_amount, professional_net_amount, amount
        ) VALUES ($1, $2, $3, 'COMPLETED', 'RAZORPAY', $4, $5, $6, 'PAID', $7, $8, $9, $10, $11, $10)
        RETURNING *;
      `;
      const inserted = await db.query(insertQuery, [
        bookingId, b.customer_id, b.professional_id,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        sAmount, vCharge, platformFee, totalAmount, proNetAmount,
      ]);
      pRows = inserted.rows;
    }

    const payment = pRows[0];

    // 4. Update booking status to PAYMENT_COMPLETED
    await db.query(
      `UPDATE bookings 
       SET status = 'payment_completed', payment_status = 'COMPLETED', payment_method = 'RAZORPAY', completed_at = NOW(), updated_at = NOW() 
       WHERE id = $1`,
      [bookingId]
    );

    // 5. Automatically Generate Invoice
    const invoice = await Invoice.create({
      bookingId,
      paymentId: payment.id,
      customerId: b.customer_id,
      professionalId: b.professional_id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerAddress: b.customer_address,
      professionalName: b.pro_name,
      professionalPhone: b.pro_phone,
      serviceName: b.service_name,
      serviceAmount: sAmount,
      visitingFee: vCharge,
      platformFee,
      totalAmount,
      professionalNetAmount: proNetAmount,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      transactionId: razorpay_payment_id,
    });

    // 6. Broadcast real-time payment success
    emitToBooking(bookingId, 'payment:success', {
      bookingId,
      paymentMethod: 'RAZORPAY',
      transactionId: razorpay_payment_id,
      totalAmount,
      invoiceNo: invoice.invoice_no,
    });

    emitToBooking(bookingId, 'booking:status-change', {
      bookingId,
      status: 'payment_completed',
      invoiceNo: invoice.invoice_no,
    });

    return {
      payment: this._format(payment),
      invoice,
    };
  }

  /**
   * Step 1 of Cash Payment: Customer clicks "I Have Paid"
   */
  static async customerMarkCashPaid(bookingId, customerId) {
    const bookingQuery = 'SELECT * FROM bookings WHERE id = $1';
    const { rows } = await db.query(bookingQuery, [bookingId]);
    if (!rows[0]) throw new Error('Booking not found');

    const b = rows[0];
    if (b.customer_id !== customerId) {
      throw new Error('Unauthorized: You are not the customer for this booking');
    }

    await db.query(
      'UPDATE payments SET cash_paid_by_customer = TRUE, payment_method = \'CASH\', updated_at = NOW() WHERE booking_id = $1',
      [bookingId]
    );

    emitToBooking(bookingId, 'payment:cash-customer-paid', {
      bookingId,
      message: 'Customer has marked cash paid. Please confirm receipt.',
    });

    return { success: true, message: 'Cash payment marked. Waiting for professional to confirm receipt.' };
  }

  /**
   * Step 2 of Cash Payment: Professional confirms "Cash Received"
   * Generates invoice and sets platform fee due = PENDING
   */
  static async confirmCashReceivedByPro(bookingId, professionalUserId) {
    return this.professionalConfirmCash(bookingId, professionalUserId);
  }

  static async professionalConfirmCash(bookingId, professionalUserId) {
    const bookingQuery = `
      SELECT b.*, u.name AS customer_name, u.phone AS customer_phone,
             p.user_id AS pro_user_id, pu.name AS pro_name, pu.phone AS pro_phone,
             s.name AS service_name
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN professionals p ON b.professional_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1;
    `;
    const { rows: bRows } = await db.query(bookingQuery, [bookingId]);
    if (!bRows[0]) throw new Error('Booking not found');

    const b = bRows[0];
    if (b.professional_id !== professionalUserId && b.pro_user_id !== professionalUserId) {
      throw new Error('Unauthorized: You are not the assigned professional for this booking');
    }

    const sAmount = parseFloat(b.final_service_amount || b.price || 0);
    const vCharge = parseFloat(b.visiting_charge || 99.0);
    const platformFee = Payment.PLATFORM_FEE;
    const totalAmount = parseFloat(b.total_amount || (sAmount + vCharge).toFixed(2));
    const proNetAmount = parseFloat((totalAmount - platformFee).toFixed(2));

    // Update payment record: cash confirmed, platform fee status = PENDING (professional owes SabFix ₹50)
    const updatePaymentQuery = `
      UPDATE payments
      SET 
        cash_confirmed_by_pro = TRUE,
        payment_status = 'COMPLETED',
        payment_method = 'CASH',
        platform_fee_status = 'PENDING',
        service_amount = $1,
        visiting_charge = $2,
        platform_fee = $3,
        total_amount = $4,
        professional_net_amount = $5,
        amount = $4,
        updated_at = NOW()
      WHERE booking_id = $6
      RETURNING *;
    `;
    let { rows: pRows } = await db.query(updatePaymentQuery, [
      sAmount, vCharge, platformFee, totalAmount, proNetAmount, bookingId
    ]);

    if (!pRows[0]) {
      const insertQuery = `
        INSERT INTO payments (
          booking_id, customer_id, professional_id, payment_status, payment_method,
          cash_paid_by_customer, cash_confirmed_by_pro, platform_fee_status,
          service_amount, visiting_charge, platform_fee, total_amount, professional_net_amount, amount
        ) VALUES ($1, $2, $3, 'COMPLETED', 'CASH', TRUE, TRUE, 'PENDING', $4, $5, $6, $7, $8, $7)
        RETURNING *;
      `;
      const inserted = await db.query(insertQuery, [
        bookingId, b.customer_id, b.professional_id,
        sAmount, vCharge, platformFee, totalAmount, proNetAmount
      ]);
      pRows = inserted.rows;
    }

    const payment = pRows[0];

    // Update booking status
    await db.query(
      `UPDATE bookings 
       SET status = 'payment_completed', payment_status = 'COMPLETED', payment_method = 'CASH', completed_at = NOW(), updated_at = NOW() 
       WHERE id = $1`,
      [bookingId]
    );

    // Auto-generate Invoice
    const invoice = await Invoice.create({
      bookingId,
      paymentId: payment.id,
      customerId: b.customer_id,
      professionalId: b.professional_id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerAddress: b.customer_address,
      professionalName: b.pro_name,
      professionalPhone: b.pro_phone,
      serviceName: b.service_name,
      serviceAmount: sAmount,
      visitingFee: vCharge,
      platformFee,
      totalAmount,
      professionalNetAmount: proNetAmount,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      transactionId: `CASH-${String(bookingId).slice(0, 8).toUpperCase()}`,
    });

    // Broadcast
    emitToBooking(bookingId, 'payment:cash-confirmed', {
      bookingId,
      totalAmount,
      invoiceNo: invoice.invoice_no,
    });

    emitToBooking(bookingId, 'payment:success', {
      bookingId,
      paymentMethod: 'CASH',
      totalAmount,
      invoiceNo: invoice.invoice_no,
    });

    emitToBooking(bookingId, 'booking:status-change', {
      bookingId,
      status: 'payment_completed',
      invoiceNo: invoice.invoice_no,
    });

    return {
      payment: this._format(payment),
      invoice,
    };
  }

  /**
   * Settle ₹50 Platform Fee by Professional (e.g. after cash jobs)
   */
  static async settlePlatformFee({ paymentId, professionalUserId, razorpayPaymentId }) {
    const query = `
      UPDATE payments p
      SET platform_fee_status = 'PAID',
          platform_fee_payment_id = $1,
          updated_at = NOW()
      FROM professionals pr
      WHERE p.id = $2 
        AND p.professional_id = pr.id 
        AND (pr.user_id = $3 OR p.professional_id = $3)
      RETURNING p.*;
    `;
    const { rows } = await db.query(query, [razorpayPaymentId || `SETTLED-${Date.now()}`, paymentId, professionalUserId]);
    if (!rows[0]) {
      throw new Error('Payment record not found or not authorized');
    }
    return this._format(rows[0]);
  }

  /**
   * Get professional earnings summary and transaction history
   */
  static async getProfessionalEarnings(professionalUserId) {
    // 1. Resolve professional ID
    const proRes = await db.query('SELECT id FROM professionals WHERE user_id = $1 OR id = $1', [professionalUserId]);
    if (!proRes.rows[0]) {
      return {
        todayEarnings: 0,
        completedJobs: 0,
        platformFees: 0,
        pendingPlatformFees: 0,
        netEarnings: 0,
        transactions: [],
      };
    }
    const proId = proRes.rows[0].id;

    // 2. Aggregate stats
    const statsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'COMPLETED' AND DATE(created_at) = CURRENT_DATE THEN professional_net_amount ELSE 0 END), 0) AS today_earnings,
        COUNT(CASE WHEN payment_status = 'COMPLETED' THEN 1 END) AS completed_jobs,
        COALESCE(SUM(CASE WHEN payment_status = 'COMPLETED' AND platform_fee_status = 'PAID' THEN platform_fee ELSE 0 END), 0) AS platform_fees_paid,
        COALESCE(SUM(CASE WHEN payment_status = 'COMPLETED' AND platform_fee_status = 'PENDING' THEN platform_fee ELSE 0 END), 0) AS pending_platform_fees,
        COALESCE(SUM(CASE WHEN payment_status = 'COMPLETED' THEN professional_net_amount ELSE 0 END), 0) AS net_earnings
      FROM payments
      WHERE professional_id = $1;
    `;
    const { rows: statsRows } = await db.query(statsQuery, [proId]);
    const stats = statsRows[0];

    // 3. Transactions list
    const txQuery = `
      SELECT 
        p.id AS payment_id,
        p.booking_id,
        p.service_amount,
        p.visiting_charge,
        p.platform_fee,
        p.total_amount,
        p.professional_net_amount,
        p.payment_method,
        p.payment_status,
        p.platform_fee_status,
        p.created_at,
        p.invoice_no,
        u.name AS customer_name,
        s.name AS service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE p.professional_id = $1
      ORDER BY p.created_at DESC;
    `;
    const { rows: txRows } = await db.query(txQuery, [proId]);

    return {
      todayEarnings: parseFloat(stats.today_earnings) || 0,
      completedJobs: parseInt(stats.completed_jobs, 10) || 0,
      platformFees: parseFloat(stats.platform_fees_paid) || 0,
      pendingPlatformFees: parseFloat(stats.pending_platform_fees) || 0,
      netEarnings: parseFloat(stats.net_earnings) || 0,
      transactions: txRows.map((t) => ({
        ...t,
        service_amount: parseFloat(t.service_amount) || 0,
        visiting_charge: parseFloat(t.visiting_charge) || 0,
        platform_fee: parseFloat(t.platform_fee) || 50.0,
        total_amount: parseFloat(t.total_amount) || 0,
        professional_net_amount: parseFloat(t.professional_net_amount) || 0,
      })),
    };
  }

  /**
   * Get platform-wide financial audit metrics for Admin
   */
  static async getAdminFinancialStats() {
    const metricsQuery = `
      SELECT 
        COUNT(b.id) AS total_bookings,
        COUNT(CASE WHEN b.status IN ('payment_completed', 'completed', 'reviewed') THEN 1 END) AS completed_bookings,
        COALESCE(SUM(CASE WHEN p.payment_status = 'COMPLETED' THEN p.total_amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN p.payment_status = 'COMPLETED' AND p.platform_fee_status = 'PAID' THEN p.platform_fee ELSE 0 END), 0) AS total_platform_fees,
        COALESCE(SUM(CASE WHEN p.payment_status = 'COMPLETED' AND p.platform_fee_status = 'PENDING' THEN p.platform_fee ELSE 0 END), 0) AS pending_platform_fees,
        COUNT(CASE WHEN p.payment_method = 'RAZORPAY' AND p.payment_status = 'COMPLETED' THEN 1 END) AS online_payments_count,
        COALESCE(SUM(CASE WHEN p.payment_method = 'RAZORPAY' AND p.payment_status = 'COMPLETED' THEN p.total_amount ELSE 0 END), 0) AS online_payments_volume,
        COUNT(CASE WHEN p.payment_method = 'CASH' AND p.payment_status = 'COMPLETED' THEN 1 END) AS cash_payments_count,
        COALESCE(SUM(CASE WHEN p.payment_method = 'CASH' AND p.payment_status = 'COMPLETED' THEN p.total_amount ELSE 0 END), 0) AS cash_payments_volume
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id;
    `;
    const { rows: metrics } = await db.query(metricsQuery);

    return {
      totalBookings: parseInt(metrics[0].total_bookings, 10) || 0,
      completedBookings: parseInt(metrics[0].completed_bookings, 10) || 0,
      totalRevenue: parseFloat(metrics[0].total_revenue) || 0,
      totalPlatformFees: parseFloat(metrics[0].total_platform_fees) || 0,
      pendingPlatformFees: parseFloat(metrics[0].pending_platform_fees) || 0,
      onlinePaymentsCount: parseInt(metrics[0].online_payments_count, 10) || 0,
      onlinePaymentsVolume: parseFloat(metrics[0].online_payments_volume) || 0,
      cashPaymentsCount: parseInt(metrics[0].cash_payments_count, 10) || 0,
      cashPaymentsVolume: parseFloat(metrics[0].cash_payments_volume) || 0,
    };
  }

  static _format(r) {
    return {
      ...r,
      service_amount: parseFloat(r.service_amount) || 0,
      visiting_charge: parseFloat(r.visiting_charge) || 0,
      platform_fee: parseFloat(r.platform_fee) || 50.0,
      total_amount: parseFloat(r.total_amount) || 0,
      professional_net_amount: parseFloat(r.professional_net_amount) || 0,
      amount: parseFloat(r.amount) || 0,
    };
  }
}

module.exports = Payment;
