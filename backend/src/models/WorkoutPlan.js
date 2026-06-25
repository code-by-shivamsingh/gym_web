const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  reps: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  }
});

const WorkoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  exercises: [ExerciseSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
