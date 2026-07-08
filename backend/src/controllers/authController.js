const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Member = require('../models/Member');
const config = require('../config/config');
const { createNotificationHelper } = require('./notificationController');
const sendEmail = require('../utils/sendEmail');
const OtpService = require('../services/otpService');


// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Force role to Member on public registration to prevent privilege escalation
    const userRole = 'Member';
    const user = await User.create({
      name,
      email,
      mobile: mobile || '',
      password,
      role: userRole
    });

    // If user is a member, create a Member record
    if (userRole === 'Member') {
      await Member.create({
        user: user._id,
        name,
        email,
        mobile: mobile || '',
        plan: req.body.plan || 'Basic',
        status: 'Expired',
        expiryDate: null
      });
    }

    // Trigger welcome notification
    await createNotificationHelper(
      user._id,
      'Welcome to Forge Gym! 🎉',
      'Get ready to unleash the beast! Check out your custom workout and diet plans in your dashboard.',
      'info'
    );

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const genericResponse = {
      success: true,
      message: 'If the email is registered, a secure 6-digit OTP has been sent. Please check your inbox.'
    };

    try {
      await OtpService.generateAndSendOtp(email);
    } catch (err) {
      if (err.statusCode === 429) {
        return res.status(429).json({ success: false, message: err.message });
      }
      console.error("[OTP DISPATCH ERROR]", err);
      
      // Check if SMTP configuration or network issue occurred
      if (err.code === 'EAUTH' || err.responseCode === 535 || err.message.includes('auth') || err.message.includes('SMTP')) {
        return res.status(500).json({
          success: false,
          message: 'Mail delivery authentication failed. Check server SMTP credentials.'
        });
      }
      
      return res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    try {
      const resetToken = await OtpService.verifyOtp(email, otp);
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token: resetToken
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Verification failed'
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({ success: false, message: 'Please provide new password and verification token' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Reset password (triggers User Schema pre-save bcrypt hash)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword
};

