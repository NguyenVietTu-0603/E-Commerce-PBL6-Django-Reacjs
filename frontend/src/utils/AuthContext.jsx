import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

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
          try { localStorage.setItem('user', JSON.stringify(apiUser)); } catch {}
        } catch (err) {
          console.warn('Auth: cannot fetch current user, falling back to saved user', err);
          const saved = localStorage.getItem('user');
          if (saved) {
            try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('user'); }
          } else {
            setUser(null);
          }
        }
      } else {
        const saved = localStorage.getItem('user');
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('user'); }
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // ⬇️ THÊM: Helper function để redirect theo role
  const getDefaultRoute = (userType) => {
    switch(userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'seller':
        return '/seller/dashboard';
      case 'buyer':
      default:
        return '/dashboard';
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login');
      const data = await authService.login(username, password);
      
      console.log('✅ AuthContext: Login successful');
      console.log('User data:', data.user);
      
      setUser(data.user);
      
      // ⬇️ SỬA: Redirect theo user_type
      const defaultRoute = getDefaultRoute(data.user.user_type);
      console.log(`📍 Redirecting ${data.user.user_type} to: ${defaultRoute}`);
      navigate(defaultRoute);
      
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 AuthContext: Attempting registration');
      const data = await authService.register(userData);
      
      console.log('✅ AuthContext: Registration successful');
      setUser(data.user);
      
      // ⬇️ SỬA: Redirect theo user_type
      const defaultRoute = getDefaultRoute(data.user.user_type);
      navigate(defaultRoute);
      
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 AuthContext: Logging out');
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const updateUser = useCallback((updatedUser) => {
    console.log('📝 Updating user:', updatedUser);
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
    getDefaultRoute, // ⬅️ Export để dùng ở component khác
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};