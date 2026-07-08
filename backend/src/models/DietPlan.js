const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  time: {
    type: String,
    required: true
  }
});

const DietPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  meals: [MealSchema]
}, {
  timestamps: true
});

DietPlanSchema.index({ user: 1 });

module.exports = mongoose.model('DietPlan', DietPlanSchema);
