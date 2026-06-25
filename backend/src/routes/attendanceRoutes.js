const express = require('express');
const { checkIn, checkOut, getHistory, getAdminOverview } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/history', getHistory);
router.get('/admin-overview', authorize('Admin', 'Trainer'), getAdminOverview);

module.exports = router;
