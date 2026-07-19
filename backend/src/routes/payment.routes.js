const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  createOrder,
  verifyPayment,
  getSubscription,
} = require('../controllers/payment.controller');

// All payment routes require authentication
router.post('/create-order', authenticateToken, createOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/subscription', authenticateToken, getSubscription);

module.exports = router;
