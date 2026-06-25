const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Member = require('../models/Member');
const { createNotificationHelper } = require('./notificationController');

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    let query = {};
    // Members only see their own payments, Admins see all
    if (req.user.role !== 'Admin') {
      query.user = req.user.id;
    }
    const history = await Payment.find(query)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ success: false, message: 'Please provide amount and payment method' });
    }

    const order = await Payment.create({
      user: req.user.id,
      amount,
      method,
      status: 'Pending',
      transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    const payment = await Payment.findById(orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = success ? 'Completed' : 'Failed';
    await payment.save();

    // If payment completed, update membership status of member to Active and extend expiryDate
    if (success) {
      const member = await Member.findOne({ user: payment.user });
      if (member) {
        member.status = 'Active';
        member.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset to 30 days
        await member.save();
        
        // Trigger payment success notification
        await createNotificationHelper(
          payment.user,
          'Membership Extended! ✅',
          `Your subscription renewal payment of ₹${payment.amount} was verified successfully. Expiry date extended by 30 days.`,
          'success'
        );
      }
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/invoices/:paymentId
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('user');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Load gym settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = {
        gymName: 'Forge Gym',
        address: '123 Strength Ave, Fitness City',
        mobile: '+1234567890',
        taxRate: 18
      };
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${payment.transactionId}.pdf`);
    
    doc.pipe(res);

    // Styling & Layout
    // Brand header
    doc.fillColor('#EAB308').fontSize(24).text(settings.gymName.toUpperCase(), 50, 45, { align: 'left' });
    doc.fillColor('#000000').fontSize(10).text(settings.address, 50, 75);
    doc.text(`Phone: ${settings.mobile}`, 50, 90);

    // Invoice title
    doc.fillColor('#000000').fontSize(20).text('INVOICE', 400, 45, { align: 'right' });
    doc.fontSize(10);
    doc.text(`Invoice No: INV-${payment.transactionId.split('-')[1] || '1001'}`, 400, 75, { align: 'right' });
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' });
    doc.text(`Status: ${payment.status.toUpperCase()}`, 400, 105, { align: 'right' });

    // Divider line
    doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#E4E4E7').stroke();

    // Bill To
    doc.fontSize(12).fillColor('#4B5563').text('BILL TO:', 50, 150);
    doc.fontSize(14).fillColor('#000000').text(payment.user.name, 50, 170);
    doc.fontSize(10).fillColor('#4B5563').text(`Email: ${payment.user.email}`, 50, 190);
    doc.text(`Mobile: ${payment.user.mobile || 'N/A'}`, 50, 205);

    // Items table header
    const tableTop = 250;
    doc.rect(50, tableTop, 500, 25).fill('#F4F4F5');
    doc.fillColor('#000000').fontSize(10).text('Item Description', 60, tableTop + 8);
    doc.text('Qty', 350, tableTop + 8, { width: 50, align: 'right' });
    doc.text('Rate', 400, tableTop + 8, { width: 60, align: 'right' });
    doc.text('Amount', 470, tableTop + 8, { width: 70, align: 'right' });

    // Item line
    const itemTop = tableTop + 35;
    const baseRate = parseFloat((payment.amount / (1 + (settings.taxRate / 100))).toFixed(2));
    const taxAmount = parseFloat((payment.amount - baseRate).toFixed(2));

    doc.text('Forge Gym Membership Subscription', 60, itemTop);
    doc.text('1', 350, itemTop, { width: 50, align: 'right' });
    doc.text(`INR ${baseRate.toLocaleString()}`, 400, itemTop, { width: 60, align: 'right' });
    doc.text(`INR ${baseRate.toLocaleString()}`, 470, itemTop, { width: 70, align: 'right' });

    // Divider
    doc.moveTo(50, itemTop + 25).lineTo(550, itemTop + 25).strokeColor('#E4E4E7').stroke();

    // Summary calculation
    const summaryTop = itemTop + 45;
    doc.text('Subtotal:', 350, summaryTop, { align: 'right' });
    doc.text(`INR ${baseRate.toLocaleString()}`, 470, summaryTop, { align: 'right' });

    doc.text(`GST (${settings.taxRate}%):`, 350, summaryTop + 20, { align: 'right' });
    doc.text(`INR ${taxAmount.toLocaleString()}`, 470, summaryTop + 20, { align: 'right' });

    doc.fontSize(14).fillColor('#EAB308').text('Total Paid:', 350, summaryTop + 45, { align: 'right' });
    doc.text(`INR ${payment.amount.toLocaleString()}`, 470, summaryTop + 45, { align: 'right' });

    // Footer note
    doc.fillColor('#9CA3AF').fontSize(10).text('Thank you for your business! Stay fit, stay strong.', 50, 500, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getPaymentHistory,
  createOrder,
  verifyPayment,
  downloadInvoice
};
