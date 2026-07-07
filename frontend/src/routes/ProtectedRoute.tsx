import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects to /sign-in if there is no active Supabase session. If Supabase
// hasn't been configured yet (.env is still blank), enforcement is skipped
// so the click-through prototype keeps working until real credentials land.
export function ProtectedRoute() {
  const { session, isLoading, isConfigured } = useAuth();

  if (isLoading) return null;
  if (isConfigured && !session) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
