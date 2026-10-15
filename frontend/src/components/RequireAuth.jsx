import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children, admin }) {
  const { user, setAuthOpen } = useAuth();
  useEffect(() => { if (!user) setAuthOpen(true); }, [user, setAuthOpen]);
  if (!user) return <Navigate to="/" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/account" replace />;
  return children;
}
