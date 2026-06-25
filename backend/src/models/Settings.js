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
    default: '123 Strength Ave, Fitness City'
  },
  mobile: {
    type: String,
    required: true,
    default: '+1234567890'
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
