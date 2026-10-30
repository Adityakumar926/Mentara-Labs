const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const controller = require('../controllers/assessment.controller');

// Submit an 8-mission assessment session (Authenticated user)
router.post('/submit', protect, controller.submitAssessment);

// Get student assessment history & profile
router.get('/my-results', protect, controller.getMyResults);
router.get('/history', protect, controller.getMyResults);

// Teacher / Admin: Review all student assessments
router.get('/classroom/:classId', protect, controller.getClassResults);

module.exports = router;
