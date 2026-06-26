import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ role }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    // Redirect to the correct dashboard instead of login
    return <Navigate to={user.role === 'admin' ? '/admin' : '/courses'} replace />;
  }

  // Redirect student to onboarding if not onboarded yet
  if (user.role === 'student' && !user.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect student away from onboarding if already onboarded
  if (user.role === 'student' && user.onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
}