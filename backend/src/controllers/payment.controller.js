const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Lazy-initialize so env vars are available at call time, with safe fallbacks
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TFJan710onN37o';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'TE0lwJ1VFH4uDsiayOosWd8Y';
  return new Razorpay({ key_id, key_secret });
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getSettingsMap = async () => {
  const { rows } = await db.query(
    `SELECT key, value FROM system_settings 
     WHERE key IN ('premium_price', 'premium_currency', 'premium_discount', 'student_premium_price', 'student_premium_discount', 'premium_duration_months')`
  );
  const settings = {};
  rows.forEach(r => {
    settings[r.key] = r.value;
  });
  return settings;
};

const getPlanConfig = async (plan, targetCurrency = 'INR') => {
  const settings = await getSettingsMap();
  const adminCurrency = settings.premium_currency || '$';
  
  let basePrice = 0;
  let discountPct = 0;

  if (plan === 'student') {
    basePrice = parseFloat(settings.student_premium_price || '39');
    discountPct = parseFloat(settings.student_premium_discount || '40');
  } else {
    basePrice = parseFloat(settings.premium_price || '65');
    discountPct = parseFloat(settings.premium_discount || '40');
  }

  // Calculate discounted value in admin currency
  const discounted = discountPct > 0 && discountPct <= 100
    ? Math.round(basePrice * (1 - discountPct / 100))
    : basePrice;

  // Convert to checkout currency if different
  let checkoutPrice = discounted;
  const isUSDAdmin = adminCurrency === '$' || adminCurrency.toUpperCase() === 'USD';
  const isINRCheckout = targetCurrency === 'INR' || targetCurrency === '₹' || targetCurrency.toUpperCase() === 'RS';

  if (isUSDAdmin && isINRCheckout) {
    checkoutPrice = discounted * 83; // 1 USD = 83 INR
  } else if (!isUSDAdmin && !isINRCheckout) {
    checkoutPrice = discounted / 83;
  }

  return {
    amountInSubunits: Math.round(checkoutPrice * 100), // in paise or cents
    currency: targetCurrency,
    label: plan === 'student' ? 'Student Plan' : 'Teacher Plan',
    durationMonths: parseInt(settings.premium_duration_months || '12') || 12,
  };
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { plan, currency = 'INR' } = req.body;

    if (plan !== 'student' && plan !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const planConfig = await getPlanConfig(plan, currency);

    // Razorpay receipt field MUST be <= 40 characters
    const shortUserId = String(req.user?.id || 'usr').slice(0, 10);
    const order = await getRazorpay().orders.create({
      amount: planConfig.amountInSubunits,
      currency: planConfig.currency,
      receipt: `r_${shortUserId}_${Date.now().toString().slice(-8)}`,
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
    res.status(500).json({ success: false, message: err.message || err.description || 'Failed to create payment order' });
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

    if (plan !== 'student' && plan !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const planConfig = await getPlanConfig(plan);

    // Calculate expiry date based on settings duration
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + planConfig.durationMonths);

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
      message: `Successfully upgraded to ${planConfig.label}!`,
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
