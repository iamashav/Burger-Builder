import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../store/authSlice';
import { useAppSelector } from '../store/hooks';

export function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
