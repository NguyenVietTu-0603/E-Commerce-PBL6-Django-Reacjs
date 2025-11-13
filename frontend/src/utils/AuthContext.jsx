import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const apiUser = await authService.getCurrentUser();
          setUser(apiUser);
          localStorage.setItem('user', JSON.stringify(apiUser));
        } catch (err) {
          console.warn('Auth: token invalid, clearing', err);
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const getDefaultRoute = (userType) => {
    switch(userType) {
      case 'admin': return '/admin/dashboard';
      case 'seller': return '/seller/dashboard';
      case 'buyer': return '/dashboard';
      default: return '/dashboard';
    }
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    const defaultRoute = getDefaultRoute(data.user.user_type);
    navigate(defaultRoute);
    return { success: true };
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    const defaultRoute = getDefaultRoute(data.user.user_type);
    navigate(defaultRoute);
    return { success: true };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    isSeller: user?.user_type === 'seller',
    isBuyer: user?.user_type === 'buyer',
    getDefaultRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
