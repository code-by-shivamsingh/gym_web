/**
 * sendInvoiceEmail.js
 * Utility to send payment confirmation receipts with invoice PDF attachment.
 */

const config = require('../config/config');

/**
 * Dispatches an invoice receipt email with the generated PDF attachment.
 */
const sendInvoiceEmail = async ({ to, subject, userName, amount, planName, txnId, pdfBuffer }) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[EMAIL SERVICE] 📄 Received invoice dispatch request at ${timestamp}`);
  console.log(`[EMAIL SERVICE]    Recipient: ${to} (Name: ${userName})`);
  console.log(`[EMAIL SERVICE]    Plan:      ${planName} (Txn: ${txnId})`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - Forge Gym</title>
      <style>
        body {
          background-color: #09090b;
          color: #f4f4f5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 0;
        }
        .wrapper { padding: 40px 20px; text-align: center; }
        .card {
          background-color: #18181b;
          border: 1px solid #27272a;
          border-top: 4px solid #eab308;
          border-radius: 24px;
          max-width: 520px;
          margin: 0 auto;
          padding: 44px 36px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          text-align: left;
        }
        .logo {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #eab308;
          margin-bottom: 6px;
          text-transform: uppercase;
          text-align: center;
        }
        .logo span { color: #ffffff; }
        .tagline { font-size: 12px; color: #71717a; letter-spacing: 1px; margin-bottom: 30px; text-align: center; }
        h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px; text-align: center; }
        p { font-size: 15px; line-height: 1.7; color: #a1a1aa; margin-bottom: 25px; }
        .details-container {
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 18px;
          padding: 20px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #18181b;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label { font-size: 13px; color: #71717a; }
        .detail-value { font-size: 13px; color: #ffffff; font-weight: bold; }
        .highlight { color: #eab308; }
        .divider { border: none; border-top: 1px solid #27272a; margin: 28px 0; }
        .note { font-size: 13px; color: #71717a; text-align: center; line-height: 1.6; }
        .footer { font-size: 11px; color: #3f3f46; margin-top: 28px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">FORGE<span>GYM</span></div>
          <div class="tagline">STRENGTH • DISCIPLINE • RESULTS</div>

          <h1>💪 Payment Confirmed!</h1>
          <p>Hi ${userName},</p>
          <p>
            Thank you for renewing your subscription with <span class="highlight">Forge Gym</span>.
            Your payment has been verified successfully. Your official invoice receipt is attached to this email.
          </p>

          <div class="details-container">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${txnId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Plan Selected:</span>
              <span class="detail-value highlight">${planName} Membership</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value">₹${amount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value" style="color: #22c55e;">COMPLETED</span>
            </div>
          </div>

          <p class="note">
            Your membership access has been renewed and extended by 30 days. Feel free to access the Forge Gym Portal on your mobile app to track your workout and nutrition schedules.
          </p>

          <hr class="divider">

          <div class="footer">
            © 2026 FORGE Fitness — Airport Rd, near SBI Bank, Shubhanjalipuram, Maharajpura, Gwalior, Madhya Pradesh 474002, India<br>
            This is an automated message. Please do not reply.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Check SMTP configurations
  const smtpUser = (config.SMTP_USER || '').trim();
  const smtpPass = (config.SMTP_PASS || '').trim();
  const smtpService = (config.SMTP_SERVICE || '').trim();
  const smtpHost = (config.SMTP_HOST || '').trim();

  const hasSmtpConfig = smtpUser && smtpPass && (smtpService || smtpHost);

  if (!hasSmtpConfig) {
    console.warn('[EMAIL SERVICE] ⚠️ No SMTP credentials set in .env. Swallowing attachment email dispatch.');
    return;
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.error('[EMAIL SERVICE] ❌ nodemailer not found.');
    throw new Error('Nodemailer module is not installed.');
  }

  // Clean spaces from Gmail App Password
  const cleanPass = smtpPass.replace(/\s+/g, '');

  const transportConfig = {
    auth: {
      user: smtpUser,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000
  };

  // Gmail special defaults
  if (smtpService.toLowerCase() === 'gmail') {
    transportConfig.host = 'smtp.gmail.com';
    transportConfig.port = 465;
    transportConfig.secure = true;
  } else if (smtpService) {
    transportConfig.service = smtpService;
  } else {
    const port = parseInt(config.SMTP_PORT || '587', 10);
    transportConfig.host = smtpHost;
    transportConfig.port = port;
    transportConfig.secure = port === 465;
  }

  const transporter = nodemailer.createTransport(transportConfig);

  let attempts = 0;
  const maxAttempts = 3;
  let sent = false;
  let lastError = null;

  while (attempts < maxAttempts && !sent) {
    try {
      attempts++;
      console.log(`[EMAIL SERVICE] ⏳ Sending invoice email (Attempt ${attempts}/${maxAttempts})...`);
      
      if (attempts === 1) {
        await transporter.verify();
        console.log('[EMAIL SERVICE] ✅ SMTP connection verified.');
      }

      await transporter.sendMail({
        from: config.SMTP_FROM || `"Forge Gym Receipts" <${smtpUser}>`,
        to,
        subject: subject || 'Payment Receipt - Forge Gym',
        html: htmlContent,
        attachments: [
          {
            filename: `Invoice-${txnId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`[EMAIL SERVICE] ✅ Receipt & PDF Invoice sent to ${to}`);
      sent = true;
    } catch (err) {
      lastError = err;
      console.error(`[EMAIL SERVICE] ❌ Attempt ${attempts} failed: ${err.message}`);
      
      if (attempts >= maxAttempts) {
        console.error('[EMAIL SERVICE] 🚨 All invoice email delivery attempts failed.');
        throw err; // throw to propagate failure
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
};

module.exports = sendInvoiceEmail;
