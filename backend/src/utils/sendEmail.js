/**
 * sendEmail.js
 * Utility to send OTP emails via Nodemailer / Gmail SMTP.
 *
 * To enable real delivery, set these in .env:
 *   SMTP_SERVICE=gmail
 *   SMTP_USER=your.email@gmail.com
 *   SMTP_PASS=xxxx xxxx xxxx xxxx   (Gmail App Password, NOT your regular password)
 *
 * If credentials are missing, OTP is printed to the backend terminal (dev fallback).
 */

const config = require('../config/config');

/**
 * Dispatches an email containing the security OTP.
 * Catches configuration gaps and network timeouts, and raises failures so callers can react.
 * 
 * @param {Object} payload - Email parameters
 * @param {string} payload.to - Recipient email address
 * @param {string} payload.subject - Email subject line
 * @param {string} payload.otp - 6-digit plain OTP code
 */
const sendEmail = async ({ to, subject, otp }) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[EMAIL SERVICE] 📨 Received dispatch request at ${timestamp}`);
  console.log(`[EMAIL SERVICE]    Recipient: ${to}`);
  console.log(`[EMAIL SERVICE]    Subject:   ${subject}`);

  // ── HTML Email Template (Forge Gym Branded & Responsive) ─────────────────────
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your OTP - Forge Gym</title>
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
        }
        .logo {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #eab308;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .logo span { color: #ffffff; }
        .tagline { font-size: 12px; color: #71717a; letter-spacing: 1px; margin-bottom: 30px; }
        h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px; }
        p { font-size: 15px; line-height: 1.7; color: #a1a1aa; margin-bottom: 20px; }
        .otp-container {
          background: linear-gradient(135deg, #09090b, #18181b);
          border: 2px dashed #eab308;
          border-radius: 18px;
          padding: 24px 20px;
          margin: 30px 0;
          letter-spacing: 8px;
        }
        .otp-label { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .otp-code {
          font-size: 42px;
          font-weight: 900;
          color: #eab308;
          font-family: 'Courier New', Courier, monospace;
        }
        .expiry-badge {
          display: inline-block;
          background: #1c1917;
          border: 1px solid #44403c;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 12px;
          color: #d97706;
          margin-top: 12px;
        }
        .divider { border: none; border-top: 1px solid #27272a; margin: 28px 0; }
        .warning { font-size: 12px; color: #71717a; }
        .footer { font-size: 11px; color: #3f3f46; margin-top: 28px; }
        .highlight { color: #eab308; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">FORGE<span>GYM</span></div>
          <div class="tagline">STRENGTH • DISCIPLINE • RESULTS</div>

          <h1>🔐 Verify Your Identity</h1>
          <p>
            Use the 6-digit One-Time Password below to reset your
            <span class="highlight">Forge Gym</span> account password.
          </p>

          <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-badge">⏱ Valid for 10 minutes</div>
          </div>

          <p>
            If you did not request this, you can safely ignore this email.
            Your password will remain unchanged.
          </p>

          <hr class="divider">

          <div class="warning">
            ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone,
            including Forge Gym staff. We will never ask for it.
          </div>

          <div class="footer">
            © 2026 FORGE Fitness — Gwalior, Madhya Pradesh, India<br>
            This is an automated message. Please do not reply.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // ── Always log plain text fallback to backend terminal (development aid) ──────
  console.log('\n' + '─'.repeat(55));
  console.log('[OTP DISPATCH TERMINAL LOG]');
  console.log(`  To:   ${to}`);
  console.log(`  OTP:  \x1b[33m\x1b[1m${otp}\x1b[0m  (valid 10 minutes)`);
  console.log('─'.repeat(55) + '\n');

  // ── Validate SMTP config variables ──────────────────────────────────────────
  const smtpUser = (config.SMTP_USER || '').trim();
  const smtpPass = (config.SMTP_PASS || '').trim();
  const smtpService = (config.SMTP_SERVICE || '').trim();
  const smtpHost = (config.SMTP_HOST || '').trim();

  const hasSmtpConfig = smtpUser && smtpPass && (smtpService || smtpHost);

  if (!hasSmtpConfig) {
    console.warn('[EMAIL SERVICE] ⚠️ Missing SMTP configuration in .env. Falling back to terminal log only.');
    return;
  }

  // Load nodemailer
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.error('[EMAIL SERVICE] ❌ nodemailer module not found! Run: npm install nodemailer');
    throw new Error('Nodemailer module is not installed.');
  }

  // Clean spaces from Gmail App Password (Google generates passwords like 'xxxx xxxx xxxx xxxx')
  const cleanPass = smtpPass.replace(/\s+/g, '');

  // ── Transporter Setup (Supporting service-based and host-based connections) ──
  const transportConfig = {
    auth: {
      user: smtpUser,
      pass: cleanPass,
    },
    // Enforce TLS connection settings
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 5000,
    socketTimeout: 15000
  };

  // Gmail special default settings for highest delivery reliability
  if (smtpService.toLowerCase() === 'gmail') {
    transportConfig.host = 'smtp.gmail.com';
    transportConfig.port = 465;
    transportConfig.secure = true; // Use SSL on port 465
  } else if (smtpService) {
    transportConfig.service = smtpService;
  } else {
    const port = parseInt(config.SMTP_PORT || '587', 10);
    transportConfig.host = smtpHost;
    transportConfig.port = port;
    transportConfig.secure = port === 465;
  }

  console.log(`[EMAIL SERVICE] ⚙️ Building SMTP transporter:`);
  console.log(`  Host:   ${transportConfig.host || 'Service: ' + transportConfig.service}`);
  console.log(`  Port:   ${transportConfig.port || 'default'}`);
  console.log(`  Secure: ${transportConfig.secure || 'false'}`);
  console.log(`  User:   ${smtpUser}`);

  const transporter = nodemailer.createTransport(transportConfig);

  let attempts = 0;
  const maxAttempts = 3;
  let sent = false;
  let lastError = null;

  while (attempts < maxAttempts && !sent) {
    try {
      attempts++;
      console.log(`[EMAIL SERVICE] ⏳ Dispatching mail (Attempt ${attempts}/${maxAttempts})...`);
      
      // Perform SMTP connection handshake check on the first attempt
      if (attempts === 1) {
        console.log('[EMAIL SERVICE] 🔌 Verifying SMTP connection handshake...');
        await transporter.verify();
        console.log('[EMAIL SERVICE] ✅ SMTP connection verified successfully.');
      }

      const mailOptions = {
        from: config.SMTP_FROM || `"Forge Gym Security" <${smtpUser}>`,
        to,
        subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);

      // Detailed delivery logging
      console.log(`[EMAIL SERVICE] ✅ OTP email successfully delivered!`);
      console.log(`  Message ID:   ${info.messageId}`);
      console.log(`  Response:     ${info.response}`);
      console.log(`  Accepted:     ${JSON.stringify(info.accepted)}`);
      console.log(`  Rejected:     ${JSON.stringify(info.rejected)}`);
      console.log(`  Envelope:     ${JSON.stringify(info.envelope)}`);
      
      sent = true;
    } catch (err) {
      lastError = err;
      console.error(`[EMAIL SERVICE] ❌ Attempt ${attempts} failed: ${err.message}`);
      if (err.stack) {
        console.error(`[EMAIL SERVICE] 📋 Stack Trace:\n${err.stack}`);
      }

      if (attempts >= maxAttempts) {
        console.error('[EMAIL SERVICE] 🚨 All mail delivery attempts failed.');
        
        // Output detailed diagnosis information
        if (err.code === 'EAUTH' || err.responseCode === 535) {
          console.error('\n======================================================');
          console.error('❌ GMAIL AUTHENTICATION DIAGNOSIS FAILED (535)');
          console.error('======================================================');
          console.error(`1. Check if SMTP_USER (${smtpUser}) is spelling correct.`);
          console.error(`2. Confirm SMTP_PASS is a 16-character App Password (not standard login password).`);
          console.error(`3. Confirm 2-Step Verification is active on that Google account.`);
          console.error(`4. Generate new App Password at: https://myaccount.google.com/apppasswords`);
          console.error('======================================================\n');
        }
        
        // Critical fix: Throw the error so it propagates to authController and API returns 500
        throw err;
      } else {
        const retryDelay = 2000;
        console.log(`[EMAIL SERVICE] ⏳ Waiting ${retryDelay / 1000} seconds before retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
};

module.exports = sendEmail;
