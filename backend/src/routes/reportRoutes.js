const express = require('express');
const { getReportsSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, authorize('Admin'), getReportsSummary);

module.exports = router;
