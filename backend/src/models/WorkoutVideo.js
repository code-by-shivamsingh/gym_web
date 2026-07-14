const mongoose = require('mongoose');

const WorkoutVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true // e.g. Cardio, Chest, Strength, Recovery
  },
  muscleGroup: {
    type: String,
    required: true // e.g. Chest, Back, Legs, Shoulders, Arms, Full Body, Rest
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  day: {
    type: String,
    required: true // e.g. Day 1 - Day 7 for beginners, Monday - Sunday for weekly plan
  },
  duration: {
    type: Number,
    required: true // In minutes
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60'
  },
  description: {
    type: String,
    default: ''
  },
  caloriesBurn: {
    type: Number,
    default: 0
  },
  equipmentRequired: {
    type: String,
    default: 'None'
  }
}, {
  timestamps: true
});

WorkoutVideoSchema.index({ day: 1, level: 1 });

module.exports = mongoose.model('WorkoutVideo', WorkoutVideoSchema);
