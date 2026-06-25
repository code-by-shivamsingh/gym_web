const express = require('express');
const { getWorkoutPlan } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWorkoutPlan);

module.exports = router;
