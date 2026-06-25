const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

// Default workout routines to supply if none configured
const defaultWorkoutPlan = {
  title: 'Chest & Triceps (Default Plan)',
  exercises: [
    { name: 'Bench Press', sets: 4, reps: '8-12', done: false },
    { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', done: false },
    { name: 'Chest Fly', sets: 3, reps: '12-15', done: false },
    { name: 'Tricep Pushdown', sets: 3, reps: '12-15', done: false }
  ]
};

// Default diet plan to supply if none configured
const defaultDietPlan = {
  title: 'Balanced Mass Gainer (Default Plan)',
  meals: [
    { name: 'Oatmeal & Protein Shake', calories: 600, time: '08:00 AM' },
    { name: 'Chicken Breast, Rice & Broccoli', calories: 750, time: '01:00 PM' },
    { name: 'Pre-Workout Banana & Almonds', calories: 250, time: '05:00 PM' },
    { name: 'Salmon, Sweet Potato & Asparagus', calories: 700, time: '08:30 PM' }
  ]
};

// @desc    Get workouts plan
// @route   GET /api/workouts
// @access  Private
const getWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ user: req.user.id });
    res.status(200).json({
      success: true,
      data: plan || defaultWorkoutPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get diet plan
// @route   GET /api/diet
// @access  Private
const getDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ user: req.user.id });
    res.status(200).json({
      success: true,
      data: plan || defaultDietPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getWorkoutPlan,
  getDietPlan
};
