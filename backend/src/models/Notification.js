const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title']
  },
  message: {
    type: String,
    required: [true, 'Please add notification message']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'trainer', 'alert'],
    default: 'info'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
