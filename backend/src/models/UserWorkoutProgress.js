const mongoose = require('mongoose');

const UserWorkoutProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutVideo',
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

UserWorkoutProgressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('UserWorkoutProgress', UserWorkoutProgressSchema);
