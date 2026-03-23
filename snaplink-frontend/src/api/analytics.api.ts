import api from './axios';
import type { AnalyticsData, Overview } from '../types';

export const analyticsApi = {
  getUrlAnalytics: async (id: string): Promise<AnalyticsData> => {
    const res = await api.get(`/api/analytics/${id}`);
    return res.data.data;
  },
  getOverview: async (): Promise<Overview> => {
    const res = await api.get('/api/analytics/overview');
    return res.data.data;
  },
  getPublicStats: async (shortCode: string): Promise<AnalyticsData> => {
    const res = await api.get(`/api/analytics/public/${shortCode}`);
    return res.data.data;
  },
  getFeed: async (): Promise<any[]> => {
    const res = await api.get('/api/analytics/feed');
    return res.data.data;
  },
  getGlobalStats: async (): Promise<{ totalUrls: number, totalClicks: number }> => {
    const res = await api.get('/api/analytics/global');
    return res.data.data;
  },
  getAggregateAnalytics: async (): Promise<AnalyticsData> => {
    const res = await api.get('/api/analytics/aggregate');
    return res.data.data;
  }
};
