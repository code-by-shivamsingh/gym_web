const BaseOtpProvider = require('./baseOtpProvider');
const sendEmail = require('../utils/sendEmail');

/**
 * Concrete provider for sending OTP codes via Email
 */
class EmailOtpProvider extends BaseOtpProvider {
  /**
   * Send the One-Time Password via email.
   * @param {string} to - The recipient's email address
   * @param {string} otp - The 6-digit plain OTP
   * @returns {Promise<boolean>} Resolves to true on success
   */
  async sendOtp(to, otp) {
    await sendEmail({
      to,
      subject: 'Forge Gym - Password Reset Verification Code',
      otp
    });
    return true;
  }
}

module.exports = EmailOtpProvider;
