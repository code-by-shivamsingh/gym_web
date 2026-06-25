const express = require('express');
const { getDietPlan } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDietPlan);

module.exports = router;
