const mongoose = require('mongoose');

const GymLocationSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: true,
    default: 'Forge Gym'
  },
  latitude: {
    type: Number,
    required: true,
    default: 26.2669994 // Default coordinates (Airport Rd, Gwalior)
  },
  longitude: {
    type: Number,
    required: true,
    default: 78.2169687
  },
  allowedRadius: {
    type: Number,
    required: true,
    default: 50 // In meters
  },
  radius: {
    type: Number,
    default: 50
  },
  address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware hook to synchronize allowedRadius and radius before saving
GymLocationSchema.pre('save', function(next) {
  if (this.radius !== undefined) {
    this.allowedRadius = this.radius;
  } else if (this.allowedRadius !== undefined) {
    this.radius = this.allowedRadius;
  }
  next();
});

module.exports = mongoose.model('GymLocation', GymLocationSchema);
