const express = require('express');
const { 
  getPaymentHistory, 
  createOrder, 
  verifyPayment, 
  getPlans,
  renderSandboxCheckout,
  handleSandboxAction,
  cancelPayment,
  handleWebhook,
  simulatePayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes for Sandbox browser checkout and Webhooks (No JWT required)
router.get('/sandbox-checkout', renderSandboxCheckout);
router.post('/sandbox-action', handleSandboxAction);
router.post('/webhook', handleWebhook);

// Protected routes (JWT required)
router.use(protect);

router.get('/history', getPaymentHistory);
router.get('/plans', getPlans);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelPayment);
router.post('/developer-simulate', simulatePayment);

module.exports = router;
