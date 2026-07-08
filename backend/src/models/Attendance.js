const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOut: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

AttendanceSchema.index({ user: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
