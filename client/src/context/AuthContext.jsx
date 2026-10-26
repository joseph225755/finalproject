import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('interntrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('interntrack_token'));
  const [loading, setLoading] = useState(true);

  // Re-verify session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('interntrack_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('interntrack_user', JSON.stringify(res.user));
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('interntrack_token');
          localStorage.removeItem('interntrack_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('interntrack_token', res.token);
      localStorage.setItem('interntrack_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('interntrack_token', res.token);
      localStorage.setItem('interntrack_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('interntrack_token');
      localStorage.removeItem('interntrack_user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('interntrack_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        updateUser
      }}
    >
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
