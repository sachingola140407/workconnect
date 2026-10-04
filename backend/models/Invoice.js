const db = require('../config/db');

class Invoice {
  /**
   * Generate a unique invoice number in format FXG-YYYYMMDD-XXXXX
   */
  static generateInvoiceNumber() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `FXG-${yyyy}${mm}${dd}-${randomSuffix}`;
  }

  /**
   * Create an invoice after verified payment
   */
  static async create({
    bookingId,
    paymentId,
    customerId,
    professionalId,
    customerName,
    customerPhone,
    customerAddress,
    professionalName,
    professionalPhone,
    serviceName,
    serviceAmount,
    visitingFee,
    platformFee = 50.0,
    totalAmount,
    professionalNetAmount,
    paymentMethod,
    paymentStatus = 'PAID',
    transactionId = null,
  }) {
    // If invoice already exists for this booking, return it
    const existing = await this.getByBookingId(bookingId);
    if (existing) {
      return existing;
    }

    const invoiceNo = this.generateInvoiceNumber();

    const query = `
      INSERT INTO invoices (
        invoice_no,
        booking_id,
        payment_id,
        customer_id,
        professional_id,
        customer_name,
        customer_phone,
        customer_address,
        professional_name,
        professional_phone,
        service_name,
        service_amount,
        visiting_fee,
        platform_fee,
        total_amount,
        professional_net_amount,
        payment_method,
        payment_status,
        transaction_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;

    const values = [
      invoiceNo,
      bookingId,
      paymentId,
      customerId,
      professionalId,
      customerName,
      customerPhone,
      customerAddress,
      professionalName,
      professionalPhone,
      serviceName,
      parseFloat(serviceAmount) || 0,
      parseFloat(visitingFee) || 0,
      parseFloat(platformFee) || 50.0,
      parseFloat(totalAmount) || 0,
      parseFloat(professionalNetAmount) || 0,
      paymentMethod,
      paymentStatus,
      transactionId,
    ];

    const { rows } = await db.query(query, values);
    const invoice = rows[0];

    // Update booking with invoice_id
    if (invoice) {
      await db.query('UPDATE bookings SET invoice_id = $1 WHERE id = $2', [invoice.invoice_no, bookingId]);
      if (paymentId) {
        await db.query('UPDATE payments SET invoice_no = $1 WHERE id = $2', [invoice.invoice_no, paymentId]);
      }
    }

    return invoice;
  }

  /**
   * Get invoice by booking ID
   */
  static async getByBookingId(bookingId) {
    const query = `
      SELECT 
        i.*,
        b.created_at AS booking_date,
        b.status AS booking_status
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      WHERE i.booking_id = $1
      ORDER BY i.created_at DESC
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [bookingId]);
    if (!rows[0]) return null;
    return this._format(rows[0]);
  }

  /**
   * Get invoice by invoice number
   */
  static async getByInvoiceNo(invoiceNo) {
    const query = `
      SELECT i.*, b.created_at AS booking_date, b.status AS booking_status
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      WHERE i.invoice_no = $1;
    `;
    const { rows } = await db.query(query, [invoiceNo]);
    if (!rows[0]) return null;
    return this._format(rows[0]);
  }

  /**
   * Get all invoices for a customer
   */
  static async getByCustomerId(customerId) {
    const query = `
      SELECT i.*, b.status AS booking_status
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      WHERE i.customer_id = $1
      ORDER BY i.created_at DESC;
    `;
    const { rows } = await db.query(query, [customerId]);
    return rows.map((r) => this._format(r));
  }

  /**
   * Get all invoices (for Admin audit)
   */
  static async getAll({ limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT i.*, b.status AS booking_status
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      ORDER BY i.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await db.query(query, [limit, offset]);
    return rows.map((r) => this._format(r));
  }

  static _format(r) {
    return {
      ...r,
      service_amount: parseFloat(r.service_amount) || 0,
      visiting_fee: parseFloat(r.visiting_fee) || 0,
      platform_fee: parseFloat(r.platform_fee) || 50.0,
      total_amount: parseFloat(r.total_amount) || 0,
      professional_net_amount: parseFloat(r.professional_net_amount) || 0,
    };
  }
}

module.exports = Invoice;
