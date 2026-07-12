const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    if (!['admin', 'student', 'teacher'].includes(role))
      return res.status(400).json({ success: false, message: 'role must be admin, student or teacher' });

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
              premium_expires_at, avatar_url, curriculum_id, class_id, onboarded, created_at
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

// Onboarding selection endpoint
exports.onboard = async (req, res) => {
  try {
    const { curriculum_id, class_id } = req.body;
    if (!curriculum_id || !class_id)
      return res.status(400).json({ success: false, message: 'curriculum_id and class_id are required' });

    const { rows } = await db.query(
      `UPDATE users
       SET curriculum_id = $1,
           class_id = $2,
           onboarded = true,
           updated_at = NOW()
       WHERE id = $3 RETURNING id, email, full_name, role, is_premium, premium_expires_at, avatar_url, curriculum_id, class_id, onboarded, created_at`,
      [curriculum_id, class_id, req.user.id]
    );

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Google OAuth Sign-In / Sign-Up
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      // Fallback decode for local testing/dev if GOOGLE_CLIENT_ID is not configured
      if (!process.env.GOOGLE_CLIENT_ID) {
        const decoded = jwt.decode(credential);
        if (decoded) {
          ticket = { getPayload: () => decoded };
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase().trim();
    const full_name = payload.name || 'Google User';

    const roleInput = req.body.role || 'student';
    const role = ['student', 'teacher'].includes(roleInput) ? roleInput : 'student';

    let { rows } = await db.query(
      `SELECT id, email, full_name, role, is_premium,
              premium_expires_at, avatar_url, curriculum_id, class_id, onboarded, created_at 
       FROM users WHERE email = $1`,
      [email]
    );

    let user = rows[0];

    if (!user) {
      // Register new user with the selected role
      const dummyPassword = Math.random().toString(36).substring(2, 15);
      const hash = await bcrypt.hash(dummyPassword, 12);
      
      const insertRes = await db.query(
        `INSERT INTO users (email, password_hash, full_name, role, onboarded)
         VALUES ($1, $2, $3, $4, false)
         RETURNING id, email, full_name, role, is_premium, premium_expires_at, avatar_url, curriculum_id, class_id, onboarded, created_at`,
        [email, hash, full_name, role]
      );
      user = insertRes.rows[0];
    }

    const cleanUser = stripHash(user);
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await db.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    res.json({ success: true, accessToken, refreshToken, user: cleanUser });
  } catch (err) {
    console.error('[googleLogin Error]', err);
    res.status(401).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
};