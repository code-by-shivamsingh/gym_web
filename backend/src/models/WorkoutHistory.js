const mongoose = require('mongoose');

const WorkoutHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutProgram',
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  completionPercentage: {
    type: Number,
    default: 100
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'WorkoutHistory'
});

WorkoutHistorySchema.index({ userId: 1, programId: 1, dayNumber: 1 });

module.exports = mongoose.model('WorkoutHistory', WorkoutHistorySchema);
