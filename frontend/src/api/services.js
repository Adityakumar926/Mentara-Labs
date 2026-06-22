import api from './client';

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:     (data)  => api.post('/auth/register', data),
  login:        (data)  => api.post('/auth/login', data),
  logout:       ()      => api.post('/auth/logout'),
  me:           ()      => api.get('/auth/me'),
  refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Curriculums
  getCurriculums:   ()         => api.get('/admin/curriculums'),
  getCurriculum:    (id)       => api.get(`/admin/curriculums/${id}`),
  createCurriculum: (data)     => api.post('/admin/curriculums', data),
  updateCurriculum: (id, data) => api.put(`/admin/curriculums/${id}`, data),
  deleteCurriculum: (id)       => api.delete(`/admin/curriculums/${id}`),

  // Subjects
  getSubjects:     ()                    => api.get('/admin/subjects'),
  createSubject:   (currId, data)   => api.post(`/admin/curriculums/${currId}/subjects`, data),
  updateSubject:   (id, data)       => api.put(`/admin/subjects/${id}`, data),
  deleteSubject:   (id)             => api.delete(`/admin/subjects/${id}`),
  reorderSubjects: (currId, order)  => api.put(`/admin/curriculums/${currId}/subjects/reorder`, { order }),

  // Content
  getSubjectContent: (subjectId)       => api.get(`/admin/subjects/${subjectId}/content`),
  addContent:        (subjectId, data) => api.post(`/admin/subjects/${subjectId}/content`, data), // ← FIXED: was POST /admin/content
  updateContent:     (id, data)        => api.put(`/admin/content/${id}`, data),
  deleteContent:     (id)              => api.delete(`/admin/content/${id}`),

  // Content — Notes (PDF upload to CLOUDINARY). ← FIXED: these were missing entirely
  uploadNote:  (subjectId, formData) => api.post(`/admin/subjects/${subjectId}/content/note`, formData),
  replaceNote: (contentId, formData) => api.put(`/admin/content/${contentId}/note`, formData),

  // Content — Videos (Mux direct upload flow). ← FIXED: these were missing entirely
  createMuxUpload:  (subjectId, data) => api.post(`/admin/subjects/${subjectId}/content/video/upload-url`, data),
  confirmMuxUpload: (contentId, data) => api.post(`/admin/content/${contentId}/video/confirm`, data),

  // Questions
  getQuestions:         (params)   => api.get('/admin/questions', { params }),
  createQuestion:       (data)     => api.post('/admin/questions', data),
  updateQuestion:       (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion:       (id)       => api.delete(`/admin/questions/${id}`),
  toggleQuestionStar:   (id)       => api.patch(`/admin/questions/${id}/star`),
  toggleQuestionPremium:(id)       => api.patch(`/admin/questions/${id}/premium`),
  uploadQuestionImage:  (file)     => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/admin/questions/image', fd);
  },

  // Exams
  getExams:           (params)   => api.get('/admin/exams', { params }),
  getExam:            (id)       => api.get(`/admin/exams/${id}`),
  createExam:         (data)     => api.post('/admin/exams', data),
  updateExam:         (id, data) => api.put(`/admin/exams/${id}`, data),
  deleteExam:         (id)       => api.delete(`/admin/exams/${id}`),
  addExamQuestions:   (id, data) => api.post(`/admin/exams/${id}/questions`, data),
  removeExamQuestion: (id, qId)  => api.delete(`/admin/exams/${id}/questions/${qId}`),
  scheduleExam:       (id, data) => api.post(`/admin/exams/${id}/schedule`, data),  // ← FIXED: PATCH→POST
  goLiveExam:         (id)       => api.post(`/admin/exams/${id}/live`),            // ← FIXED: PATCH→POST, go-live→live
  endExam:            (id)       => api.post(`/admin/exams/${id}/end`),             // ← FIXED: PATCH→POST
  getExamResults:     (id)       => api.get(`/admin/exams/${id}/results`),
  getStudentResult:   (examId, studentId) => api.get(`/admin/exams/${examId}/results/${studentId}`),
  // manualGrade removed — backend controller doesn't exist yet

  // Animations
  upsertAnimation:       (data) => api.post('/admin/animations/upsert', data), // ← FIXED: was `client.post`, `client` was never imported
  getAnimations:         (params)   => api.get('/admin/animations', { params }),
  getAnimation:          (id)       => api.get(`/admin/animations/${id}`),
  createAnimation:       (data)     => api.post('/admin/animations', data),
  updateAnimation:       (id, data) => api.put(`/admin/animations/${id}`, data),
  deleteAnimation:       (id)       => api.delete(`/admin/animations/${id}`),
  toggleAnimationStar:   (id)       => api.patch(`/admin/animations/${id}/star`),
  toggleAnimationPremium:(id)       => api.patch(`/admin/animations/${id}/premium`),
  previewAnimation:      (id)       => api.get(`/admin/animations/${id}/preview`),

  // Batches
  getBatches:           (params)     => api.get('/admin/batches', { params }),
  getBatch:             (id)         => api.get(`/admin/batches/${id}`),
  createBatch:          (data)       => api.post('/admin/batches', data),
  updateBatch:          (id, data)   => api.put(`/admin/batches/${id}`, data),
  deleteBatch:          (id)         => api.delete(`/admin/batches/${id}`),
  addBatchStudents:     (id, ids)    => api.post(`/admin/batches/${id}/students`, { student_ids: ids }),
  removeBatchStudent:   (id, sid)    => api.delete(`/admin/batches/${id}/students/${sid}`),
  getAvailableStudents: (id, params) => api.get(`/admin/batches/${id}/available-students`, { params }), // ← FIXED: path
  getBatchAnalytics:    (id)         => api.get(`/admin/batches/${id}/analytics`),

  // Students
  getStudents:         (params)    => api.get('/admin/students', { params }),
  toggleStudentPremium:(id, data)  => api.patch(`/admin/students/${id}/premium`, data),
};

// ── STUDENT ───────────────────────────────────────────────────────────────────
export const studentApi = {

  getScheduledExams: () => api.get('/student/exams/scheduled'),
  getAllBatches: ()   => api.get('/student/batches'),
  joinBatch:    (id) => api.post(`/student/batches/${id}/join`),
  leaveBatch:   (id) => api.delete(`/student/batches/${id}/leave`),

  getLiveExams: () => api.get('/student/exams'),

  // Profile
  getProfile:     ()     => api.get('/student/profile'),
  updateProfile:  (data) => api.put('/student/profile', data),
  uploadAvatar:   (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/student/profile/avatar', fd);
  },
  changePassword: (data) => api.patch('/student/change-password', data),
  getProgress:    ()     => api.get('/student/progress'),

  // Streak & Activity
  logActivity: (data)   => api.post('/student/activity', data),
  getCalendar: (params) => api.get('/student/streak/calendar', { params }),
  getHeatmap:  (params) => api.get('/student/streak/heatmap', { params }),

  // Courses
  getCurriculums:        ()          => api.get('/student/curriculums'),
  getCurriculumSubjects: (currId)    => api.get(`/student/curriculums/${currId}/subjects`),
  getSubjectContent:     (subjectId) => api.get(`/student/subjects/${subjectId}/content`),
  getNoteUrl:            (contentId) => api.get(`/student/content/${contentId}/note-url`),
  getVideoToken:         (contentId) => api.get(`/student/content/${contentId}/video-token`),
  getAnimation:          (animId)    => api.get(`/student/animations/${animId}`),

  // Questions
  getMyQuestions: (params) => api.get('/student/questions', { params }),

  // Notifications
  getNotifications:         (params) => api.get('/student/notifications', { params }),
  markNotificationRead:     (id)     => api.patch(`/student/notifications/${id}/read`),
  markAllNotificationsRead: ()       => api.patch('/student/notifications/read-all'),

  // Exams — matches the real examsubmit.controller flow exactly
  // ← FIXED: entire student exam section rewritten to match backend
  startExam:       (examId)                    => api.post(`/student/exams/${examId}/start`),
  getExamQuestions:(examId)                    => api.get(`/student/exams/${examId}/questions`),
  saveAnswer:      (examId, submissionId, data)=> api.post(`/student/exams/${examId}/submissions/${submissionId}/answers`, data),
  savePhotoAnswer: (examId, submissionId, questionId, file) => {
    const fd = new FormData();
    fd.append('question_id', questionId);
    fd.append('photo', file);
    return api.post(`/student/exams/${examId}/submissions/${submissionId}/answers/photo`, fd);
  },
  submitExam:      (examId, submissionId)      => api.post(`/student/exams/${examId}/submissions/${submissionId}/submit`),
  getMyResult:     (examId)                    => api.get(`/student/exams/${examId}/result`),
  getAllResults:    ()                          => api.get('/student/results'),
};