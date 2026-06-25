const express = require('express');
const { downloadInvoice } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:paymentId', protect, downloadInvoice);

module.exports = router;
