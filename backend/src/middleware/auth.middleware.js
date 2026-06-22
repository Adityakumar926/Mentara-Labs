const jwt = require('jsonwebtoken');
const db  = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];

    // 2. Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Token expired — please refresh'
        : 'Invalid token';
      return res.status(401).json({ success: false, message });
    }

    // 3. Check user still exists
    const { rows } = await db.query(
      `SELECT id, email, role, is_premium, premium_expires_at
       FROM users WHERE id = $1`,
      [decoded.id]
    );
    if (!rows[0])
      return res.status(401).json({ success: false, message: 'User no longer exists' });

    // 4. Auto-expire premium if past deadline
    const user = rows[0];
    if (user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) {
      await db.query(
        `UPDATE users SET is_premium = false WHERE id = $1`, [user.id]
      );
      user.is_premium = false;
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};