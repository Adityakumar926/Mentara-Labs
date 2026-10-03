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

// Landing (Eager root landing for instant loading, subpages lazy)
import LandingPage from '@/features/landing/LandingPage';
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      background: '#020617',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(0,212,255,0.06) 50%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        textAlign: 'center',
      }}>
        {/* Glowing Logo with Orbital Ring */}
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#00D4FF',
            borderRightColor: '#7C3AED',
            borderBottomColor: 'rgba(124,58,237,0.2)',
            animation: 'mentara-spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: '-14px',
            borderRadius: '50%',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            animation: 'mentara-pulse 2s ease-in-out infinite',
          }} />
          <img
            src="/mentara-new.png"
            alt="Mentara Labs"
            style={{
              width: '54px',
              height: '54px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))',
            }}
          />
        </div>

        {/* Text & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #F5F0E8 0%, #C4B5FD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Mentara Labs
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00D4FF',
              boxShadow: '0 0 8px #00D4FF',
              animation: 'mentara-pulse 1.4s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'rgba(245, 240, 232, 0.55)',
              letterSpacing: '0.04em',
            }}>
              Loading interactive lab...
            </span>
          </div>
        </div>

        {/* Shimmer loading bar */}
        <div style={{
          width: '140px',
          height: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
          marginTop: '0.25rem',
        }}>
          <div style={{
            position: 'absolute',
            height: '100%',
            width: '45%',
            background: 'linear-gradient(90deg, #7C3AED, #00D4FF)',
            borderRadius: '999px',
            animation: 'mentara-bar 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes mentara-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mentara-pulse { 0%, 100% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes mentara-bar {
          0% { left: -45%; }
          50% { left: 55%; width: 55%; }
          100% { left: 100%; width: 45%; }
        }
      `}</style>
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