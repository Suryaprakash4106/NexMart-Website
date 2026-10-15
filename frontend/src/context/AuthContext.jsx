import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => JSON.parse(localStorage.getItem('nm_user') || 'null'));
  const [authOpen, setAuthOpen] = useState(false);

  const setUser = useCallback((u) => {
    setUserState(u);
    u ? localStorage.setItem('nm_user', JSON.stringify(u)) : localStorage.removeItem('nm_user');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nm_token');
    setUser(null);
  }, [setUser]);

  const authenticate = async (mode, form) => {
    const d = await api(mode === 'register' ? '/auth/register' : '/auth/login', 'POST', form);
    localStorage.setItem('nm_token', d.token);
    setUser(d.user);
    setAuthOpen(false);
    return d.user;
  };

  useEffect(() => {
    if (localStorage.getItem('nm_token')) api('/users/me').then((d) => setUser(d.user)).catch(() => {});
    window.addEventListener('nm-logout', logout);
    return () => window.removeEventListener('nm-logout', logout);
  }, [logout, setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authenticate, authOpen, setAuthOpen }}>
      {children}
    </AuthContext.Provider>
  );
}
