const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Lazy-initialize so env vars are available at call time, with safe fallbacks
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  return new Razorpay({ key_id, key_secret });
};

// Plan config
const PLANS = {
  student: {
    amount: 2500, // ₹2500 in paise (₹25 * 100)
    currency: 'INR',
    label: 'Student Plan',
    durationDays: 30,
  },
  teacher: {
    amount: 3900, // ₹3900 in paise (₹39 * 100)
    currency: 'INR',
    label: 'Teacher Plan',
    durationDays: 30,
  },
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const planConfig = PLANS[plan];

    const order = await getRazorpay().orders.create({
      amount: planConfig.amount,
      currency: planConfig.currency,
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan: plan,
      },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
        planLabel: planConfig.label,
      },
    });
  } catch (err) {
    console.error('[createOrder Error]', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + PLANS[plan].durationDays);

    // Update user's premium status in DB
    const { rows } = await db.query(
      `UPDATE users 
       SET is_premium = true,
           premium_expires_at = $1,
           plan = $2,
           razorpay_order_id = $3,
           razorpay_payment_id = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, full_name, role, is_premium, premium_expires_at, plan, avatar_url, curriculum_id, class_id, onboarded, created_at`,
      [expiryDate, plan, razorpay_order_id, razorpay_payment_id, req.user.id]
    );

    res.json({
      success: true,
      message: `Successfully upgraded to ${PLANS[plan].label}!`,
      user: rows[0],
    });
  } catch (err) {
    console.error('[verifyPayment Error]', err);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

// ─── GET SUBSCRIPTION STATUS ──────────────────────────────────────────────────
exports.getSubscription = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, email, full_name, role, is_premium, premium_expires_at, plan
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });

    const user = rows[0];
    // Check if premium has expired
    if (user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) {
      await db.query(
        `UPDATE users SET is_premium = false, plan = 'explorer' WHERE id = $1`,
        [req.user.id]
      );
      user.is_premium = false;
      user.plan = 'explorer';
    }

    res.json({ success: true, subscription: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
