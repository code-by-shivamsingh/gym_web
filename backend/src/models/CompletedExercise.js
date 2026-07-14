const mongoose = require('mongoose');

const CompletedExerciseSchema = new mongoose.Schema({
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
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'CompletedExercises'
});

CompletedExerciseSchema.index({ userId: 1, programId: 1, dayNumber: 1, exerciseId: 1 });

module.exports = mongoose.model('CompletedExercise', CompletedExerciseSchema);
