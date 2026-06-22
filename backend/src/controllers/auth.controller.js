const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

const stripHash = ({ password_hash, ...user }) => user;

// ─── REGISTER ─────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role = 'student' } = req.body;

    if (!email || !password || !full_name)
      return res.status(400).json({ success: false, message: 'email, password and full_name are required' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    if (!['admin', 'student'].includes(role))
      return res.status(400).json({ success: false, message: 'role must be admin or student' });

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email.toLowerCase().trim(), hash, full_name.trim(), role]
    );

    const user = stripHash(rows[0]);
    const accessToken  = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await db.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    res.status(201).json({ success: true, accessToken, refreshToken, user }); // ← inside try
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    if (err.code === '23505')
      return res.status(409).json({ success: false, message: 'Email already registered' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'email and password are required' });

    const { rows } = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const found = rows[0];
    // Run compare even if user not found to prevent timing attacks
    const dummyHash = '$2a$12$invalidhashfortimingprotection000000000000000000000';
    const isValid   = await bcrypt.compare(password, found?.password_hash ?? dummyHash);

    if (!found || !isValid)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = stripHash(found);
    const accessToken  = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await db.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    res.json({ success: true, accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ME ───────────────────────────────────────────────────────────────────────

exports.me = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, email, full_name, role, is_premium,
              premium_expires_at, avatar_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ success: false, message: 'refreshToken is required' });

    // Verify signature first
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Check token matches what we stored (rotation invalidation)
    const { rows } = await db.query(
      `SELECT id, email, role, is_premium, refresh_token FROM users WHERE id = $1`,
      [decoded.id]
    );
    const user = rows[0];
    if (!user || user.refresh_token !== refreshToken)
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked' });

    // Issue new pair (token rotation)
    const newAccessToken  = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    await db.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [newRefreshToken, user.id]
    );

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    // Clear stored refresh token so the old pair is dead immediately
    await db.query(
      `UPDATE users SET refresh_token = NULL WHERE id = $1`,
      [req.user.id]
    );
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};