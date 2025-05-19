// backend/routes/payments.js
const express = require('express');
const { 
  getSubscriptionStatus, 
  createPaymentIntent,
  createCheckoutSession,
  confirmCheckoutSession,
  upgradeAccount,
  handleWebhook,
  cancelSubscription
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Webhook endpoint needs raw body and no authentication
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Apply authentication to all other routes
router.use(protect);

// Regular user routes
router.get('/status', getSubscriptionStatus);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/confirm-checkout-session', confirmCheckoutSession);
router.post('/upgrade', upgradeAccount);
router.post('/cancel', cancelSubscription);

module.exports = router;