const mongoose = require('mongoose');

const RateLimitSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  hits: {
    type: Number,
    default: 1
  },
  resetTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index to quickly query and update IP hit counts for specific endpoints
RateLimitSchema.index({ ip: 1, endpoint: 1 }, { unique: true });

// TTL Index to automatically delete documents once resetTime is reached
RateLimitSchema.index({ resetTime: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RateLimit', RateLimitSchema);
