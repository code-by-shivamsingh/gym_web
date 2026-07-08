const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');
const { createNotificationHelper } = require('./notificationController');
const crypto = require('crypto');
const config = require('../config/config');
const QRCode = require('qrcode');

// Helper to generate invoice PDF buffer
const generateInvoiceBuffer = async (payment) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Load gym settings
      let settings = await Settings.findOne();
      if (!settings) {
        settings = {
          gymName: 'Forge Gym',
          address: 'Gwalior, Madhya Pradesh (M.P.), India',
          mobile: '+1234567890',
          taxRate: 18
        };
      }

      // Brand header
      doc.fillColor('#EAB308').fontSize(24).text(settings.gymName.toUpperCase(), 50, 45, { align: 'left' });
      doc.fillColor('#000000').fontSize(10).text(settings.address, 50, 75);
      doc.text(`Phone: ${settings.mobile}`, 50, 90);

      // Invoice title
      doc.fillColor('#000000').fontSize(20).text('INVOICE', 400, 45, { align: 'right' });
      doc.fontSize(10);
      const txIdStr = payment.transactionId || '';
      const invSuffix = txIdStr.includes('-') ? txIdStr.split('-')[1] : (txIdStr || '1001');
      doc.text(`Invoice No: INV-${invSuffix}`, 400, 75, { align: 'right' });
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' });
      doc.text(`Status: ${payment.status.toUpperCase()}`, 400, 105, { align: 'right' });

      // Divider line
      doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#E4E4E7').stroke();

      // Bill To
      const userName = payment.user ? payment.user.name : 'N/A';
      const userEmail = payment.user ? payment.user.email : 'N/A';
      const userMobile = payment.user ? (payment.user.mobile || 'N/A') : 'N/A';

      doc.fontSize(12).fillColor('#4B5563').text('BILL TO:', 50, 150);
      doc.fontSize(14).fillColor('#000000').text(userName, 50, 170);
      doc.fontSize(10).fillColor('#4B5563').text(`Email: ${userEmail}`, 50, 190);
      doc.text(`Mobile: ${userMobile}`, 50, 205);

      // Payment details side (at x=350)
      doc.fontSize(12).fillColor('#4B5563').text('PAYMENT DETAILS:', 350, 150);
      doc.fontSize(10).fillColor('#000000').text(`Method: ${payment.method || 'N/A'}`, 350, 170);
      doc.text(`Txn ID: ${payment.transactionId || 'N/A'}`, 350, 185);
      doc.text(`Order ID: ${payment.orderId || 'N/A'}`, 350, 200);

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

      doc.text(`Forge Gym ${payment.plan || 'Premium'} Membership Subscription`, 60, itemTop, { width: 280 });
      doc.text('1', 350, itemTop, { width: 50, align: 'right' });
      doc.text(`INR ${baseRate.toFixed(2)}`, 400, itemTop, { width: 60, align: 'right' });
      doc.text(`INR ${baseRate.toFixed(2)}`, 470, itemTop, { width: 70, align: 'right' });

      // Divider
      doc.moveTo(50, itemTop + 25).lineTo(550, itemTop + 25).strokeColor('#E4E4E7').stroke();

      // Summary calculations
      let y = itemTop + 40;

      // Divider line before Subtotal
      doc.moveTo(320, y).lineTo(540, y).strokeColor('#E4E4E7').lineWidth(1).stroke();
      y += 12;

      // Row 1: Subtotal
      doc.fontSize(10).fillColor('#4B5563');
      doc.text('Subtotal', 320, y, { width: 100, align: 'left' });
      doc.text(`INR ${baseRate.toFixed(2)}`, 420, y, { width: 120, align: 'right' });
      y += 22;

      // Row 2: GST
      doc.text(`GST (${settings.taxRate}%)`, 320, y, { width: 100, align: 'left' });
      doc.text(`INR ${taxAmount.toFixed(2)}`, 420, y, { width: 120, align: 'right' });
      y += 22;

      // Divider line before Total
      doc.moveTo(320, y).lineTo(540, y).strokeColor('#E4E4E7').stroke();
      y += 12;

      // Row 3: Total Paid
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#EAB308');
      doc.text('Total Amount', 320, y, { width: 100, align: 'left' });
      doc.text(`INR ${payment.amount.toFixed(2)}`, 420, y, { width: 120, align: 'right' });
      y += 24;

      // Divider line after Total
      doc.moveTo(320, y).lineTo(540, y).strokeColor('#E4E4E7').stroke();

      // Reset Font style
      doc.font('Helvetica');

      // Footer note
      doc.fillColor('#9CA3AF').fontSize(10).text('Thank you for your business! Stay fit, stay strong.', 50, 500, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    let query = {};
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
  console.log(`\n[PAYMENT ORDER] ➕ Order creation requested by user ${req.user?.id || 'unknown'} with body:`, req.body);
  try {
    const { method, planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid planId' });
    }

    if (!method) {
      return res.status(400).json({ success: false, message: 'Please provide payment method' });
    }

    // Retrieve plan details strictly from the database
    const planDoc = await MembershipPlan.findById(planId);
    if (!planDoc) {
      return res.status(404).json({ success: false, message: 'Membership plan not found in database' });
    }

    const planName = planDoc.name;
    const expectedAmount = planDoc.price;

    const generatedOrderId = `ORDER-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Create the DB record in Pending state
    const order = await Payment.create({
      user: req.user.id,
      amount: expectedAmount,
      plan: planName,
      method,
      status: 'Pending',
      transactionId: '',
      orderId: generatedOrderId
    });

    console.log(`[PAYMENT] Order created: ${order._id} | Status: ${order.status} | Expected Amount: ${order.amount}`);

    const host = req.headers.host || 'localhost:5000';
    let paymentUrl = '';
    let gateway = 'sandbox';
    let upiUrl = null;
    let qrCodeBase64 = null;
    let sandboxToken = null;

    // Populate user profile info for payment gateways
    const user = await Member.findOne({ user: req.user.id }).populate('user');
    const userName = user ? user.name : 'Member';
    const userEmail = req.user.email || 'member@forgegym.com';
    const userMobile = user ? (user.mobile || '7610425720') : '7610425720';

    // Check gateway configurations dynamically
    const hasRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const hasStripe = !!process.env.STRIPE_SECRET_KEY;
    const hasPhonePe = !!(process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY);

    if (hasRazorpay) {
      gateway = 'razorpay';
      try {
        const razorpayBody = {
          amount: expectedAmount * 100, // in paise
          currency: 'INR',
          accept_partial: false,
          description: `Forge Gym - ${planName} Subscription`,
          customer: {
            name: userName,
            email: userEmail,
            contact: userMobile
          },
          notify: {
            sms: false,
            email: true
          },
          reminder_enable: false,
          callback_url: `forgegym://payment-response?orderId=${order._id}`,
          callback_method: 'get'
        };

        const razorpayHeaders = {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64'),
          'Content-Type': 'application/json'
        };

        const response = await makeHttpsRequest('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: razorpayHeaders,
          body: razorpayBody
        });

        if (response.statusCode >= 200 && response.statusCode < 300 && response.body && response.body.short_url) {
          order.transactionId = response.body.id;
          await order.save();
          paymentUrl = response.body.short_url;
          console.log(`[PAYMENT] Payment initiated via Razorpay for Order ${order.orderId}: URL: ${paymentUrl}`);
        } else {
          console.error('[PAYMENT] Razorpay link creation failed:', response.body);
          throw new Error('Razorpay initialization failed.');
        }
      } catch (err) {
        console.error('[PAYMENT] Razorpay integration error:', err.message);
        return res.status(502).json({ success: false, message: 'Razorpay initialization failed.' });
      }
    } else if (hasStripe) {
      gateway = 'stripe';
      try {
        const stripeParams = {
          'success_url': `forgegym://payment-response?orderId=${order._id}&status=Completed`,
          'cancel_url': `forgegym://payment-response?orderId=${order._id}&status=Cancelled`,
          'mode': 'payment',
          'payment_method_types[0]': 'card',
          'line_items[0][price_data][currency]': 'inr',
          'line_items[0][price_data][product_data][name]': `Forge Gym - ${planName} Subscription`,
          'line_items[0][price_data][unit_amount]': expectedAmount * 100, // in paise
          'line_items[0][quantity]': 1
        };

        const stripeHeaders = {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        const response = await makeHttpsRequest('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: stripeHeaders,
          body: urlencodeBody(stripeParams)
        });

        if (response.statusCode >= 200 && response.statusCode < 300 && response.body && response.body.url) {
          order.transactionId = response.body.id;
          await order.save();
          paymentUrl = response.body.url;
          console.log(`[PAYMENT] Payment initiated via Stripe for Order ${order.orderId}: URL: ${paymentUrl}`);
        } else {
          console.error('[PAYMENT] Stripe Checkout creation failed:', response.body);
          throw new Error('Stripe initialization failed.');
        }
      } catch (err) {
        console.error('[PAYMENT] Stripe integration error:', err.message);
        return res.status(502).json({ success: false, message: 'Stripe initialization failed.' });
      }
    } else if (hasPhonePe) {
      gateway = 'phonepe';
      try {
        const phonepePayload = {
          merchantId: process.env.PHONEPE_MERCHANT_ID,
          merchantTransactionId: order.orderId,
          merchantUserId: req.user.id,
          amount: expectedAmount * 100, // in paise
          redirectUrl: `forgegym://payment-response?orderId=${order._id}`,
          redirectMode: 'REDIRECT',
          paymentInstrument: {
            type: 'PAY_PAGE'
          }
        };

        const base64Payload = Buffer.from(JSON.stringify(phonepePayload)).toString('base64');
        const stringToHash = base64Payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerifyHeader = `${hash}###${process.env.PHONEPE_SALT_INDEX || '1'}`;

        const phonepeHeaders = {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader
        };

        const phonepeUrl = (process.env.PHONEPE_ENV === 'production')
          ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
          : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

        const response = await makeHttpsRequest(phonepeUrl, {
          method: 'POST',
          headers: phonepeHeaders,
          body: { request: base64Payload }
        });

        if (response.statusCode >= 200 && response.statusCode < 300 && response.body && response.body.success && response.body.data.instrumentResponse.redirectInfo.url) {
          order.transactionId = order.orderId;
          await order.save();
          paymentUrl = response.body.data.instrumentResponse.redirectInfo.url;
          console.log(`[PAYMENT] Payment initiated via PhonePe for Order ${order.orderId}: URL: ${paymentUrl}`);
        } else {
          console.error('[PAYMENT] PhonePe Pay creation failed:', response.body);
          throw new Error('PhonePe initialization failed.');
        }
      } catch (err) {
        console.error('[PAYMENT] PhonePe integration error:', err.message);
        return res.status(502).json({ success: false, message: 'PhonePe initialization failed.' });
      }
    } else {
      // Sandbox Developer Mode Fallback (Zero automatic success, manual validation checkout screen)
      gateway = 'sandbox';
      
      let settings = await Settings.findOne();
      if (!settings) {
        settings = {
          upiId: '7610425720@ybl',
          gymName: 'Forge Gym'
        };
      }
      
      const upiId = settings.upiId || '7610425720@ybl';
      const gymName = settings.gymName || 'Forge Gym';
      const encodedGymName = encodeURIComponent(gymName);
      const encodedNote = encodeURIComponent(`Forge Gym - ${planName} Subscription`);
      
      upiUrl = `upi://pay?pa=${upiId}&pn=${encodedGymName}&tr=${order.orderId}&am=${expectedAmount}.00&cu=INR&tn=${encodedNote}`;
      
      try {
        qrCodeBase64 = await QRCode.toDataURL(upiUrl);
      } catch (qrErr) {
        console.error('[PAYMENT] Error generating sandbox QR Code:', qrErr);
      }
      
      sandboxToken = crypto.createHmac('sha256', config.JWT_SECRET).update(`${order._id}|Pending`).digest('hex');
      
      paymentUrl = `http://${host}/api/payments/sandbox-checkout?orderId=${order._id}&sandboxToken=${sandboxToken}`;
      console.log(`[PAYMENT] Payment initiated via Sandbox for Order ${order.orderId}: URL: ${paymentUrl}`);
    }

    res.status(201).json({ 
      success: true, 
      data: order,
      paymentUrl,
      gateway,
      upiUrl,
      qrCodeBase64,
      sandboxToken
    });
  } catch (error) {
    console.error('[PAYMENT] Create Order Exception:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify payment status securely with Gateway API
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[PAYMENT VERIFICATION] 🛡️ Verification request received at ${timestamp}`);
  
  try {
    const { orderId } = req.body;

    if (!orderId) {
      console.warn(`[PAYMENT VERIFICATION] ❌ Missing verification parameters. Body:`, req.body);
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    console.log(`[PAYMENT] Verification started for Order: ${orderId}`);

    const payment = await Payment.findById(orderId).populate('user');
    if (!payment) {
      console.error(`[PAYMENT VERIFICATION] ❌ Payment order not found in DB: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Security Check: Ensure authenticated user owns the transaction (Admins bypass)
    if (req.user.role !== 'Admin' && payment.user._id.toString() !== req.user.id) {
      console.warn(`[PAYMENT VERIFICATION] 🚫 Unauthorized: User ${req.user.id} tried to verify Order ${orderId} belonging to user ${payment.user._id}`);
      return res.status(403).json({ success: false, message: 'Unauthorized access to this payment record.' });
    }

    console.log(`[PAYMENT VERIFICATION] Database entry found for Order: ${payment._id} | Status: ${payment.status} | Processed: ${payment.processed}`);

    // Prevent duplicate processing / replay attacks
    if (payment.processed) {
      console.warn(`[PAYMENT VERIFICATION] ⚠️ Duplicate request: Order ${orderId} has already been processed.`);
      return res.status(200).json({ success: true, data: payment });
    }

    if (payment.status === 'Failed') {
      console.warn(`[PAYMENT VERIFICATION] ❌ Order ${orderId} status is Failed/Declined.`);
      return res.status(400).json({ success: false, message: 'Payment transaction failed or was declined.' });
    }

    if (payment.status === 'Cancelled') {
      console.warn(`[PAYMENT VERIFICATION] ❌ Order ${orderId} status is Cancelled.`);
      return res.status(400).json({ success: false, message: 'Payment transaction was cancelled.' });
    }

    let isSuccess = false;

    // Detect what gateway was used and verify with the gateway directly
    const hasRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const hasStripe = !!process.env.STRIPE_SECRET_KEY;
    const hasPhonePe = !!(process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY);

    const isRazorpayTxn = payment.transactionId && payment.transactionId.startsWith('plink_');
    const isStripeTxn = payment.transactionId && payment.transactionId.startsWith('cs_');
    const isPhonePeTxn = payment.transactionId && payment.transactionId.startsWith('ORDER-');

    if (isRazorpayTxn && hasRazorpay) {
      try {
        const razorpayHeaders = {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64'),
          'Content-Type': 'application/json'
        };
        const response = await makeHttpsRequest(`https://api.razorpay.com/v1/payment_links/${payment.transactionId}`, {
          method: 'GET',
          headers: razorpayHeaders
        });
        if (response.statusCode === 200 && response.body) {
          const gatewayAmount = response.body.amount / 100;
          const gatewayCurrency = (response.body.currency || 'INR').toUpperCase();
          if (response.body.status === 'paid') {
            if (Math.abs(gatewayAmount - payment.amount) > 0.01) {
              console.warn(`[PAYMENT VERIFICATION] Razorpay amount mismatch: Gateway returned ${gatewayAmount}, DB has ${payment.amount}`);
              isSuccess = false;
            } else if (gatewayCurrency !== 'INR') {
              console.warn(`[PAYMENT VERIFICATION] Razorpay currency mismatch: Gateway returned ${gatewayCurrency}, expected INR`);
              isSuccess = false;
            } else {
              isSuccess = true;
              payment.paymentId = response.body.payments && response.body.payments[0] ? response.body.payments[0].payment_id : `PAY-${payment.transactionId}`;
            }
          } else if (['expired', 'cancelled'].includes(response.body.status)) {
            payment.status = 'Cancelled';
            payment.processed = true;
            await payment.save();
          } else if (response.body.status === 'failed') {
            payment.status = 'Failed';
            payment.processed = true;
            await payment.save();
          }
        }
      } catch (err) {
        console.error('[PAYMENT VERIFICATION] Razorpay API verification failed:', err.message);
      }
    } else if (isStripeTxn && hasStripe) {
      try {
        const stripeHeaders = {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        };
        const response = await makeHttpsRequest(`https://api.stripe.com/v1/checkout/sessions/${payment.transactionId}`, {
          method: 'GET',
          headers: stripeHeaders
        });
        if (response.statusCode === 200 && response.body) {
          const gatewayAmount = response.body.amount_total / 100;
          const gatewayCurrency = (response.body.currency || 'INR').toUpperCase();
          if (response.body.payment_status === 'paid') {
            if (Math.abs(gatewayAmount - payment.amount) > 0.01) {
              console.warn(`[PAYMENT VERIFICATION] Stripe amount mismatch: Gateway returned ${gatewayAmount}, DB has ${payment.amount}`);
              isSuccess = false;
            } else if (gatewayCurrency !== 'INR') {
              console.warn(`[PAYMENT VERIFICATION] Stripe currency mismatch: Gateway returned ${gatewayCurrency}, expected INR`);
              isSuccess = false;
            } else {
              isSuccess = true;
              payment.paymentId = response.body.payment_intent || `PAY-${payment.transactionId}`;
            }
          } else if (response.body.status === 'expired') {
            payment.status = 'Failed';
            payment.processed = true;
            await payment.save();
          }
        }
      } catch (err) {
        console.error('[PAYMENT VERIFICATION] Stripe API verification failed:', err.message);
      }
    } else if (isPhonePeTxn && hasPhonePe) {
      try {
        const stringToHash = `/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${payment.orderId}` + process.env.PHONEPE_SALT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerifyHeader = `${hash}###${process.env.PHONEPE_SALT_INDEX || '1'}`;

        const phonepeHeaders = {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
        };

        const phonepeUrl = (process.env.PHONEPE_ENV === 'production')
          ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${payment.orderId}`
          : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${payment.orderId}`;

        const response = await makeHttpsRequest(phonepeUrl, {
          method: 'GET',
          headers: phonepeHeaders
        });

        if (response.statusCode === 200 && response.body && response.body.success) {
          if (response.body.code === 'PAYMENT_SUCCESS') {
            const gatewayAmount = response.body.data.amount / 100;
            if (Math.abs(gatewayAmount - payment.amount) > 0.01) {
              console.warn(`[PAYMENT VERIFICATION] PhonePe amount mismatch: Gateway returned ${gatewayAmount}, DB has ${payment.amount}`);
              isSuccess = false;
            } else {
              isSuccess = true;
              payment.paymentId = response.body.data.transactionId || `PAY-${payment.transactionId}`;
            }
          } else if (['PAYMENT_ERROR', 'PAYMENT_DECLINED', 'TIMED_OUT'].includes(response.body.code)) {
            payment.status = 'Failed';
            payment.processed = true;
            await payment.save();
          }
        }
      } catch (err) {
        console.error('[PAYMENT VERIFICATION] PhonePe API verification failed:', err.message);
      }
    } else {
      // Sandbox fallback mode - in sandbox mode, status remains Pending. No auto-success verification is permitted.
      console.log(`[PAYMENT VERIFICATION] Sandbox verification check for Order ${orderId}. Current status is: ${payment.status}`);
      if (payment.transactionId === 'PAY-MOCK-FAILED') {
        payment.status = 'Failed';
        payment.processed = true;
        await payment.save();
        console.log(`[PAYMENT VERIFICATION] Sandbox verification reported failure. Status set to: Failed`);
      } else {
        isSuccess = false;
        console.log(`[PAYMENT VERIFICATION] Sandbox verification pending/unverified: Status remains Pending.`);
      }
    }

    if (isSuccess) {
      payment.status = 'Completed';
      payment.processed = true;
      payment.invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      await payment.save();

      console.log(`[PAYMENT] Verification successful for Order: ${orderId}`);

      // Update membership status
      const member = await Member.findOne({ user: payment.user });
      if (member) {
        member.status = 'Active';
        const currentExpiry = member.expiryDate;
        const extension = 30 * 24 * 60 * 60 * 1000; // 30 days extension
        
        if (currentExpiry && currentExpiry > Date.now()) {
          member.expiryDate = new Date(currentExpiry.getTime() + extension);
        } else {
          member.expiryDate = new Date(Date.now() + extension);
        }

        member.plan = payment.plan;
        await member.save();
        
        console.log(`[PAYMENT] Membership activated for User: ${payment.user.email || member.email}`);

        // Trigger payment success notification
        await createNotificationHelper(
          payment.user._id,
          'Membership Extended! ✅',
          `Your subscription renewal payment of ₹${payment.amount} was verified successfully. Expiry date extended by 30 days. Plan: ${payment.plan}.`,
          'success'
        );

        // Generate invoice PDF buffer and send receipt email
        try {
          const pdfBuffer = await generateInvoiceBuffer(payment);
          const sendInvoiceEmail = require('../utils/sendInvoiceEmail');
          await sendInvoiceEmail({
            to: payment.user.email,
            subject: `Payment Receipt - Invoice ${payment.invoiceNumber}`,
            userName: payment.user.name,
            amount: payment.amount,
            planName: payment.plan,
            txnId: payment.transactionId,
            pdfBuffer
          });
          console.log(`[PAYMENT] Invoice generated for Order: ${orderId}`);
        } catch (emailErr) {
          console.error('[PAYMENT] Invoice generated but email delivery failed:', emailErr.message);
        }
      }

      return res.status(200).json({ success: true, data: payment });
    } else {
      console.log(`[PAYMENT] Verification failed for Order: ${orderId}`);
      return res.status(400).json({ success: false, message: 'Payment is awaiting verification.' });
    }
  } catch (error) {
    console.error('[PAYMENT VERIFICATION EXCEPTION]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper for native HTTPS request calls without NPM packages
const makeHttpsRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const reqOptions = {
        method: options.method || 'GET',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: options.headers || {}
      };

      const req = require('https').request(reqOptions, (res) => {
        let chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const bodyStr = Buffer.concat(chunks).toString();
          let bodyJson = null;
          try {
            bodyJson = JSON.parse(bodyStr);
          } catch (e) {
            bodyJson = bodyStr;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: bodyJson
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    } catch (e) {
      reject(e);
    }
  });
};

// Helper to urlencode objects for Stripe URL encoded requests
const urlencodeBody = (obj) => {
  return Object.keys(obj)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');
};

// Sandbox Checkout Page rendering
const renderSandboxCheckout = async (req, res) => {
  try {
    const { orderId, sandboxToken } = req.query;
    if (!orderId) {
      return res.status(400).send('<h1>Error</h1><p>Missing orderId parameter.</p>');
    }

    // Verify sandboxToken to prevent unauthorized checkout loading
    const expectedToken = crypto.createHmac('sha256', config.JWT_SECRET).update(`${orderId}|Pending`).digest('hex');
    if (sandboxToken !== expectedToken) {
      return res.status(401).send('<h1>Error</h1><p>Unauthorized payment checkout session.</p>');
    }

    const order = await Payment.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).send('<h1>Error</h1><p>Order not found.</p>');
    }

    // Load gym settings for VPA configuration
    let settings = await Settings.findOne();
    if (!settings) {
      settings = {
        upiId: '7610425720@ybl',
        gymName: 'Forge Gym'
      };
    }
    const upiId = settings.upiId || '7610425720@ybl';
    const gymName = settings.gymName || 'Forge Gym';

    // Generate dynamic QR Code for UPI payment matching official spec
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Forge Gym - ${order.plan} Subscription`)}`;
    const qrCodeBase64 = await QRCode.toDataURL(upiString);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forge Gym - Sandbox Payment Gateway</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
          body {
            background-color: #0c0a09;
            color: #fafaf9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .checkout-card {
            background: #1c1917;
            border: 1px solid #2e2a24;
            border-radius: 20px;
            max-width: 460px;
            width: 100%;
            padding: 24px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            text-align: center;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #eab308;
            margin-bottom: 6px;
            letter-spacing: 1.5px;
          }
          .secure-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(234, 179, 8, 0.1);
            color: #eab308;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 16px;
            border: 1px solid rgba(234, 179, 8, 0.2);
          }
          .amount-header {
            background: #292524;
            border: 1px solid #44403c;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .amount-label { color: #a8a29e; font-size: 13px; }
          .amount-val { color: #fafaf9; font-size: 18px; font-weight: 800; }
          
          /* Tabs selector */
          .tab-bar {
            display: flex;
            border-bottom: 1px solid #44403c;
            margin-bottom: 20px;
          }
          .tab-btn {
            flex: 1;
            background: none;
            border: none;
            color: #78716c;
            padding: 10px 0;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
          }
          .tab-btn.active {
            color: #eab308;
            border-bottom-color: #eab308;
          }
          
          .tab-panel {
            display: none;
            min-height: 180px;
          }
          .tab-panel.active {
            display: block;
          }
          
          /* QR code stylings */
          .qr-container {
            background: white;
            padding: 12px;
            border-radius: 16px;
            display: inline-block;
            margin-bottom: 10px;
          }
          .qr-img {
            width: 140px;
            height: 140px;
          }
          .upi-info {
            font-size: 12px;
            color: #a8a29e;
            margin-bottom: 12px;
          }
          
          /* Form inputs */
          .form-group {
            margin-bottom: 12px;
            text-align: left;
          }
          .form-group label {
            display: block;
            font-size: 12px;
            color: #a8a29e;
            margin-bottom: 4px;
          }
          .form-input {
            width: 100%;
            background: #0c0a09;
            border: 1px solid #44403c;
            border-radius: 8px;
            padding: 10px;
            color: white;
            outline: none;
            font-size: 13px;
          }
          .form-input:focus {
            border-color: #eab308;
          }
          
          .flex-row {
            display: flex;
            gap: 10px;
          }
          
          /* Bank list */
          .bank-select {
            width: 100%;
            background: #0c0a09;
            border: 1px solid #44403c;
            border-radius: 8px;
            padding: 12px;
            color: white;
            outline: none;
            font-size: 13px;
            margin-bottom: 12px;
          }
          
          /* Buttons */
          .btn {
            display: block;
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            margin-bottom: 10px;
            transition: all 0.2s ease;
            text-align: center;
            border: none;
          }
          .btn-primary {
            background: #eab308;
            color: #0c0a09;
          }
          .btn-primary:hover { background: #ca8a04; }
          
          .btn-secondary {
            background: transparent;
            color: #ef4444;
            border: 1px solid #ef4444;
          }
          .btn-secondary:hover { background: rgba(239, 68, 68, 0.1); }
          
          /* Overlay loader */
          .loader-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(12, 10, 9, 0.95);
            z-index: 100;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            gap: 16px;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #eab308;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loader-text {
            font-weight: bold;
            color: #eab308;
            font-size: 16px;
          }
          .loader-subtext {
            color: #78716c;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="checkout-card">
          <div class="brand">FORGE GYM</div>
          <div class="secure-badge">🛡️ SECURE DEVELOPER CHECKOUT</div>
          
          <div class="amount-header">
            <span class="amount-label">Subscribed Plan: <strong>${order.plan}</strong></span>
            <span class="amount-val">INR ${order.amount.toFixed(2)}</span>
          </div>
          
          <!-- Tab Selector -->
          <div class="tab-bar">
            <button class="tab-btn active" onclick="switchTab(event, 'upi')">UPI & QR</button>
            <button class="tab-btn" onclick="switchTab(event, 'card')">Card</button>
            <button class="tab-btn" onclick="switchTab(event, 'netbanking')">NetBanking</button>
          </div>
          
          <!-- UPI Tab -->
          <div id="panel-upi" class="tab-panel active">
            <div class="qr-container">
              <img src="${qrCodeBase64}" alt="UPI QR" class="qr-img" />
            </div>
            <p class="upi-info">Scan the QR code with any UPI app to pay <strong>${upiId}</strong> (GPay, PhonePe, Paytm)</p>
            
            <div class="form-group">
              <label>Your UPI ID</label>
              <input type="text" id="upi-id" class="form-input" placeholder="e.g. member@okhdfcbank" value="member@upi" />
            </div>
          </div>
          
          <!-- Card Tab -->
          <div id="panel-card" class="tab-panel">
            <div class="form-group">
              <label>Cardholder Name</label>
              <input type="text" class="form-input" placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label>Card Number</label>
              <input type="text" class="form-input" placeholder="4111 2222 3333 4444" />
            </div>
            <div class="flex-row">
              <div class="form-group" style="flex: 2;">
                <label>Expiry Date</label>
                <input type="text" class="form-input" placeholder="MM/YY" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label>CVV</label>
                <input type="password" class="form-input" placeholder="123" />
              </div>
            </div>
          </div>
          
          <!-- Net Banking Tab -->
          <div id="panel-netbanking" class="tab-panel">
            <label class="upi-info" style="display:block; text-align:left; margin-bottom: 8px;">Select your bank</label>
            <select class="bank-select">
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
            </select>
          </div>
          
          <form id="action-form" action="/api/payments/sandbox-action" method="POST">
            <input type="hidden" name="orderId" value="${order._id}">
            <input type="hidden" name="sandboxToken" value="${sandboxToken}">
            <input type="hidden" id="action-input" name="action" value="SUCCEED">
            
            <button type="button" onclick="processPayment('SUCCEED')" class="btn btn-primary">Pay INR ${order.amount.toFixed(2)} Securely</button>
            <button type="button" onclick="processPayment('FAIL')" class="btn btn-secondary">Decline & Cancel Transaction ❌</button>
          </form>
        </div>
        
        <!-- Full Screen Loader Overlay -->
        <div id="loader-overlay" class="loader-overlay">
          <div class="spinner"></div>
          <p id="loader-status" class="loader-text">Connecting to gateway...</p>
          <p class="loader-subtext">Securing transaction parameters. Please do not refresh.</p>
        </div>
        
        <script>
          function switchTab(event, tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            
            event.currentTarget.classList.add('active');
            document.getElementById('panel-' + tabId).classList.add('active');
          }
          
          function processPayment(action) {
            document.getElementById('action-input').value = action;
            
            const overlay = document.getElementById('loader-overlay');
            const statusText = document.getElementById('loader-status');
            overlay.style.display = 'flex';
            
            if (action === 'SUCCEED') {
              setTimeout(() => {
                statusText.innerText = 'Authorizing transaction details...';
                setTimeout(() => {
                  statusText.innerText = 'Completing subscription renewal...';
                  setTimeout(() => {
                    document.getElementById('action-form').submit();
                  }, 1000);
                }, 1200);
              }, 800);
            } else {
              statusText.innerText = 'Cancelling transaction request...';
              statusText.style.color = '#ef4444';
              setTimeout(() => {
                document.getElementById('action-form').submit();
              }, 1000);
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Server Error</h1><p>Sandbox checkout creation failed.</p>');
  }
};

// Sandbox Checkout Action callback
const handleSandboxAction = async (req, res) => {
  try {
    const { orderId, action, sandboxToken } = req.body;
    if (!orderId || !action || !sandboxToken) {
      return res.status(400).send('<h1>Error</h1><p>Missing orderId, action, or sandboxToken parameters.</p>');
    }

    // Verify sandboxToken to prevent unauthorized status changes
    const expectedToken = crypto.createHmac('sha256', config.JWT_SECRET).update(`${orderId}|Pending`).digest('hex');
    if (sandboxToken !== expectedToken) {
      return res.status(401).send('<h1>Error</h1><p>Invalid transaction signature.</p>');
    }

    const order = await Payment.findById(orderId);
    if (!order) {
      return res.status(404).send('<h1>Error</h1><p>Order not found.</p>');
    }

    if (order.status !== 'Pending') {
      return res.status(400).send('<h1>Error</h1><p>This order is already processed.</p>');
    }

    // We do NOT update order.status to Completed/Failed here. We keep it Pending.
    order.transactionId = action === 'SUCCEED' ? 'PAY-MOCK-PENDING' : 'PAY-MOCK-FAILED';
    await order.save();

    console.log(`[SANDBOX GATEWAY] Order ${orderId} transaction outcome set to: ${order.transactionId}`);

    const targetUrl = `forgegym://payment/success?orderId=${orderId}&paymentStatus=Pending&amount=${order.amount}&membershipPlan=${encodeURIComponent(order.plan)}&transactionId=${order.transactionId}`;

    // Redirect to deep link scheme, with a fallback store redirect or closing tab helper
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to Forge Gym App...</title>
        <script>
          window.onload = function() {
            // Attempt auto-redirection via custom deep-link scheme
            window.location.href = "${targetUrl}";
            
            // Close tab automatically in browser after 2 seconds for web checkout
            setTimeout(function() {
              window.close();
            }, 2000);
          }
        </script>
        <style>
          body { background-color: #0c0a09; color: #fafaf9; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; text-align: center; }
        </style>
      </head>
      <body>
        <div>
          <h1 style="color: #22c55e;">Transaction Authorized!</h1>
          <p style="margin-top: 10px;">Return to your main window/tab to verify status.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Error</h1><p>Failed to record payment action.</p>');
  }
};

// Download invoice PDF
// @desc    Download invoice PDF
// @route   GET /api/invoices/:paymentId
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('user');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Security Check: Verify user owns the transaction (Admins bypass)
    if (req.user.role !== 'Admin' && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download this invoice.' });
    }

    const pdfBuffer = await generateInvoiceBuffer(payment);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${payment.transactionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all membership plans
// @route   GET /api/payments/plans
// @access  Private
const getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find().sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('[GET PLANS ERROR]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Cancel payment order
// @route   POST /api/payments/cancel
// @access  Private
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId parameter.' });
    }

    const payment = await Payment.findById(orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Security Check: Verify user owns the transaction (Admins bypass)
    if (req.user.role !== 'Admin' && payment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this payment record.' });
    }

    if (payment.status === 'Pending') {
      payment.status = 'Cancelled';
      await payment.save();
      console.log(`[PAYMENT] Order ${orderId} has been marked as Cancelled by user action.`);
      return res.status(200).json({ success: true, data: payment });
    }

    return res.status(400).json({ success: false, message: 'Cannot cancel a processed transaction.' });
  } catch (error) {
    console.error('[PAYMENT CANCELLATION EXCEPTION]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Gateway webhook callback
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  console.log('[PAYMENT WEBHOOK] 🔔 Webhook request received');
  try {
    let isVerified = false;
    let orderId = null;
    let gatewayTxnId = null;
    let isSuccess = false;
    
    const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'] || req.headers['x-verify'];

    if (req.headers['x-razorpay-signature']) {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[SECURITY CRITICAL] RAZORPAY_WEBHOOK_SECRET is not configured in production.');
        return res.status(500).json({ success: false, message: 'Configuration error' });
      }
      const actualSecret = secret || 'razorpay_webhook_secret';
      const shasum = crypto.createHmac('sha256', actualSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest === signature) {
        isVerified = true;
        const event = req.body.event;
        if (event === 'payment_link.paid') {
          const paymentLink = req.body.payload.payment_link.entity;
          orderId = paymentLink.id;
          gatewayTxnId = req.body.payload.payment.entity.id;
          isSuccess = true;
        }
      }
    } else if (req.headers['stripe-signature']) {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[SECURITY CRITICAL] STRIPE_WEBHOOK_SECRET is not configured in production.');
        return res.status(500).json({ success: false, message: 'Configuration error' });
      }
      const actualSecret = secret || 'stripe_webhook_secret';
      const [tsPart, sigPart] = signature.split(',');
      const timestamp = tsPart.split('=')[1];
      const stripeSig = sigPart.split('=')[1];
      
      // Prevent webhook replay attacks by validating timestamp age (limit to 5 minutes / 300s)
      const webhookAge = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10));
      if (webhookAge > 300) {
        console.warn('[PAYMENT WEBHOOK] ❌ Stripe Webhook timestamp age exceeds 5 minutes.');
        return res.status(400).json({ success: false, message: 'Webhook timestamp expired' });
      }

      const signedPayload = `${timestamp}.${JSON.stringify(req.body)}`;
      const shasum = crypto.createHmac('sha256', actualSecret).update(signedPayload).digest('hex');
      
      if (shasum === stripeSig) {
        isVerified = true;
        const event = req.body.type;
        if (event === 'checkout.session.completed') {
          const session = req.body.data.object;
          orderId = session.id;
          gatewayTxnId = session.payment_intent;
          isSuccess = session.payment_status === 'paid';
        }
      }
    } else if (req.headers['x-verify']) {
      const base64Body = req.body.response;
      const saltKey = process.env.PHONEPE_SALT_KEY;
      if (!saltKey && process.env.NODE_ENV === 'production') {
        console.error('[SECURITY CRITICAL] PHONEPE_SALT_KEY is not configured in production.');
        return res.status(500).json({ success: false, message: 'Configuration error' });
      }
      const actualSaltKey = saltKey || 'salt_key';
      const expectedSign = crypto.createHash('sha256').update(base64Body + actualSaltKey).digest('hex') + '###' + (process.env.PHONEPE_SALT_INDEX || '1');
      if (expectedSign === signature) {
        isVerified = true;
        const decoded = JSON.parse(Buffer.from(base64Body, 'base64').toString('utf8'));
        if (decoded.success && decoded.code === 'PAYMENT_SUCCESS') {
          orderId = decoded.data.merchantTransactionId;
          gatewayTxnId = decoded.data.transactionId;
          isSuccess = true;
        }
      }
    }

    if (!isVerified) {
      console.warn('[PAYMENT WEBHOOK] ❌ Webhook signature verification failed.');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    console.log(`[PAYMENT WEBHOOK] Signature Verified. Order Reference: ${orderId} | Success: ${isSuccess}`);

    if (orderId) {
      const payment = await Payment.findOne({
        $or: [
          { transactionId: orderId },
          { orderId: orderId }
        ]
      }).populate('user');

      if (payment) {
        if (!payment.processed) {
          if (isSuccess) {
            payment.status = 'Completed';
            payment.processed = true;
            payment.paymentId = gatewayTxnId || orderId;
            payment.invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
            await payment.save();
            
            const member = await Member.findOne({ user: payment.user._id });
            if (member) {
              member.status = 'Active';
              const currentExpiry = member.expiryDate;
              const extension = 30 * 24 * 60 * 60 * 1000;
              if (currentExpiry && currentExpiry > Date.now()) {
                member.expiryDate = new Date(currentExpiry.getTime() + extension);
              } else {
                member.expiryDate = new Date(Date.now() + extension);
              }
              member.plan = payment.plan;
              await member.save();
            }

            await createNotificationHelper(
              payment.user._id,
              'Payment Verified via Webhook! ✅',
              `Your subscription renewal payment of ₹${payment.amount} was verified by the gateway webhook. Plan: ${payment.plan}.`,
              'success'
            );

            try {
              const pdfBuffer = await generateInvoiceBuffer(payment);
              const sendInvoiceEmail = require('../utils/sendInvoiceEmail');
              await sendInvoiceEmail({
                to: payment.user.email,
                subject: `Payment Receipt - Invoice ${payment.invoiceNumber}`,
                userName: payment.user.name,
                amount: payment.amount,
                planName: payment.plan,
                txnId: payment.transactionId,
                pdfBuffer
              });
            } catch (emailErr) {
              console.error('[PAYMENT WEBHOOK] Email delivery failed:', emailErr.message);
            }
            console.log(`[PAYMENT WEBHOOK] ✅ Order ${payment._id} completed and membership extended successfully.`);
          } else {
            payment.status = 'Failed';
            payment.processed = true;
            await payment.save();
            console.log(`[PAYMENT WEBHOOK] ❌ Order ${payment._id} marked as Failed.`);
          }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[PAYMENT WEBHOOK EXCEPTION]', err);
    res.status(500).json({ success: false, message: 'Server Webhook Error' });
  }
};

// @desc    Developer payment status simulation (disabled in production)
// @route   POST /api/payments/developer-simulate
// @access  Private (Logged-in User / Admin)
const simulatePayment = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    console.warn(`[DEVELOPER SIMULATE] 🚫 Rejecting simulation on production server.`);
    return res.status(403).json({ success: false, message: 'Simulation is disabled in production environments.' });
  }

  const { orderId, action } = req.body;
  if (!orderId || !action) {
    return res.status(400).json({ success: false, message: 'Please provide orderId and action (SUCCEED, FAIL, CANCEL)' });
  }

  try {
    const payment = await Payment.findById(orderId).populate('user');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found.' });
    }

    if (payment.processed) {
      return res.status(400).json({ success: false, message: 'This transaction has already been processed.' });
    }

    console.log(`[DEVELOPER SIMULATE] Initiating mock action: ${action} for Order ${orderId}`);

    if (action === 'SUCCEED') {
      payment.status = 'Completed';
      payment.processed = true;
      payment.paymentId = `DEV-MOCK-${Math.floor(10000000 + Math.random() * 90000000)}`;
      payment.invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      await payment.save();

      console.log(`[PAYMENT] Verification successful for Order: ${orderId}`);

      // Activate membership
      const member = await Member.findOne({ user: payment.user._id || payment.user });
      if (member) {
        member.status = 'Active';
        const start = new Date();
        const expiry = new Date();
        expiry.setDate(start.getDate() + 30);
        member.joinedDate = start;
        member.expiryDate = expiry;
        member.plan = payment.plan;
        await member.save();
        console.log(`[PAYMENT] Membership activated for User: ${payment.user.email || member.email}`);
      }

      // Generate invoice
      try {
        const invoiceBuffer = await generateInvoiceBuffer(payment);
        const sendInvoiceEmail = require('../utils/sendInvoiceEmail');
        await sendInvoiceEmail({
          to: payment.user.email,
          subject: `Payment Receipt - Invoice ${payment.invoiceNumber}`,
          userName: payment.user.name,
          amount: payment.amount,
          planName: payment.plan,
          txnId: payment.transactionId,
          pdfBuffer: invoiceBuffer
        });
        console.log(`[PAYMENT] Invoice generated for Order: ${orderId}`);
      } catch (invoiceErr) {
        console.error('[PAYMENT] Invoice generated but email delivery failed:', invoiceErr.message);
      }

      return res.status(200).json({ success: true, message: 'Simulated payment SUCCESS verified.', data: payment });
    } else if (action === 'FAIL') {
      payment.status = 'Failed';
      payment.processed = true;
      await payment.save();
      console.log(`[PAYMENT] Verification failed for Order: ${orderId}`);
      return res.status(200).json({ success: true, message: 'Simulated payment FAILURE verified.', data: payment });
    } else if (action === 'CANCEL') {
      payment.status = 'Cancelled';
      payment.processed = true;
      await payment.save();
      console.log(`[PAYMENT] Verification failed for Order: ${orderId}`);
      return res.status(200).json({ success: true, message: 'Simulated payment CANCELLATION verified.', data: payment });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Supported values: SUCCEED, FAIL, CANCEL' });
    }
  } catch (error) {
    console.error('[DEVELOPER SIMULATE EXCEPTION]', error);
    res.status(500).json({ success: false, message: 'Server simulation error.' });
  }
};

module.exports = {
  getPaymentHistory,
  createOrder,
  verifyPayment,
  downloadInvoice,
  getPlans,
  renderSandboxCheckout,
  handleSandboxAction,
  cancelPayment,
  handleWebhook,
  simulatePayment
};
