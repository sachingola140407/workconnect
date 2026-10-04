const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { createRazorpayOrder, generatePaymentQRCode, KEY_ID } = require('../services/razorpayService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * 1. Professional submits final bill
 * Backend strictly enforces ₹50 platform fee
 */
async function submitFinalBill(req, res, next) {
  try {
    const { bookingId, serviceAmount, visitingCharge } = req.body;

    if (!bookingId) {
      return errorResponse(res, 400, 'bookingId is required');
    }

    if (serviceAmount === undefined || isNaN(parseFloat(serviceAmount)) || parseFloat(serviceAmount) <= 0) {
      return errorResponse(res, 400, 'A valid serviceAmount greater than 0 is required');
    }

    const result = await Payment.submitFinalBill({
      bookingId,
      professionalId: req.user.id,
      serviceAmount: parseFloat(serviceAmount),
      visitingCharge: visitingCharge !== undefined ? parseFloat(visitingCharge) : null,
    });

    return successResponse(res, 200, 'Final bill submitted successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Create Razorpay Order in Test Mode using official SDK
 */
async function createOrder(req, res, next) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return errorResponse(res, 400, 'bookingId is required');
    }

    // Check payment record or booking
    let payment = await Payment.getByBookingId(bookingId);
    let totalAmount = payment ? payment.total_amount : null;

    if (!totalAmount) {
      const tracking = await Booking.getTrackingDetails(bookingId);
      if (!tracking) {
        return errorResponse(res, 404, 'Booking not found');
      }
      totalAmount = tracking.total_amount || (tracking.final_service_amount + tracking.visiting_charge);
    }

    if (!totalAmount || totalAmount <= 0) {
      return errorResponse(res, 400, 'Invalid bill amount for payment order creation');
    }

    const order = await createRazorpayOrder({
      bookingId,
      amount: totalAmount,
    });

    return successResponse(res, 200, 'Razorpay order created successfully', {
      orderId: order.orderId,
      amount: order.amount, // in paise
      amountInRupees: totalAmount,
      currency: order.currency,
      keyId: KEY_ID,
      bookingId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Verify Razorpay signature & finalize payment + auto-generate invoice
 */
async function verifyPayment(req, res, next) {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 400, 'Missing required payment verification parameters');
    }

    const result = await Payment.verifyRazorpayPayment({
      bookingId,
      customerId: req.user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return successResponse(res, 200, 'Payment verified successfully and invoice generated', result);
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Generate dynamic UPI QR Code for payment collection
 */
async function generatePaymentQR(req, res, next) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return errorResponse(res, 400, 'bookingId is required');
    }

    let payment = await Payment.getByBookingId(bookingId);
    let amount = payment ? payment.total_amount : null;

    if (!amount) {
      const tracking = await Booking.getTrackingDetails(bookingId);
      if (!tracking) return errorResponse(res, 404, 'Booking not found');
      amount = tracking.total_amount || (tracking.final_service_amount + tracking.visiting_charge);
    }

    const qrResult = await generatePaymentQRCode({
      bookingId,
      amount,
      serviceName: 'Home Service',
    });

    return successResponse(res, 200, 'Payment QR generated successfully', qrResult);
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Customer marks "I Have Paid Cash"
 */
async function markCashPaid(req, res, next) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return errorResponse(res, 400, 'bookingId is required');

    const result = await Payment.customerMarkCashPaid(bookingId, req.user.id);
    return successResponse(res, 200, result.message, result);
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Professional marks "Confirm Cash Received"
 */
async function confirmCashReceived(req, res, next) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return errorResponse(res, 400, 'bookingId is required');

    const result = await Payment.confirmCashReceivedByPro(bookingId, req.user.id);
    return successResponse(res, 200, 'Cash payment confirmed and invoice generated', result);
  } catch (err) {
    next(err);
  }
}

/**
 * 7. Professional settles ₹50 platform fee
 */
async function settlePlatformFee(req, res, next) {
  try {
    const { paymentId, razorpayPaymentId } = req.body;
    if (!paymentId) return errorResponse(res, 400, 'paymentId is required');

    const result = await Payment.settlePlatformFee({
      paymentId,
      professionalUserId: req.user.id,
      razorpayPaymentId,
    });

    return successResponse(res, 200, 'Platform fee settled successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * 8. Get payment by booking ID
 */
async function getPaymentByBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.getByBookingId(bookingId);
    return successResponse(res, 200, 'Payment retrieved', payment);
  } catch (err) {
    next(err);
  }
}

/**
 * 9. Get invoice by booking ID
 */
async function getInvoiceByBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const invoice = await Invoice.getByBookingId(bookingId);
    if (!invoice) {
      return errorResponse(res, 404, 'Invoice not yet generated for this booking');
    }
    return successResponse(res, 200, 'Invoice retrieved successfully', invoice);
  } catch (err) {
    next(err);
  }
}

/**
 * 10. Get professional earnings & platform fee dues
 */
async function getProfessionalEarnings(req, res, next) {
  try {
    const earnings = await Payment.getProfessionalEarnings(req.user.id);
    return successResponse(res, 200, 'Earnings retrieved successfully', earnings);
  } catch (err) {
    next(err);
  }
}

/**
 * 11. Get admin financial stats & audit
 */
async function getAdminFinancialStats(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Forbidden: Admin access required');
    }

    const stats = await Payment.getAdminFinancialStats();
    const invoices = await Invoice.getAll({ limit: 50 });

    return successResponse(res, 200, 'Admin financial stats retrieved', {
      stats,
      invoices,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFinalBill,
  createOrder,
  verifyPayment,
  generatePaymentQR,
  markCashPaid,
  confirmCashReceived,
  settlePlatformFee,
  getPaymentByBooking,
  getInvoiceByBooking,
  getProfessionalEarnings,
  getAdminFinancialStats,
};
