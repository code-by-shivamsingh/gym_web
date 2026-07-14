const mongoose = require('mongoose');

const WorkoutProgressSchema = new mongoose.Schema({
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
  currentDay: {
    type: Number,
    default: 1
  },
  unlockedDay: {
    type: Number,
    default: 1
  },
  completedExercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  completedDays: [{
    type: Number
  }],
  unlockedDays: [{
    type: Number,
    default: [1]
  }],
  percentage: {
    type: Number,
    default: 0
  },
  lastActiveVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'WorkoutProgress'
});

WorkoutProgressSchema.index({ userId: 1, programId: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutProgress', WorkoutProgressSchema);
