import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ role }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    // Redirect to the correct dashboard instead of login
    return <Navigate to={user.role === 'admin' ? '/admin' : '/courses'} replace />;
  }

  return <Outlet />;
}