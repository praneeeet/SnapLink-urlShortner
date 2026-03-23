export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  totalUrls: number;
  totalClicks: number;
}

export interface Url {
  id: string;
  short_code: string;
  original_url: string;
  title?: string;
  favicon_url?: string;
  clicks: number;
  is_active: boolean;
  is_public_stats: boolean;
  expires_at?: string;
  max_clicks?: number;
  last_visited_at?: string;
  created_at: string;
  sparkline: number[];
}

export interface Visit {
  id: string;
  visited_at: string;
  country: string;
  device: string;
  browser: string;
  os: string;
  referrer_source: string;
}

export interface AnalyticsData {
  url: Url;
  totalUrls?: number;
  totalClicks: number;
  uniqueVisitors: number;
  lastVisited: string | null;
  healthScore: number;
  dailyClicks: { date: string; clicks: number }[];
  hourlyHeatmap: number[];
  deviceBreakdown: { name: string; count: number }[];
  browserBreakdown: { name: string; count: number }[];
  osBreakdown: { name: string; count: number }[];
  countryBreakdown: { name: string; count: number }[];
  referrerBreakdown: { name: string; count: number }[];
  recentVisits: Visit[];
}

export interface Overview {
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  topUrl: Url | null;
  topCountry: { country: string; count: number } | null;
  bestHour: { hour: number; count: number } | null;
  totalUrls: number;
  totalClicks: number;
  urls: Url[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
