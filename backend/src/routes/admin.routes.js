// src/routes/admin.routes.js
const express = require('express');
const router  = express.Router();

const { protect }   = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { authLimiter } = require('../middleware/ratelimit.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const dashCtrl  = require('../controllers/admin/dashboard.controller');
const currCtrl  = require('../controllers/admin/curriculum.controller');
const classCtrl = require('../controllers/admin/class.controller');
const topicCtrl = require('../controllers/admin/topic.controller');
const qCtrl     = require('../controllers/admin/question.controller');
const qGenCtrl  = require('../controllers/admin/questionGenerator.controller');
const examCtrl  = require('../controllers/admin/exam.controller');
const animCtrl  = require('../controllers/admin/animation.controller');
const hierarchyCtrl = require('../controllers/admin/hierarchy.controller');
const certificatesCtrl = require('../controllers/certificates.controller');

// All admin routes require auth
router.use(protect);

// Allow both admin and teacher for GET (read-only) operations, but only admin for modifying operations (POST, PUT, DELETE, PATCH).
const authorizeReadOrWrite = (req, res, next) => {
  if (req.method === 'GET') {
    return authorize('admin', 'teacher')(req, res, next);
  } else {
    return authorize('admin')(req, res, next);
  }
};
router.use(authorizeReadOrWrite);

// ─── HIERARCHY ────────────────────────────────────────────────────────────────
router.get('/hierarchy', hierarchyCtrl.getTree);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard', dashCtrl.getStats);

// ─── CURRICULUMS ──────────────────────────────────────────────────────────────
router.get('/curriculums',        currCtrl.getAll);
router.get('/curriculums/:id',    currCtrl.getOne);
router.post('/curriculums',       currCtrl.create);
router.put('/curriculums/:id',    currCtrl.update);
router.delete('/curriculums/:id', currCtrl.delete);

// ─── CLASSES ──────────────────────────────────────────────────────────────────
router.get('/curriculums/:curriculumId/classes', classCtrl.getAll);
router.get('/classes/:id',                       classCtrl.getOne);
router.post('/curriculums/:curriculumId/classes', classCtrl.create);
router.put('/classes/:id',                        classCtrl.update);
router.delete('/classes/:id',                     classCtrl.delete);

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
router.get('/subjects',                        currCtrl.getAllSubjects);
router.post('/classes/:classId/subjects',      currCtrl.createSubject);
router.put('/classes/:classId/subjects/reorder', currCtrl.reorderSubjects);
router.put('/subjects/:id',                    currCtrl.updateSubject);
router.delete('/subjects/:id',                 currCtrl.deleteSubject);

// ─── TOPICS ───────────────────────────────────────────────────────────────────
router.get('/subjects/:subjectId/topics',         topicCtrl.getAll);
router.get('/topics/:id',                         topicCtrl.getOne);
router.post('/subjects/:subjectId/topics',         topicCtrl.create);
router.put('/topics/:id',                         topicCtrl.update);
router.delete('/topics/:id',                      topicCtrl.delete);
router.put('/subjects/:subjectId/topics/reorder', topicCtrl.reorder);

// ─── CONTENT ──────────────────────────────────────────────────────────────────
router.get('/topics/:topicId/content', currCtrl.getSubjectContent);

// Animation-only generic add. upload().none() parses multipart field-only bodies
// (no file expected) so Express doesn't crash when the frontend sends multipart.
// NOTE: For notes use /content/note, for videos use /content/video/upload-url.
router.post(
  '/topics/:topicId/content',
  upload('image').none(),
  handleUploadError,
  currCtrl.addContent
);

router.put('/content/:id',    currCtrl.updateContent);
router.delete('/content/:id', currCtrl.deleteContent);

// Notes (PDF) → Cloudinary
router.post(
  '/topics/:topicId/content/note',
  upload('note').single('file'),
  handleUploadError,
  currCtrl.uploadNote
);
router.put(
  '/content/:id/note',
  upload('note').single('file'),
  handleUploadError,
  currCtrl.replaceNote
);

// Videos → Direct upload (Cloudinary) or Mux direct upload
router.post(
  '/topics/:topicId/content/video',
  upload('video').single('file'),
  handleUploadError,
  currCtrl.uploadVideoFile
);
router.post('/topics/:topicId/content/video/upload-url', currCtrl.createMuxUpload);
router.post('/content/:id/video/confirm',                 currCtrl.confirmMuxUpload);

// Worksheets (image) → Cloudinary
router.post(
  '/topics/:topicId/content/worksheet',
  upload('image').single('file'),
  handleUploadError,
  currCtrl.uploadWorksheet
);
router.put(
  '/content/:id/worksheet',
  upload('image').single('file'),
  handleUploadError,
  currCtrl.replaceWorksheet
);

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
router.get('/questions',               qCtrl.getAll);
router.post('/questions',              qCtrl.create);
router.post(
  '/questions/image',
  upload('image').single('file'),
  handleUploadError,
  qCtrl.uploadImage
);
router.post(
  '/questions/audio',
  upload('audio').single('file'),
  handleUploadError,
  qCtrl.uploadAudio
);
router.post(
  '/questions/bulk-upload',
  upload('image').array('images', 50),
  handleUploadError,
  qCtrl.bulkUploadImages
);
router.put('/questions/:id',           qCtrl.update);
router.delete('/questions/:id',        qCtrl.delete);
router.patch('/questions/:id/star',    qCtrl.toggleStar);
router.patch('/questions/:id/premium', qCtrl.togglePremium);

// ─── QUESTION GENERATOR (RAG + AI) ───────────────────────────────────────────
router.post(
  '/question-generator/upload',
  upload('note').single('file'),
  handleUploadError,
  qGenCtrl.uploadDocument
);
router.get('/question-generator/documents',        qGenCtrl.getDocuments);
router.delete('/question-generator/documents/:id', qGenCtrl.deleteDocument);
router.post('/question-generator/generate',        qGenCtrl.generateQuestions);
router.post('/question-generator/save-bulk',       qGenCtrl.saveBulkQuestions);

// ─── EXAMS ────────────────────────────────────────────────────────────────────
router.get('/exams',     examCtrl.getAll);
router.post('/exams',    examCtrl.create);
router.get('/exams/:id', examCtrl.getOne);
router.put('/exams/:id', examCtrl.update);
router.delete('/exams/:id', examCtrl.delete);
router.post('/exams/:id/duplicate', examCtrl.duplicate);

// Exam questions management
router.post('/exams/:id/questions',               examCtrl.addQuestions);
router.delete('/exams/:id/questions/:questionId', examCtrl.removeQuestion);
router.put('/exams/:id/questions/reorder',        examCtrl.reorderQuestions);

// Exam lifecycle
router.post('/exams/:id/schedule', examCtrl.schedule);
router.post('/exams/:id/live',     examCtrl.goLive);
router.post('/exams/:id/end',      examCtrl.endExam);

// Exam results
router.get('/exams/:id/results',            examCtrl.getResults);
router.get('/exams/:id/results/:studentId', examCtrl.getStudentResult);

// ─── ANIMATIONS ───────────────────────────────────────────────────────────────
router.get('/animations',               animCtrl.getAll);
router.post('/animations',              animCtrl.create);
router.post('/animations/upsert',       animCtrl.upsert);
router.get('/animations/:id',           animCtrl.getOne);
router.put('/animations/:id',           animCtrl.update);
router.delete('/animations/:id',        animCtrl.delete);
router.patch('/animations/:id/star',    animCtrl.toggleStar);
router.patch('/animations/:id/premium', animCtrl.togglePremium);
router.get('/animations/:id/preview',   animCtrl.preview);


// ─── STUDENTS / USERS ─────────────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  const db = require('../config/db');
  try {
    const search = req.query.search;
    const isPremiumQuery = req.query.is_premium;
    const role = req.query.role;

    let page  = parseInt(req.query.page  ?? '1',  10);
    let limit = parseInt(req.query.limit ?? '50', 10);
    if (!Number.isFinite(page)  || page  < 1) page  = 1;
    if (!Number.isFinite(limit) || limit < 1) limit = 50;

    const offset = (page - 1) * limit;
    const conditions = ["u.role IN ('student', 'teacher')"];
    const params = [];

    if (role && ['student', 'teacher'].includes(role)) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    if (isPremiumQuery !== undefined && isPremiumQuery !== '' && isPremiumQuery !== null) {
      params.push(isPremiumQuery === 'true');
      conditions.push(`u.is_premium = $${params.length}`);
    }

    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT 
         u.id, u.email, u.full_name, u.role, u.is_premium, u.premium_expires_at, 
         u.avatar_url, u.onboarded, u.created_at,
         cl.name AS class_name,
         c.name AS curriculum_name
       FROM users u
       LEFT JOIN classes cl ON cl.id = u.class_id
       LEFT JOIN curriculums c ON c.id = u.curriculum_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('admin getStudents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/students/:id/premium', async (req, res) => {
  const db = require('../config/db');
  try {
    const { is_premium, premium_expires_at } = req.body;
    const { rows } = await db.query(
      `UPDATE users
       SET is_premium = $1, premium_expires_at = $2, updated_at = NOW()
       WHERE id = $3 AND role IN ('student', 'teacher')
       RETURNING id, email, full_name, is_premium, premium_expires_at`,
      [is_premium, premium_expires_at, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const settingsCtrl = require('../controllers/admin/settings.controller');
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', settingsCtrl.updateSetting);

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────
router.get('/certificates', certificatesCtrl.getAdminCertificates);

module.exports = router;