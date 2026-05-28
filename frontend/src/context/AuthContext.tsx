import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type UserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdminOrAnalyst: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user data in the background to ensure validity
          const freshUser = await api.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          // Token might be invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      
      const userProfile: UserProfile = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
      };
      
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
    } catch (err: any) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid username or password';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const isAdminOrAnalyst = user !== null && (user.role === 'Admin' || user.role === 'Analyst');

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAdminOrAnalyst }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
