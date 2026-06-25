const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('Admin'), updateSettings);

module.exports = router;
