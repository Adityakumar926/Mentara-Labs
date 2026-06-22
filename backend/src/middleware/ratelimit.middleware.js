const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const json429 = (req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests — please try again later.',
    retryAfter: Math.ceil(res.getHeader('Retry-After')),
  });

// ─── LIMITERS ─────────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         json429,
});

const globalLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         json429,
});

const submitLimiter = rateLimit({
  windowMs:        10 * 1000,
  max:             1,
  keyGenerator:    (req) => req.user?.id ?? ipKeyGenerator(req), // ← fixed
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         json429,
});

module.exports = { authLimiter, globalLimiter, submitLimiter };