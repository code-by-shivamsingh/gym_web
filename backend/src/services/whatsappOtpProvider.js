const BaseOtpProvider = require('./baseOtpProvider');

/**
 * Concrete provider placeholder for sending OTP codes via WhatsApp.
 * Ready to be connected to APIs like Twilio WhatsApp or Meta Cloud API.
 */
class WhatsAppOtpProvider extends BaseOtpProvider {
  /**
   * Send the One-Time Password via WhatsApp.
   * @param {string} to - The recipient's mobile number
   * @param {string} otp - The 6-digit plain OTP
   * @returns {Promise<boolean>} Resolves to true on success
   */
  async sendOtp(to, otp) {
    console.log(`[WHATSAPP OTP PROVIDER] Mock sending verification code ${otp} to WhatsApp mobile: ${to}`);
    // Future integrations (e.g. Twilio WhatsApp Client) can be written here directly
    return true;
  }
}

module.exports = WhatsAppOtpProvider;
