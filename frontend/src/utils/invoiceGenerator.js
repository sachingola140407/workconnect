import { jsPDF } from 'jspdf';

/**
 * Generate and download a PDF invoice for a SabFix booking
 * @param {Object} invoice - Invoice details object
 */
export function downloadInvoicePDF(invoice) {
  if (!invoice) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [255, 106, 0]; // SabFix Orange #ff6a00
  const secondaryColor = [11, 25, 44]; // SabFix Dark #0b192c
  const grayColor = [100, 116, 139]; // #64748b
  const darkColor = [15, 23, 42]; // #0f172a
  const greenColor = [16, 185, 129]; // #10b981

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SABFIX', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Get It Fixed. - On-Demand Services & Repairs', 54, 17);

  // Status Badge
  doc.setFillColor(...greenColor);
  doc.roundedRect(pageWidth - 44, 8, 30, 12, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PAID', pageWidth - 33, 16);

  // 2. Invoice Meta Bar
  let y = 38;
  doc.setTextColor(...darkColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE / RECEIPT', 14, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  y += 6;
  doc.text(`Invoice No: ${invoice.invoice_no || 'FXG-2026-0001'}`, 14, y);
  doc.text(`Booking Ref: #${String(invoice.booking_id || '').slice(0, 8).toUpperCase()}`, pageWidth - 70, y);

  y += 5;
  const dateStr = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : new Date().toLocaleDateString('en-IN');
  doc.text(`Date & Time: ${dateStr}`, 14, y);
  doc.text(`Payment Mode: ${invoice.payment_method || 'ONLINE'}`, pageWidth - 70, y);

  // Divider
  y += 7;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);

  // 3. Customer & Professional Two-Column Block
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 86, 38, 2, 2, 'F');
  doc.roundedRect(110, y, 86, 38, 2, 2, 'F');

  // Customer column
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER DETAILS', 18, y + 7);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoice.customer_name || 'Customer', 18, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(`Phone: ${invoice.customer_phone || 'N/A'}`, 18, y + 20);
  const splitAddress = doc.splitTextToSize(invoice.customer_address || 'Address provided', 78);
  doc.text(splitAddress, 18, y + 26);

  // Professional column
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED PROFESSIONAL', 114, y + 7);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoice.professional_name || 'Professional', 114, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(`Phone: ${invoice.professional_phone || 'N/A'}`, 114, y + 20);
  doc.text(`Service: ${invoice.service_name || 'Home Repair'}`, 114, y + 26);
  doc.text('Status: Background Verified ✓', 114, y + 32);

  // 4. Line Items Table
  y += 48;
  doc.setFillColor(...primaryColor);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 18, y + 5.5);
  doc.text('TYPE', 120, y + 5.5);
  doc.text('AMOUNT (INR)', pageWidth - 42, y + 5.5);

  y += 8;

  const items = [
    {
      desc: `${invoice.service_name || 'Service'} Work Fee`,
      type: 'Labor & Repair',
      amount: `₹${parseFloat(invoice.service_amount || 0).toFixed(2)}`,
    },
    {
      desc: 'Professional Visiting & Travel Charge',
      type: 'Doorstep Visit',
      amount: `₹${parseFloat(invoice.visiting_fee || 0).toFixed(2)}`,
    },
  ];

  doc.setTextColor(...darkColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 9, 'F');
    }
    doc.text(item.desc, 18, y + 6);
    doc.text(item.type, 120, y + 6);
    doc.text(item.amount, pageWidth - 42, y + 6);
    y += 9;
  });

  // Divider
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);

  // 5. Total and Platform Breakdown Box
  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 90, y, 76, 32, 2, 2, 'F');

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text('Subtotal:', pageWidth - 84, y + 7);
  doc.text(`₹${parseFloat(invoice.total_amount || 0).toFixed(2)}`, pageWidth - 36, y + 7);

  doc.text('SabFix Platform Fee (incl.):', pageWidth - 84, y + 14);
  doc.text(`₹${parseFloat(invoice.platform_fee || 50).toFixed(2)}`, pageWidth - 36, y + 14);

  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth - 84, y + 18, pageWidth - 18, y + 18);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Paid:', pageWidth - 84, y + 25);
  doc.setTextColor(...greenColor);
  doc.text(`₹${parseFloat(invoice.total_amount || 0).toFixed(2)}`, pageWidth - 38, y + 25);

  // 6. Security & Transaction Notes
  y += 40;
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Transaction Reference: ${invoice.transaction_id || invoice.payment_id || 'VERIFIED-ESCROW'}`, 14, y);
  y += 5;
  doc.text('This is a computer-generated tax invoice and does not require a physical signature.', 14, y);
  y += 5;
  doc.text('Thank you for choosing SabFix! For support, contact support@sabfix.in or call 1800-SABFIX.', 14, y);

  // Save the PDF
  const filename = `${invoice.invoice_no || 'SabFix-Invoice'}.pdf`;
  doc.save(filename);
}
