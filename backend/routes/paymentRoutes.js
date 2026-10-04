const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All payment routes require authentication
router.use(authenticate);

// 1. Final Bill submission (Professional only)
router.post('/submit-bill', authorize('professional', 'admin'), paymentController.submitFinalBill);

// 2. Razorpay Order Creation
router.post('/create-order', paymentController.createOrder);

// 3. Razorpay Signature Verification & Invoice Generation
router.post('/verify', paymentController.verifyPayment);

// 4. Generate UPI QR Code (Professional / Customer)
router.post('/generate-qr', paymentController.generatePaymentQR);

// 5. Cash payment: Customer marks paid
router.post('/cash-customer-paid', paymentController.markCashPaid);

// 6. Cash payment: Professional confirms cash received
router.post('/cash-pro-confirmed', authorize('professional', 'admin'), paymentController.confirmCashReceived);

// 7. Settle Platform Fee (Professional)
router.post('/settle-platform-fee', authorize('professional', 'admin'), paymentController.settlePlatformFee);

// 8. Get payment details by booking ID
router.get('/booking/:bookingId', paymentController.getPaymentByBooking);

// 9. Get invoice by booking ID
router.get('/invoice/:bookingId', paymentController.getInvoiceByBooking);

// 10. Professional earnings & dues
router.get('/earnings', authorize('professional', 'admin'), paymentController.getProfessionalEarnings);

// 11. Admin Financial Stats & Audit
router.get('/admin-stats', authorize('admin'), paymentController.getAdminFinancialStats);

module.exports = router;
