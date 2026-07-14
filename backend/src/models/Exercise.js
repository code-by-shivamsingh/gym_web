const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetMuscles: [{
    type: String
  }],
  secondaryMuscles: [{
    type: String
  }],
  muscleGroup: {
    type: String,
    default: ''
  },
  equipmentRequired: {
    type: String,
    default: 'None'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  calories: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 60 // in seconds
  },
  sets: {
    type: Number,
    default: 3
  },
  reps: {
    type: String,
    default: '10'
  },
  restTime: {
    type: Number,
    default: 30 // in seconds
  },
  tips: [{
    type: String
  }],
  commonMistakes: [{
    type: String
  }],
  safetyInstructions: [{
    type: String
  }],
  instructions: [{
    type: String
  }],
  videoUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'Exercises'
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
