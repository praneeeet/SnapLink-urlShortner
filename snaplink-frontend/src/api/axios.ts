import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snaplink_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('snaplink_token');
      // Only redirect if trying to access a protected route explicitly
      const path = window.location.pathname;
      if (path.startsWith('/dashboard') || path.startsWith('/analytics')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
