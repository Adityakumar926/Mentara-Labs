import api from './client';

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:     (data)  => api.post('/auth/register', data),
  login:        (data)  => api.post('/auth/login', data),
  googleLogin:  (data)  => api.post('/auth/google', data),
  logout:       ()      => api.post('/auth/logout'),
  me:           ()      => api.get('/auth/me'),
  onboard:      (data)  => api.post('/auth/onboarding', data),
  refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Curriculums
  getCurriculums:   ()         => api.get('/admin/curriculums'),
  getHierarchy:     ()         => api.get('/admin/hierarchy'),
  getCurriculum:    (id)       => api.get(`/admin/curriculums/${id}`),
  createCurriculum: (data)     => api.post('/admin/curriculums', data),
  updateCurriculum: (id, data) => api.put(`/admin/curriculums/${id}`, data),
  deleteCurriculum: (id)       => api.delete(`/admin/curriculums/${id}`),

  // Classes
  getClasses:       (currId)   => api.get(`/admin/curriculums/${currId}/classes`),
  getClass:         (id)       => api.get(`/admin/classes/${id}`),
  createClass:      (currId, data) => api.post(`/admin/curriculums/${currId}/classes`, data),
  updateClass:      (id, data) => api.put(`/admin/classes/${id}`, data),
  deleteClass:      (id)       => api.delete(`/admin/classes/${id}`),

  // Subjects
  getSubjects:     ()                  => api.get('/admin/subjects'),
  createSubject:   (classId, data)     => api.post(`/admin/classes/${classId}/subjects`, data),
  updateSubject:   (id, data)          => api.put(`/admin/subjects/${id}`, data),
  deleteSubject:   (id)                => api.delete(`/admin/subjects/${id}`),
  reorderSubjects: (classId, order)    => api.put(`/admin/classes/${classId}/subjects/reorder`, { order }),

  // Topics
  getTopics:       (subId)   => api.get(`/admin/subjects/${subId}/topics`),
  getTopic:         (id)      => api.get(`/admin/topics/${id}`),
  createTopic:      (subId, data) => api.post(`/admin/subjects/${subId}/topics`, data),
  updateTopic:      (id, data) => api.put(`/admin/topics/${id}`, data),
  deleteTopic:      (id)       => api.delete(`/admin/topics/${id}`),
  reorderTopics:    (subId, order) => api.put(`/admin/subjects/${subId}/topics/reorder`, { order }),

  // Content
  getSubjectContent: (topicId)       => api.get(`/admin/topics/${topicId}/content`),
  addContent:        (topicId, data) => api.post(`/admin/topics/${topicId}/content`, data),
  updateContent:     (id, data)        => api.put(`/admin/content/${id}`, data),
  deleteContent:     (id)              => api.delete(`/admin/content/${id}`),

  // Content — Notes (PDF upload to Cloudinary)
  uploadNote:  (topicId, formData) => api.post(`/admin/topics/${topicId}/content/note`, formData),
  replaceNote: (contentId, formData) => api.put(`/admin/content/${contentId}/note`, formData),

  // Content — Worksheets (image upload to Cloudinary)
  uploadWorksheet:  (topicId, formData) => api.post(`/admin/topics/${topicId}/content/worksheet`, formData),
  replaceWorksheet: (contentId, formData) => api.put(`/admin/content/${contentId}/worksheet`, formData),

  // Content — Videos (Mux direct upload flow)
  createMuxUpload:  (topicId, data) => api.post(`/admin/topics/${topicId}/content/video/upload-url`, data),
  confirmMuxUpload: (contentId, data) => api.post(`/admin/content/${contentId}/video/confirm`, data),

  // Questions
  getQuestions:          (params)   => api.get('/admin/questions', { params }),
  createQuestion:        (data)     => api.post('/admin/questions', data),
  updateQuestion:        (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion:        (id)       => api.delete(`/admin/questions/${id}`),
  toggleQuestionStar:    (id)       => api.patch(`/admin/questions/${id}/star`),
  toggleQuestionPremium: (id)       => api.patch(`/admin/questions/${id}/premium`),
  uploadQuestionImage:   (file)     => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/admin/questions/image', fd);
  },
  bulkUploadQuestions: (formData, onUploadProgress) => {
    return api.post('/admin/questions/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  // Exams
  getExams:           (params)   => api.get('/admin/exams', { params }),
  getExam:            (id)       => api.get(`/admin/exams/${id}`),
  createExam:         (data)     => api.post('/admin/exams', data),
  updateExam:         (id, data) => api.put(`/admin/exams/${id}`, data),
  deleteExam:         (id)       => api.delete(`/admin/exams/${id}`),
  duplicateExam:      (id)       => api.post(`/admin/exams/${id}/duplicate`),
  addExamQuestions:   (id, data) => api.post(`/admin/exams/${id}/questions`, data),
  removeExamQuestion: (id, qId)  => api.delete(`/admin/exams/${id}/questions/${qId}`),
  scheduleExam:       (id, data) => api.post(`/admin/exams/${id}/schedule`, data),
  goLiveExam:         (id)       => api.post(`/admin/exams/${id}/live`),
  endExam:            (id)       => api.post(`/admin/exams/${id}/end`),
  getExamResults:     (id)       => api.get(`/admin/exams/${id}/results`),
  getStudentResult:   (examId, studentId) => api.get(`/admin/exams/${examId}/results/${studentId}`),

  // Animations
  upsertAnimation:        (data)     => api.post('/admin/animations/upsert', data),
  getAnimations:          (params)   => api.get('/admin/animations', { params }),
  getAnimation:           (id)       => api.get(`/admin/animations/${id}`),
  createAnimation:        (data)     => api.post('/admin/animations', data),
  updateAnimation:        (id, data) => api.put(`/admin/animations/${id}`, data),
  deleteAnimation:        (id)       => api.delete(`/admin/animations/${id}`),
  toggleAnimationStar:    (id)       => api.patch(`/admin/animations/${id}/star`),
  toggleAnimationPremium: (id)       => api.patch(`/admin/animations/${id}/premium`),
  previewAnimation:       (id)       => api.get(`/admin/animations/${id}/preview`),


  // Students
  getStudents:          (params)   => api.get('/admin/students', { params }),
  toggleStudentPremium: (id, data) => api.patch(`/admin/students/${id}/premium`, data),

  // Settings
  getSettings:          ()         => api.get('/admin/settings'),
  updateSetting:        (data)     => api.put('/admin/settings', data),
  getCertificates:      (params)   => api.get('/admin/certificates', { params }),
};

// ── STUDENT ───────────────────────────────────────────────────────────────────
export const studentApi = {

  getScheduledExams: () => api.get('/student/exams/scheduled'),
  getExploreContents: () => api.get('/student/explore'),

  getLiveExams: () => api.get('/student/exams'),

  // Profile
  getProfile:     ()     => api.get('/student/profile'),
  updateProfile:  (data) => api.put('/student/profile', data),
  upgradePremium: ()     => api.post('/student/profile/upgrade-premium'),
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
  getAllCurriculums:     ()          => api.get('/student/all-curriculums'),
  getCurriculumClasses:  (currId)    => api.get(`/student/curriculums/${currId}/classes`),
  getCurriculumSubjects: (currId)    => api.get(`/student/curriculums/${currId}/subjects`),
  getSubjectTopics:      (subjectId) => api.get(`/student/subjects/${subjectId}/topics`),
  getTopicContent:       (topicId)   => api.get(`/student/topics/${topicId}/content`),
  getNoteUrl:            (contentId) => api.get(`/student/content/${contentId}/note-url`),
  getVideoToken:         (contentId) => api.get(`/student/content/${contentId}/video-token`),
  getAnimation:          (animId)    => api.get(`/student/animations/${animId}`),
  // Worksheet — image URL is stored directly on the content row, no extra fetch needed.
  // The file_url is returned as part of getSubjectContent; this helper is kept for
  // premium-gate enforcement (mirrors the note-url pattern).
  getWorksheetUrl:       (contentId) => api.get(`/student/content/${contentId}/worksheet-url`),

  // Progress
  trackResource:         (data)      => api.post('/student/progress/resource', data),
  trackVideo:            (data)      => api.post('/student/progress/video', data),
  getProgressSummary:    ()          => api.get('/student/progress/summary'),

  // Questions
  getMyQuestions: (params) => api.get('/student/questions', { params }),

  // Notifications
  getNotifications:         (params) => api.get('/student/notifications', { params }),
  markNotificationRead:     (id)     => api.patch(`/student/notifications/${id}/read`),
  markAllNotificationsRead: ()       => api.patch('/student/notifications/read-all'),

  // Exams
  startExam:       (examId)                     => api.post(`/student/exams/${examId}/start`),
  getExamQuestions:(examId)                     => api.get(`/student/exams/${examId}/questions`),
  saveAnswer:      (examId, submissionId, data) => api.post(`/student/exams/${examId}/submissions/${submissionId}/answers`, data),
  savePhotoAnswer: (examId, submissionId, questionId, file) => {
    const fd = new FormData();
    fd.append('question_id', questionId);
    fd.append('photo', file);
    return api.post(`/student/exams/${examId}/submissions/${submissionId}/answers/photo`, fd);
  },
  submitExam:   (examId, submissionId) => api.post(`/student/exams/${examId}/submissions/${submissionId}/submit`),
  getMyResult:  (examId)               => api.get(`/student/exams/${examId}/result`),
  getAllResults: ()                     => api.get('/student/results'),

  // Settings
  getSettings:   ()                     => api.get('/student/settings'),
  getCertificates: ()                   => api.get('/student/certificates'),
};

// ── AI VOICE TUTOR ────────────────────────────────────────────────────────────
export const aiApi = {
  voiceTutor: (message, history) => api.post('/ai/voice-tutor', { message, history }),
};