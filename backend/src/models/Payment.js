const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  plan: {
    type: String,
    enum: ['Basic', 'Silver', 'Gold', 'Premium'],
    default: 'Basic'
  },
  processed: {
    type: Boolean,
    default: false
  },
  method: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    default: ''
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    default: ''
  },
  invoiceNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
