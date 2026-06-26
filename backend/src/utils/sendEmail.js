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

const sendEmail = async ({ to, subject, otp }) => {
  // ── HTML Email Template ─────────────────────────────────────────────────────
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
            <div class="expiry-badge">⏱ Valid for 59 seconds</div>
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

  // ── Always log to terminal (dev reference) ──────────────────────────────────
  console.log('\n' + '─'.repeat(55));
  console.log('[OTP DISPATCH]');
  console.log(`  To:   ${to}`);
  console.log(`  OTP:  \x1b[33m\x1b[1m${otp}\x1b[0m  (valid 59 seconds)`);
  console.log('─'.repeat(55));

  // ── Check for SMTP credentials ──────────────────────────────────────────────
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpService = (process.env.SMTP_SERVICE || '').trim();
  const smtpHost = (process.env.SMTP_HOST || '').trim();

  const hasSmtpConfig = smtpUser && smtpPass && (smtpService || smtpHost);

  if (!hasSmtpConfig) {
    console.log('[EMAIL] ⚠️  No SMTP credentials set in .env → using terminal fallback only.');
    console.log('[EMAIL]    Set SMTP_SERVICE, SMTP_USER, SMTP_PASS in .env to enable Gmail delivery.\n');
    return;
  }

  // ── Build nodemailer transporter ────────────────────────────────────────────
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    console.error('[EMAIL] ❌ nodemailer module not found! Run: npm install nodemailer --prefix backend\n');
    return;
  }

  const transportConfig = {
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,  // Allow self-signed certs in dev
    },
  };

  if (smtpService) {
    // Use shorthand service name (e.g. "gmail" → auto-configures host/port/security)
    transportConfig.service = smtpService;
  } else {
    // Manual host configuration
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    transportConfig.host = smtpHost;
    transportConfig.port = port;
    transportConfig.secure = port === 465;  // true for SSL, false for STARTTLS
  }

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    // Verify SMTP connection before sending
    await transporter.verify();
    console.log('[EMAIL] ✅ SMTP connection verified.');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Forge Gym Security" <${smtpUser}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`[EMAIL] ✅ OTP email successfully delivered to ${to}\n`);
  } catch (err) {
    console.error('[EMAIL] ❌ SMTP send failed:');
    console.error('  Code:', err.code);
    console.error('  Message:', err.message);

    // Specific Gmail error guidance
    if (err.code === 'EAUTH') {
      console.error('\n[EMAIL FIX] Gmail auth failed. Check these:');
      console.error('  1. SMTP_USER must be your full Gmail address (e.g. you@gmail.com)');
      console.error('  2. SMTP_PASS must be an App Password (NOT your Gmail login password)');
      console.error('  3. Generate one at: https://myaccount.google.com/apppasswords');
      console.error('  4. 2-Factor Authentication must be ENABLED on your Gmail account\n');
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      console.error('\n[EMAIL FIX] Connection error. Check:');
      console.error('  1. SMTP_SERVICE=gmail is set correctly');
      console.error('  2. Your firewall/antivirus is not blocking port 587\n');
    } else if (err.responseCode === 535) {
      console.error('\n[EMAIL FIX] Username/Password incorrect. Use a Gmail App Password:\n');
      console.error('  https://myaccount.google.com/apppasswords\n');
    }

    // Do NOT throw — OTP is already printed to terminal as fallback
    console.log('[EMAIL] ⚠️  Email failed but OTP was logged to terminal above.\n');
  }
};

module.exports = sendEmail;
