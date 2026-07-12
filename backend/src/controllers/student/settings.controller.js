const db = require('../../config/db');

exports.getSettings = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT key, value FROM system_settings WHERE key IN ('premium_price', 'premium_duration_months', 'premium_currency', 'premium_billing_period', 'premium_discount', 'student_premium_price', 'student_premium_discount')`
    );
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
