import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/api/login', { username, password });
    localStorage.setItem('sessionId', response.data.sessionId);
    localStorage.setItem('userRole', response.data.role);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const sessionId = localStorage.getItem('sessionId');
    await api.post('/api/logout', { sessionId });
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('sessionId');
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};