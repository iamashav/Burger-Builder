import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { loggedOut } from '../store/authSlice';
import { useAppDispatch } from '../store/hooks';

export function LogoutPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loggedOut());
  }, [dispatch]);

  return <Navigate to="/" replace />;
}
