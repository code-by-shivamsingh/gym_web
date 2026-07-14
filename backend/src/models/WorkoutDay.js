const mongoose = require('mongoose');

const WorkoutDaySchema = new mongoose.Schema({
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutProgram',
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  dayName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }]
}, {
  timestamps: true,
  collection: 'WorkoutDays'
});

WorkoutDaySchema.index({ programId: 1, dayNumber: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutDay', WorkoutDaySchema);
