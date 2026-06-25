const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Please add a member name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    trim: true
  },
  mobile: {
    type: String,
    default: ''
  },
  plan: {
    type: String,
    default: 'Basic',
    enum: ['Basic', 'Premium', 'Elite']
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', MemberSchema);
