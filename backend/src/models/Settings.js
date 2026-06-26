const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: true,
    default: 'Forge Gym'
  },
  address: {
    type: String,
    required: true,
    default: 'Gwalior, Madhya Pradesh (M.P.), India'
  },
  mobile: {
    type: String,
    required: true,
    default: '+1234567890'
  },
  whatsapp: {
    type: String,
    required: true,
    default: '+919876543210'
  },
  taxRate: {
    type: Number,
    required: true,
    default: 18
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', SettingsSchema);
