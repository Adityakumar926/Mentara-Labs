// src/routes/student.routes.js
const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const courseCtrl      = require('../controllers/student/course.controller');
const examsubmitCtrl  = require('../controllers/student/examsubmit.controller');
const streakCtrl      = require('../controllers/student/streak.controller');
const profileCtrl     = require('../controllers/student/profile.controller');
const progressCtrl = require('../controllers/student/progress.controller');
const notificationController = require('../controllers/student/notification.controller');

// Guard: ensure controllers loaded
const controllers = { courseCtrl, examsubmitCtrl, streakCtrl, profileCtrl, progressCtrl, notificationController };
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
if (typeof profileCtrl.upgradePremium   === 'function') router.post('/profile/upgrade-premium', profileCtrl.upgradePremium);

// ─── PROGRESS TRACKING ────────────────────────────────────────────────────────
router.post('/progress/resource', progressCtrl.trackResourceCompletion);
router.post('/progress/video',    progressCtrl.trackVideoProgress);
router.get('/progress/summary',   progressCtrl.getProgressSummary);

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

// ─── EXPLORE & EXAMS ──────────────────────────────────────────────────────────
router.get('/explore',              courseCtrl.getExploreContents);
router.get('/exams/scheduled',      courseCtrl.getScheduledExams);
router.get('/exams',                courseCtrl.getLiveExams);

// ─── CURRICULUMS ──────────────────────────────────────────────────────────────
if (typeof courseCtrl.getMyCurriculums      === 'function') router.get('/curriculums',                        courseCtrl.getMyCurriculums);
router.get('/all-curriculums',                                                    courseCtrl.getAllCurriculums);
router.get('/curriculums/:curriculumId/classes',                                  courseCtrl.getCurriculumClasses);
if (typeof courseCtrl.getCurriculumSubjects === 'function') router.get('/curriculums/:curriculumId/subjects', courseCtrl.getCurriculumSubjects);
if (typeof courseCtrl.getSubjectTopics      === 'function') router.get('/subjects/:subjectId/topics',        courseCtrl.getSubjectTopics);
if (typeof courseCtrl.getTopicContent       === 'function') router.get('/topics/:topicId/content',          courseCtrl.getTopicContent);

// ─── CONTENT ACCESS ───────────────────────────────────────────────────────────
if (typeof courseCtrl.getNoteUrl    === 'function') router.get('/content/:contentId/note-url',    courseCtrl.getNoteUrl);
if (typeof courseCtrl.getWorksheetUrl === 'function') router.get('/content/:contentId/worksheet-url', courseCtrl.getWorksheetUrl);
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

const settingsCtrl = require('../controllers/student/settings.controller');
router.get('/settings', settingsCtrl.getSettings);

module.exports = router;