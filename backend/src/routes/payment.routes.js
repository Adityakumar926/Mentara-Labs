const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createOrder,
  verifyPayment,
  getSubscription,
} = require('../controllers/payment.controller');

// All payment routes require authentication
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/subscription', protect, getSubscription);

module.exports = router;
