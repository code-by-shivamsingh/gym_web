/**
 * Base abstract class for OTP transmission providers.
 * All concrete providers (Email, SMS, WhatsApp) must extend this class and implement sendOtp.
 */
class BaseOtpProvider {
  /**
   * Send the One-Time Password to the user.
   * @param {string} to - The recipient address (email, phone number, etc.)
   * @param {string} otp - The 6-digit plain OTP
   * @returns {Promise<boolean>} Resolves to true on success
   */
  async sendOtp(to, otp) {
    throw new Error("sendOtp method must be implemented by the provider");
  }
}

module.exports = BaseOtpProvider;
