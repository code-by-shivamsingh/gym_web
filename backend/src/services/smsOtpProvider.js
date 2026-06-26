const BaseOtpProvider = require('./baseOtpProvider');

/**
 * Concrete provider placeholder for sending OTP codes via SMS.
 * Ready to be connected to SMS API gateways like Twilio or AWS SNS.
 */
class SmsOtpProvider extends BaseOtpProvider {
  /**
   * Send the One-Time Password via SMS.
   * @param {string} to - The recipient's mobile number
   * @param {string} otp - The 6-digit plain OTP
   * @returns {Promise<boolean>} Resolves to true on success
   */
  async sendOtp(to, otp) {
    console.log(`[SMS OTP PROVIDER] Mock sending verification code ${otp} to mobile: ${to}`);
    // Future integrations (e.g. Twilio Client) can be written here directly
    return true;
  }
}

module.exports = SmsOtpProvider;
