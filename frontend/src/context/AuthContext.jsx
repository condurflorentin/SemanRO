/**
 * AuthContext — gestionează starea de autentificare globală.
 * Token-ul JWT e în cookie HTTP-only (nu e accesibil din JS = protecție XSS).
 * Starea user-ului se verifică prin GET /api/auth/me.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifică dacă utilizatorul e autentificat (cookie valid)
  // Folosim un request simplu — dacă nu e logat, primim 401 și setăm user=null
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (email, full_name, password) => {
    const { data } = await api.post('/auth/register', { email, full_name, password });
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
