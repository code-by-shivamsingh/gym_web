const mongoose = require('mongoose');

const UserLocationTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['web', 'mobile'],
    required: true
  },
  isInside: {
    type: Boolean,
    default: false
  },
  accuracy: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

UserLocationTrackingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserLocationTracking', UserLocationTrackingSchema);
