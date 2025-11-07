import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/users/login/', { username, password });
    const { user, tokens } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register/', userData);
    const { user, tokens } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await api.post('/users/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  updateProfile: async (userData) => {
    const response = await api.patch('/users/me/', userData);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.post('/users/change-password/', passwords);
    return response.data;
  },

  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/users/?${params}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.post(`/users/${userId}/status/`, { status });
    return response.data;
  },
};

export default authService;