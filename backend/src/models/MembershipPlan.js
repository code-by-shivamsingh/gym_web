const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
