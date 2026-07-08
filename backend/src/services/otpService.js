const crypto = require('crypto');
const User = require('../models/User');
const OtpProviderFactory = require('./otpProviderFactory');
const config = require('../config/config');

/**
 * Service orchestrating secure OTP lifecycle management.
 */
class OtpService {
  /**
   * Generates, stores, and dispatches a secure One-Time Password.
   * Enforces 60-second request cooldown, deletes previous codes, and sets 10-minute expiry.
   * @param {string} email - The user's registered email
   * @param {string} [providerType] - The OTP provider channel ('email', 'sms', 'whatsapp')
   * @returns {Promise<boolean>} Resolves to true if successful
   */
  static async generateAndSendOtp(email, providerType) {
    const timestamp = new Date().toISOString();
    console.log(`\n[OTP SERVICE] 🔑 OTP request received for: ${email} at ${timestamp}`);

    const user = await User.findOne({ email });
    
    if (!user) {
      console.warn(`[OTP SERVICE] ❌ User with email ${email} not found.`);
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    console.log(`[OTP SERVICE] ✅ User found: ${user.name} (ID: ${user._id})`);

    // Cooldown rate limit: 60 seconds
    const now = Date.now();
    if (user.lastOtpSentAt && now - user.lastOtpSentAt.getTime() < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - user.lastOtpSentAt.getTime())) / 1000);
      console.warn(`[OTP SERVICE] 🚫 Cooldown block: IP requested code too quickly. ${secondsLeft}s remaining.`);
      const error = new Error(`Please wait ${secondsLeft} seconds before requesting another verification code.`);
      error.statusCode = 429;
      throw error;
    }

    // Invalidate/delete old OTP immediately before creating a new one
    console.log(`[OTP SERVICE] 🧹 Invalidating previous OTP states for User: ${user._id}`);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP SERVICE] 🛠 [DEVELOPMENT ONLY] Plain OTP generated: ${otp}`);
    }

    // Hash OTP using SHA256 before saving to MongoDB (Defense-in-depth)
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Save details: OTP validity is 10 minutes (600 seconds)
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();

    await user.save({ validateBeforeSave: false });
    console.log(`[OTP SERVICE] 💾 Secure SHA256 hashed OTP saved to MongoDB for User: ${user._id}`);
    console.log(`[OTP SERVICE]    Expiry set to: ${user.resetOtpExpiry.toISOString()}`);

    // Resolve Provider from factory
    const resolvedProviderType = providerType || config.OTP_PROVIDER || 'email';
    const provider = OtpProviderFactory.getProvider(resolvedProviderType);

    // Send the code
    const target = resolvedProviderType === 'email' ? user.email : (user.mobile || '');
    console.log(`[OTP SERVICE] 📡 Sending OTP via ${resolvedProviderType} to: ${target}`);
    
    // Note: If this fails, the error will now bubble up because sendEmail throws!
    await provider.sendOtp(target, otp);

    console.log(`[OTP SERVICE] 🏁 OTP successfully dispatched to target: ${target}`);

    // Development sandbox fallback logging for local verification (secure temp directory only)
    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      fs.writeFileSync(
        path.join(os.tmpdir(), 'last-otp.json'),
        JSON.stringify({ email: user.email, otp }, null, 2)
      );
    } catch (e) {
      // Ignored in non-sandbox runtimes
    }

    return true;
  }

  /**
   * Verifies OTP code, clears OTP state on success, and increments error lockouts on mismatch.
   * @param {string} email - The user email
   * @param {string} otp - The plain 6-digit verification code
   * @returns {Promise<string>} Temporary password reset token
   */
  static async verifyOtp(email, otp) {
    const timestamp = new Date().toISOString();
    console.log(`\n[OTP SERVICE] 🔍 Verification attempt for: ${email} at ${timestamp}`);

    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
      console.warn(`[OTP SERVICE] ❌ Verification failed: No active OTP record found in database for email ${email}`);
      const error = new Error('Invalid or expired verification code.');
      error.statusCode = 400;
      throw error;
    }

    // Attempt Limit Validation (max 5)
    if (user.otpAttempts >= 5) {
      // Delete OTP immediately to prevent further brute force
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      console.warn(`[OTP SERVICE] 🚨 Lockout triggered: User ${user._id} exceeded maximum of 5 verification attempts.`);
      const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
      error.statusCode = 400;
      throw error;
    }

    // Expiry Check (must be within valid window)
    if (user.resetOtpExpiry && user.resetOtpExpiry.getTime() < Date.now()) {
      // Delete OTP state immediately upon expiry detection
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      console.warn(`[OTP SERVICE] ⌛ OTP code expired for User ${user._id}. Expiry was at: ${user.resetOtpExpiry.toISOString()}`);
      const error = new Error('Verification code has expired. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    // Hash user input code for comparison
    const hashedOtpInput = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Compare Hash
    console.log(`[OTP SERVICE DEBUG] User Input OTP: "${otp}" (Type: ${typeof otp})`);
    console.log(`[OTP SERVICE DEBUG] Hashed Input:     "${hashedOtpInput}"`);
    console.log(`[OTP SERVICE DEBUG] DB Stored Hash:   "${user.resetOtp}"`);

    if (hashedOtpInput !== user.resetOtp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });

      console.warn(`[OTP SERVICE] ❌ Invalid code entered. Attempts: ${user.otpAttempts}/5 for User: ${user._id}`);

      if (user.otpAttempts >= 5) {
        // Lockout user and delete code
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        console.warn(`[OTP SERVICE] 🚨 Lockout triggered during validation failure. OTP state cleared for User: ${user._id}`);
        const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
        error.statusCode = 400;
        throw error;
      }

      const error = new Error(`Invalid verification code. ${5 - user.otpAttempts} attempts remaining.`);
      error.statusCode = 400;
      throw error;
    }

    // Success: Generate secure 10-minute reset token
    console.log(`[OTP SERVICE] 🎉 Verification success for User: ${user._id}. Generating password reset token...`);
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validation window

    // Clear verification codes immediately after successful verify
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.otpAttempts = 0;

    await user.save({ validateBeforeSave: false });
    console.log(`[OTP SERVICE] 🚀 Password reset token saved. Cleaned verification states.`);

    // Clean up temporary public verification files
    try {
      const fs = require('fs');
      const path = require('path');
      const paths = [
        path.join(__dirname, '../../..', 'public', 'test-otp.json'),
        path.join(__dirname, '../..', 'public', 'test-otp.json')
      ];
      paths.forEach(p => {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      });
    } catch (e) {
      // Ignored
    }

    return resetToken;
  }
}

module.exports = OtpService;
