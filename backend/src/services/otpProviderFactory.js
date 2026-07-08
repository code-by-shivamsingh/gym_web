const EmailOtpProvider = require('./emailOtpProvider');
const SmsOtpProvider = require('./smsOtpProvider');
const WhatsAppOtpProvider = require('./whatsappOtpProvider');
const config = require('../config/config');

/**
 * Factory class to instantiate the configured OTP dispatch provider.
 */
class OtpProviderFactory {
  /**
   * Resolve the active OTP provider.
   * @param {string} [type] - Optional override provider type
   * @returns {BaseOtpProvider} The matching provider instance
   */
  static getProvider(type) {
    const providerType = (type || config.OTP_PROVIDER || 'email').toLowerCase();
    switch (providerType) {
      case 'email':
        return new EmailOtpProvider();
      case 'sms':
        return new SmsOtpProvider();
      case 'whatsapp':
        return new WhatsAppOtpProvider();
      default:
        console.warn(`[OTP FACTORY WARNING] Unknown provider type "${providerType}". Defaulting to email.`);
        return new EmailOtpProvider();
    }
  }
}

module.exports = OtpProviderFactory;
