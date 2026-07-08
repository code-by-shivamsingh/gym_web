const express = require('express');
const {
  register,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// OTP generation rate limit: max 3 requests per IP per minute
const otpRequestLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many OTP requests from this IP. Please try again after 60 seconds.'
});

// OTP verification rate limit: max 5 requests per IP per minute (prevents brute forcing)
const otpVerifyLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many OTP verification attempts. Please try again after 60 seconds.'
});

// Login rate limit: max 10 requests per IP per 15 minutes
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

// Registration rate limit: max 5 requests per IP per hour
const registerLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration requests. Please try again after 1 hour.'
});

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/resend-otp', otpRequestLimiter, forgotPassword);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/reset-password', otpVerifyLimiter, resetPassword);
router.post('/change-password', protect, changePassword);

router.get('/debug-users', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}, 'name email role resetOtp resetOtpExpiry otpAttempts lastOtpSentAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
