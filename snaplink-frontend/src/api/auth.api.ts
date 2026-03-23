import api from './axios';
import type { User } from '../types';

export const authApi = {
  signup: async (email: string, password: string, name?: string) => {
    const res = await api.post('/api/auth/signup', { email, password, name });
    return res.data.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data.data;
  },
  getMe: async (): Promise<{user: User}> => {
    const res = await api.get('/api/auth/me');
    return res.data.data;
  },
  updateMe: async (data: { name?: string, email?: string, currentPassword?: string, newPassword?: string }): Promise<{ user: User }> => {
    const res = await api.patch('/api/auth/me', data);
    return res.data.data;
  }
};
