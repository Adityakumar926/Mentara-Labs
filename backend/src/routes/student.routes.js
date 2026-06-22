// src/routes/student.routes.js
const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const courseCtrl      = require('../controllers/student/course.controller');
const examsubmitCtrl  = require('../controllers/student/examsubmit.controller');
const streakCtrl      = require('../controllers/student/streak.controller');
const profileCtrl     = require('../controllers/student/profile.controller');
const batchEnrollCtrl = require('../controllers/student/batch.enrollment.controller');
const notificationController = require('../controllers/student/notification.controller');

// Guard: ensure controllers loaded
const controllers = { courseCtrl, examsubmitCtrl, streakCtrl, profileCtrl, batchEnrollCtrl, notificationController };
for (const [name, ctrl] of Object.entries(controllers)) {
  if (!ctrl || (typeof ctrl !== 'object' && typeof ctrl !== 'function')) {
    throw new Error(`Controller "${name}" failed to load. Check file path and exports.`);
  }
}

router.use(protect);

// ─── PROFILE ──────────────────────────────────────────────────────────────────
if (typeof profileCtrl.getProfile     === 'function') router.get('/profile',           profileCtrl.getProfile);
if (typeof profileCtrl.updateProfile  === 'function') router.put('/profile',           profileCtrl.updateProfile);
if (typeof profileCtrl.changePassword === 'function') router.patch('/change-password', profileCtrl.changePassword);
if (typeof profileCtrl.getProgress    === 'function') router.get('/progress',          profileCtrl.getProgress);

// Avatar upload → Cloudinary (multipart)
if (typeof profileCtrl.uploadAvatar === 'function') {
  router.post(
    '/profile/avatar',
    upload('image').single('avatar'),
    handleUploadError,
    profileCtrl.uploadAvatar
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  router.get('/notifications', notificationController.getAll);
  router.patch('/notifications/read-all', notificationController.markAllRead);
  router.patch('/notifications/:id/read', notificationController.markRead);

// ─── STREAK & ACTIVITY ────────────────────────────────────────────────────────
if (typeof streakCtrl.logActivity      === 'function') router.post('/activity',       streakCtrl.logActivity);
if (typeof streakCtrl.getCalendar      === 'function') router.get('/streak/calendar', streakCtrl.getCalendar);
if (typeof streakCtrl.getYearlyHeatmap === 'function') router.get('/streak/heatmap',  streakCtrl.getYearlyHeatmap);

// ─── BATCH ENROLLMENT ─────────────────────────────────────────────────────────
router.get('/batches',              batchEnrollCtrl.getAllBatches);
router.post('/batches/:id/join',    batchEnrollCtrl.joinBatch);
router.delete('/batches/:id/leave', batchEnrollCtrl.leaveBatch);
router.get('/exams/scheduled',      batchEnrollCtrl.getScheduledExams);
router.get('/exams',                batchEnrollCtrl.getLiveExams);

// ─── CURRICULUMS ──────────────────────────────────────────────────────────────
if (typeof courseCtrl.getMyCurriculums      === 'function') router.get('/curriculums',                        courseCtrl.getMyCurriculums);
if (typeof courseCtrl.getCurriculumSubjects === 'function') router.get('/curriculums/:curriculumId/subjects', courseCtrl.getCurriculumSubjects);
if (typeof courseCtrl.getSubjectContent     === 'function') router.get('/subjects/:subjectId/content',        courseCtrl.getSubjectContent);

// ─── CONTENT ACCESS ───────────────────────────────────────────────────────────
if (typeof courseCtrl.getNoteUrl    === 'function') router.get('/content/:contentId/note-url',    courseCtrl.getNoteUrl);
if (typeof courseCtrl.getVideoToken === 'function') router.get('/content/:contentId/video-token', courseCtrl.getVideoToken);
if (typeof courseCtrl.getAnimation  === 'function') router.get('/animations/:animationId',        courseCtrl.getAnimation);

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
if (typeof courseCtrl.getMyQuestions === 'function') router.get('/questions', courseCtrl.getMyQuestions);

// ─── EXAMS ────────────────────────────────────────────────────────────────────
if (typeof examsubmitCtrl.startExam        === 'function') router.post('/exams/:examId/start',                             examsubmitCtrl.startExam);
if (typeof examsubmitCtrl.getExamQuestions === 'function') router.get('/exams/:examId/questions',                          examsubmitCtrl.getExamQuestions);
if (typeof examsubmitCtrl.saveAnswer       === 'function') router.post('/exams/:examId/submissions/:submissionId/answers', examsubmitCtrl.saveAnswer);

// Photo-based answers (e.g. handwritten work) → Cloudinary (multipart)
if (typeof examsubmitCtrl.savePhotoAnswer === 'function') {
  router.post(
    '/exams/:examId/submissions/:submissionId/answers/photo',
    upload('examPhoto').single('photo'),
    handleUploadError,
    examsubmitCtrl.savePhotoAnswer
  );
}

if (typeof examsubmitCtrl.submitExam       === 'function') router.post('/exams/:examId/submissions/:submissionId/submit',  examsubmitCtrl.submitExam);
if (typeof examsubmitCtrl.getMyResult      === 'function') router.get('/exams/:examId/result',                             examsubmitCtrl.getMyResult);
if (typeof examsubmitCtrl.getMyExamHistory === 'function') router.get('/results',                                          examsubmitCtrl.getMyExamHistory);

module.exports = router;