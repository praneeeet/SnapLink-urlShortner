import api from './axios';
import type { Url, PaginationMeta } from '../types';

export const urlsApi = {
  getUrls: async (params?: any): Promise<{ urls: Url[], meta: PaginationMeta }> => {
    const res = await api.get('/api/urls', { params });
    // Backend returns { success: true, data: [...], meta: { ... } }
    return { 
      urls: res.data.data || [], 
      meta: res.data.meta 
    };
  },
  createUrl: async (body: any): Promise<{ url: Url }> => {
    const res = await api.post('/api/urls', body);
    // Backend returns { success: true, data: { ...url } }
    return { url: res.data.data };
  },
  updateUrl: async (id: string, body: any): Promise<{ url: Url }> => {
    const res = await api.patch(`/api/urls/${id}`, body);
    return { url: res.data.data };
  },
  deleteUrl: async (id: string) => {
    const res = await api.delete(`/api/urls/${id}`);
    return res.data;
  },
  bulkUpload: async (file: File) => {
    const formData = new FormData();
    formData.append('csv', file); // Backend expects 'csv'
    const res = await api.post('/api/urls/bulk', formData);
    return res.data.data;
  }
};
