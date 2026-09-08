import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { loggedOut } from '../store/authSlice';
import { burgerReset } from '../store/burgerSlice';
import { useAppDispatch } from '../store/hooks';

export function LogoutPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loggedOut());
    dispatch(burgerReset());
  }, [dispatch]);

  return <Navigate to="/" replace />;
}
