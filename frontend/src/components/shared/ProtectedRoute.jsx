import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ role }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    if (location.pathname === '/discover-thinking-style' || location.pathname === '/student/learning-compass') {
      try {
        sessionStorage.setItem('mentara_post_auth_redirect', '/discover-thinking-style');
      } catch (e) {
        // ignore
      }
      return <Navigate to="/register?redirect=/discover-thinking-style" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(role) ? role : role ? [role] : [];
  if (role && !roles.includes(user.role)) {
    // Redirect to the correct dashboard instead of login
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/courses' : '/student/dashboard'} replace />;
  }

  // Redirect student/teacher to onboarding if not onboarded yet
  const isClassroomPath = location.pathname.startsWith('/classroom/join/') || location.pathname.startsWith('/student/classrooms');
  const isThinkingStylePath = location.pathname === '/discover-thinking-style' || location.pathname === '/student/learning-compass';
  if (['student', 'teacher'].includes(user.role) && !user.onboarded && location.pathname !== '/onboarding' && !isClassroomPath && !isThinkingStylePath) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect student/teacher away from onboarding if already onboarded
  if (['student', 'teacher'].includes(user.role) && user.onboarded && location.pathname === '/onboarding') {
    return <Navigate to={user.role === 'teacher' ? '/courses' : '/student/dashboard'} replace />;
  }

  return <Outlet />;
}