const mongoose = require('mongoose');

const WorkoutProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  durationDays: {
    type: Number,
    default: 7
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60'
  }
}, {
  timestamps: true,
  collection: 'WorkoutPrograms'
});

module.exports = mongoose.model('WorkoutProgram', WorkoutProgramSchema);
