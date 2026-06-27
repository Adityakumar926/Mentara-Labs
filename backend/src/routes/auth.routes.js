const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/auth.middleware');
const authCtrl    = require('../controllers/auth.controller');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.post('/google',   authCtrl.googleLogin);

// ─── PROTECTED ────────────────────────────────────────────────────────────────
router.get('/me',             protect, authCtrl.me);
router.post('/onboarding',    protect, authCtrl.onboard);
router.post('/logout',        protect, authCtrl.logout);
router.post('/refresh-token', authCtrl.refreshToken);

module.exports = router;