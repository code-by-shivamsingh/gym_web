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
    enum: ['Basic', 'Silver', 'Gold', 'Premium']
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Expired'
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

MemberSchema.index({ user: 1 });
MemberSchema.index({ trainer: 1 });

module.exports = mongoose.model('Member', MemberSchema);
