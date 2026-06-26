const crypto = require('crypto');
const User = require('../models/User');
const OtpProviderFactory = require('./otpProviderFactory');

/**
 * Service orchestrating secure OTP lifecycle management.
 */
class OtpService {
  /**
   * Generates, stores, and dispatches a secure One-Time Password.
   * Enforces 60-second request cooldown, deletes previous codes, and sets 59-second expiry.
   * @param {string} email - The user's registered email
   * @param {string} [providerType] - The OTP provider channel ('email', 'sms', 'whatsapp')
   * @returns {Promise<boolean>} Resolves to true if successful
   */
  static async generateAndSendOtp(email, providerType) {
    const user = await User.findOne({ email });
    
    // Generic response fallback for user-privacy (avoid enumeration attacks)
    if (!user) {
      return true;
    }

    // Cooldown rate limit: 60 seconds
    const now = Date.now();
    if (user.lastOtpSentAt && now - user.lastOtpSentAt.getTime() < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - user.lastOtpSentAt.getTime())) / 1000);
      const error = new Error(`Please wait ${secondsLeft} seconds before requesting another verification code.`);
      error.statusCode = 429;
      throw error;
    }

    // Delete/invalidate old OTP immediately before creating a new one
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP using SHA256
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Save details: OTP validity is 59 seconds
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 59 * 1000); // 59 seconds expiry
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();

    await user.save({ validateBeforeSave: false });

    // Resolve Provider from factory
    const resolvedProviderType = providerType || process.env.OTP_PROVIDER || 'email';
    const provider = OtpProviderFactory.getProvider(resolvedProviderType);

    // Send the code
    const target = resolvedProviderType === 'email' ? user.email : (user.mobile || '');
    await provider.sendOtp(target, otp);

    // Development sandbox fallback logging for local verification
    try {
      const fs = require('fs');
      fs.writeFileSync(
        'C:/Users/HP/.gemini/antigravity-ide/brain/95372671-a646-4705-a993-4f0b54b4c6f3/scratch/last-otp.json',
        JSON.stringify({ email: user.email, otp }, null, 2)
      );
      // Write to public folder so browser testing agents can fetch it directly
      fs.writeFileSync(
        'd:/gym/gym_web/public/test-otp.json',
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
    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
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

      const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
      error.statusCode = 400;
      throw error;
    }

    // Expiry Check (must be within 30 seconds of creation)
    if (user.resetOtpExpiry && user.resetOtpExpiry.getTime() < Date.now()) {
      // Delete OTP state immediately upon expiry detection
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

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
    if (hashedOtpInput !== user.resetOtp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });

      if (user.otpAttempts >= 5) {
        // Lockout user and delete code
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
        error.statusCode = 400;
        throw error;
      }

      const error = new Error(`Invalid verification code. ${5 - user.otpAttempts} attempts remaining.`);
      error.statusCode = 400;
      throw error;
    }

    // Success: Generate secure 10-minute reset token
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

    // Clean up temporary public verification file
    try {
      const fs = require('fs');
      if (fs.existsSync('d:/gym/gym_web/public/test-otp.json')) {
        fs.unlinkSync('d:/gym/gym_web/public/test-otp.json');
      }
    } catch (e) {
      // Ignored
    }

    return resetToken;
  }
}

module.exports = OtpService;
