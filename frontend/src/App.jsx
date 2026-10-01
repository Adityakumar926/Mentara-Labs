import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/authStore';

// Layouts
import AdminLayout       from '@/components/layout/AdminLayout';
import StudentLayout     from '@/components/layout/StudentLayout';
import StudentUserLayout from '@/components/layout/StudentUserLayout';
import AuthLayout        from '@/components/layout/AuthLayout';

// Guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';

// Landing (Lazy)
const LandingPage                   = lazy(() => import('@/features/landing/LandingPage'));
const PrivacyPolicyPage             = lazy(() => import('@/features/landing/PrivacyPolicyPage'));
const TermsOfServicePage            = lazy(() => import('@/features/landing/TermsOfServicePage'));
const PaymentSuccess                = lazy(() => import('@/features/payment/PaymentSuccess'));
const PublicCertificateVerification = lazy(() => import('@/features/landing/PublicCertificateVerification'));

// Auth (Lazy)
const LoginPage      = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage   = lazy(() => import('@/features/auth/RegisterPage'));
const OnboardingPage = lazy(() => import('@/features/auth/OnboardingPage'));

// Admin (Lazy)
const AdminDashboard        = lazy(() => import('@/features/admin/dashboard/DashboardPage'));
const CurriculumPage        = lazy(() => import('@/features/admin/curriculum/CurriculumPage'));
const CurriculumDetail      = lazy(() => import('@/features/admin/curriculum/CurriculumDetail'));
const QuestionsPage         = lazy(() => import('@/features/admin/questions/QuestionsPage'));
const QuestionGeneratorPage = lazy(() => import('@/features/admin/question_generator/QuestionGeneratorPage'));
const ExamsAdminPage        = lazy(() => import('@/features/admin/exams/ExamsPage'));
const ExamDetail            = lazy(() => import('@/features/admin/exams/ExamDetail'));
const StudentsPage          = lazy(() => import('@/features/admin/students/StudentsPage'));
const SettingsPage          = lazy(() => import('@/features/admin/settings/SettingsPage'));
const CertificatesPage      = lazy(() => import('@/features/admin/certificates/CertificatesPage'));
const MaterialsPage         = lazy(() => import('@/features/admin/curriculum/MaterialsPage'));

// Student (Lazy)
const StudentDashboardPage    = lazy(() => import('@/features/student/dashboard/StudentDashboardPage'));
const ProfilePage             = lazy(() => import('@/features/student/profile/ProfilePage'));
const PremiumPage             = lazy(() => import('@/features/student/premium/PremiumPage'));
const StudentCertificatesPage = lazy(() => import('@/features/student/certificates/CertificatesPage'));
const StudentClassroomsPage   = lazy(() => import('@/features/student/classrooms/StudentClassroomsPage'));
const StudentClassroomView   = lazy(() => import('@/features/student/classrooms/StudentClassroomView'));
const ClassroomJoinPage       = lazy(() => import('@/features/student/classrooms/ClassroomJoinPage'));

// Teacher (Lazy)
const SubjectsListPage     = lazy(() => import('@/features/teacher/courses/SubjectsListPage'));
const CoursesPage          = lazy(() => import('@/features/teacher/courses/CoursesPage'));
const TopicsPage           = lazy(() => import('@/features/teacher/courses/TopicsPage'));
const SubjectPage          = lazy(() => import('@/features/teacher/courses/SubjectPage'));
const ExamsStudentPage     = lazy(() => import('@/features/teacher/exams/ExamsPage'));
const ExamTakePage         = lazy(() => import('@/features/teacher/exams/ExamTakePage'));
const ResultPage           = lazy(() => import('@/features/teacher/exams/ResultPage'));
const ExplorePage          = lazy(() => import('@/features/teacher/courses/Explore'));
const StudentQuestionsPage = lazy(() => import('@/features/teacher/questions/QuestionsPage'));
const ClassroomsPage       = lazy(() => import('@/features/teacher/classrooms/ClassroomsPage'));
const ClassroomDetail      = lazy(() => import('@/features/teacher/classrooms/ClassroomDetail'));

function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      color: '#94A3B8'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(139, 92, 246, 0.2)',
        borderTopColor: '#8B5CF6',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      fetchMe();
    }
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [fetchMe]);

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>

          {/* ── Landing ───────────────────────────────────────────────────── */}
          <Route path="/"        element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms"   element={<TermsOfServicePage />} />

          {/* ── Auth ──────────────────────────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Admin ─────────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"                element={<AdminDashboard />} />
              <Route path="/admin/curriculum"     element={<CurriculumPage />} />
              <Route path="/admin/curriculum/:id" element={<CurriculumDetail />} />
              <Route path="/admin/materials"      element={<MaterialsPage />} />
              <Route path="/admin/questions"          element={<QuestionsPage />} />
              <Route path="/admin/question-generator" element={<QuestionGeneratorPage />} />
              <Route path="/admin/exams"              element={<ExamsAdminPage />} />
              <Route path="/admin/exams/:id"      element={<ExamDetail />} />
              <Route path="/admin/students"       element={<StudentsPage />} />
              <Route path="/admin/settings"       element={<SettingsPage />} />
              <Route path="/admin/certificates"   element={<CertificatesPage />} />
            </Route>
          </Route>

          {/* ── Onboarding (no layout) ───────────────────────────────── */}
          <Route element={<ProtectedRoute role={['student', 'teacher']} />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          {/* ── Teacher Dashboard & Learning ────────────────────────────────── */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route element={<StudentLayout />}>
              <Route path="/courses"                                           element={<CoursesPage />} />
              <Route path="/courses/:id"                                       element={<CurriculumDetail />} />
              <Route path="/materials"                                         element={<Navigate to="/explore" replace />} />
              <Route path="/subjects/:subjectId"                               element={<TopicsPage />} />
              <Route path="/topics/:topicId"                                   element={<SubjectPage />} />
              <Route path="/courses/subjects/:subjectId"                       element={<TopicsPage />} />
              <Route path="/courses/topics/:topicId"                           element={<SubjectPage />} />
              <Route path="/courses/:curriculumId/subjects"                    element={<SubjectsListPage />} />
              <Route path="/courses/:curriculumId/subjects/:subjectId"         element={<TopicsPage />} />
              <Route path="/courses/:curriculumId/subjects/:subjectId/topics/:topicId" element={<SubjectPage />} />
              <Route path="/classrooms"                                         element={<ClassroomsPage />} />
              <Route path="/classrooms/:id"                                     element={<ClassroomDetail />} />
              <Route path="/questions"                                         element={<StudentQuestionsPage />} />
              <Route path="/question-generator"                                element={<QuestionGeneratorPage isSimpleMode={true} />} />
              <Route path="/exams"                                             element={<ExamsStudentPage />} />
              <Route path="/explore"                                           element={<ExplorePage />} />
              <Route path="/profile"                                           element={<ProfilePage />} />
              <Route path="/premium"                                           element={<PremiumPage />} />
            </Route>
          </Route>

          {/* ── Student Dashboard & Learning ────────────────────────────────── */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route element={<StudentUserLayout />}>
              <Route path="/student/dashboard"          element={<StudentDashboardPage />} />
              <Route path="/student/classrooms"         element={<StudentClassroomsPage />} />
              <Route path="/student/classrooms/:id"     element={<StudentClassroomView />} />
              <Route path="/student/question-generator" element={<QuestionGeneratorPage isSimpleMode={true} />} />
              <Route path="/student/profile"            element={<ProfilePage />} />
              <Route path="/student/premium"            element={<PremiumPage />} />
              <Route path="/student/certificates"       element={<StudentCertificatesPage />} />
            </Route>
          </Route>

          {/* ── Unified Classroom Join Landing Page ── */}
          <Route path="/classroom/join/:inviteCode" element={<ClassroomJoinPage />} />

          {/* ── Shared Student/Teacher/Admin Exam Attempt & Results (Layout-Free) ── */}
          <Route element={<ProtectedRoute role={['student', 'teacher', 'admin']} />}>
            <Route path="/exams/:id/take"   element={<ExamTakePage />} />
            <Route path="/exams/:id/result" element={<ResultPage />} />
          </Route>

          {/* ── Public Certificate Verification ── */}
          <Route path="/certificate/:certificateId" element={<PublicCertificateVerification />} />

          {/* ── Payment ───────────────────────────────────────────────────── */}
          <Route path="/payment/success" element={<PaymentSuccess />} />

          {/* ── Fallback ──────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}