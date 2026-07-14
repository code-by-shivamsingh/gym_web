const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymLocation',
    default: null
  },
  checkIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOut: {
    type: Date,
    default: null
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  totalDuration: {
    type: Number,
    default: null // in minutes
  },
  status: {
    type: String,
    enum: ['Present', 'Completed', 'Absent'],
    default: 'Present'
  },
  source: {
    type: String,
    default: 'Automatic GPS'
  }
}, {
  timestamps: true
});

AttendanceSchema.index({ user: 1 });
AttendanceSchema.index({ checkIn: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
