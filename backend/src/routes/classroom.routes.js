const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const classroomCtrl = require('../controllers/classroom.controller');

// ─── PUBLIC JOIN DISCOVERY & EMAIL VERIFICATION ────────────────────────────
router.get('/join-info/:inviteCode', classroomCtrl.getJoinInfo);
router.post('/verify-join-email', classroomCtrl.verifyJoinEmail);
router.post('/register-and-join', classroomCtrl.registerAndJoin);
router.post('/login-and-join', classroomCtrl.loginAndJoin);

// All subsequent routes require authentication
router.use(protect);

// ─── UNIFIED STUDENT JOIN ACTION ─────────────────────────────────────────────
router.post('/join/:inviteCode', authorize('student'), classroomCtrl.joinClassroom);

// ─── ISOLATED STUDENT ENDPOINTS ──────────────────────────────────────────────
router.get('/student/list', authorize('student'), classroomCtrl.getStudentClassrooms);
router.get('/student/:id', authorize('student'), classroomCtrl.getStudentClassroomDetail);
router.get('/student/:id/exams', authorize('student'), classroomCtrl.getStudentClassroomExams);
router.get('/student/:id/materials', authorize('student'), classroomCtrl.getStudentClassroomMaterials);
router.get('/student/:id/assignments', authorize('student'), classroomCtrl.getStudentClassroomAssignments);
router.get('/student/:id/announcements', authorize('student'), classroomCtrl.getStudentClassroomAnnouncements);

// ─── TEACHER MANAGEMENT ENDPOINTS ──────────────────────────────────────────
router.post('/', authorize('teacher', 'admin'), classroomCtrl.createClassroom);
router.get('/', authorize('teacher', 'admin'), classroomCtrl.getClassrooms);
router.get('/:id', authorize('teacher', 'admin'), classroomCtrl.getClassroomById);
router.put('/:id', authorize('teacher', 'admin'), classroomCtrl.updateClassroom);
router.post('/:id/archive', authorize('teacher', 'admin'), classroomCtrl.archiveClassroom);

// Student Invitations & Members
router.post('/:id/invitations', authorize('teacher', 'admin'), classroomCtrl.sendInvitation);
router.delete('/:id/students/:studentId', authorize('teacher', 'admin'), classroomCtrl.removeStudent);

// Content Assignments
router.post('/:id/exams', authorize('teacher', 'admin'), classroomCtrl.assignExams);
router.delete('/:id/exams/:examId', authorize('teacher', 'admin'), classroomCtrl.unassignExam);

router.post('/:id/materials', authorize('teacher', 'admin'), classroomCtrl.assignMaterials);
router.delete('/:id/materials/:materialId', authorize('teacher', 'admin'), classroomCtrl.unassignMaterial);

router.post('/:id/assignments', authorize('teacher', 'admin'), classroomCtrl.createAssignment);
router.post('/:id/announcements', authorize('teacher', 'admin'), classroomCtrl.createAnnouncement);

module.exports = router;
