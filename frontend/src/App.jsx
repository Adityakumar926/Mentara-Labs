import { useEffect } from 'react';
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

// Landing
import LandingPage from '@/features/landing/LandingPage';
import PaymentSuccess from '@/features/payment/PaymentSuccess';

// Auth pages
import LoginPage    from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';

// Admin pages
import AdminDashboard   from '@/features/admin/dashboard/DashboardPage';
import CurriculumPage   from '@/features/admin/curriculum/CurriculumPage';
import CurriculumDetail from '@/features/admin/curriculum/CurriculumDetail';
import QuestionsPage    from '@/features/admin/questions/QuestionsPage';
import QuestionGeneratorPage from '@/features/admin/question_generator/QuestionGeneratorPage';
import ExamsAdminPage   from '@/features/admin/exams/ExamsPage';
import ExamDetail       from '@/features/admin/exams/ExamDetail';
import StudentsPage     from '@/features/admin/students/StudentsPage';
import SettingsPage     from '@/features/admin/settings/SettingsPage';
import CertificatesPage from '@/features/admin/certificates/CertificatesPage';

import MaterialsPage    from '@/features/admin/curriculum/MaterialsPage';

// Student pages
import OnboardingPage       from '@/features/auth/OnboardingPage';
import StudentDashboardPage from '@/features/student/dashboard/StudentDashboardPage';
import ProfilePage          from '@/features/student/profile/ProfilePage';
import PremiumPage          from '@/features/student/premium/PremiumPage';
import StudentCertificatesPage from '@/features/student/certificates/CertificatesPage';
import PublicCertificateVerification from '@/features/landing/PublicCertificateVerification';

// Teacher pages
import SubjectsListPage     from '@/features/teacher/courses/SubjectsListPage';
import CoursesPage          from '@/features/teacher/courses/CoursesPage';
import TopicsPage           from '@/features/teacher/courses/TopicsPage';
import SubjectPage          from '@/features/teacher/courses/SubjectPage';
import ExamsStudentPage     from '@/features/teacher/exams/ExamsPage';
import ExamTakePage         from '@/features/teacher/exams/ExamTakePage';
import ResultPage           from '@/features/teacher/exams/ResultPage';
import ExplorePage          from '@/features/teacher/courses/Explore';
import StudentQuestionsPage from '@/features/teacher/questions/QuestionsPage';

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  // Re-validates the session on every full page load and, as a side effect
  // (see authStore.fetchMe), reconnects the notification socket. Without
  // this, the socket only ever opens right after a fresh login/register.
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
    <AnimatePresence mode="wait">
      <Routes>

        {/* ── Landing ───────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

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
            <Route path="/student/question-generator" element={<QuestionGeneratorPage isSimpleMode={true} />} />
            <Route path="/student/profile"            element={<ProfilePage />} />
            <Route path="/student/premium"            element={<PremiumPage />} />
            <Route path="/student/certificates"       element={<StudentCertificatesPage />} />
          </Route>
        </Route>

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
  );
}