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

  const finish = (d) => {
    localStorage.setItem('nm_token', d.token);
    setUser(d.user);
    setAuthOpen(false);
    return d.user;
  };

  // password login
  const authenticate = async (mode, form) => finish(await api('/auth/login', 'POST', form));
  // signup with email OTP: send, resend, verify
  const sendOtp = (form) => api('/auth/register/send-otp', 'POST', form);
  const resendOtp = (email) => api('/auth/register/resend-otp', 'POST', { email });
  const verifyOtp = async (email, otp) => finish(await api('/auth/register/verify-otp', 'POST', { email, otp }));

  useEffect(() => {
    if (localStorage.getItem('nm_token')) api('/users/me').then((d) => setUser(d.user)).catch(() => {});
    window.addEventListener('nm-logout', logout);
    return () => window.removeEventListener('nm-logout', logout);
  }, [logout, setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authenticate, sendOtp, resendOtp, verifyOtp, authOpen, setAuthOpen }}>
      {children}
    </AuthContext.Provider>
  );
}