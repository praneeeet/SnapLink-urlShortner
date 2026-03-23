import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { analyticsApi } from '../api/analytics.api';
import type { AnalyticsData } from '../types';
import { formatNumber, formatDate, timeAgo, healthColor, formatCountry } from '../utils/format';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const GlobalAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getAggregateAnalytics();
        setData(res);
      } catch (e) {
        console.error("Global analytics fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderBreakdown = (items: any[]) => {
    if (!items || !items.length) return <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>No data yet</div>;
    const itemsArray = Array.isArray(items) ? items : [];
    const sum = itemsArray.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0) || 1;
    return itemsArray.slice(0, 5).map((item, idx) => {
      const rawName = item.country || item.device || item.browser || item.os || item.referrer_source || item.name || 'Unknown';
      const name = item.country ? formatCountry(item.country) : rawName;
      const count = Number(item.count) || 0;
      const pct = Math.min(Math.round((count / sum) * 100), 100);
      return (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '80px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name}</div>
          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'var(--fire-gradient)', borderRadius: '3px', boxShadow: '0 0 8px rgba(217,34,0,0.3)' }} />
          </div>
          <div style={{ width: '35px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{pct}%</div>
        </div>
      );
    });
  };

  if (loading || !data) {
    return (
      <AppShell title="Global Analytics">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#D92200', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </AppShell>
    );
  }

  const heatmapCounts = data.hourlyHeatmap ? data.hourlyHeatmap.map((h: any) => Number(h.clicks)) : Array(24).fill(0);
  const maxClicks = Math.max(...heatmapCounts, 1);

  return (
    <AppShell title="Global Analytics">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
        {[
          { label: 'Total Links', value: data.totalUrls || 0, sub: 'active urls', accent: '#D92200' },
          { label: 'Total Clicks', value: formatNumber(data.totalClicks || 0), sub: 'across all links', accent: '#F3500A' },
          { label: 'Unique Visitors', value: formatNumber(data.uniqueVisitors || 0), sub: 'total reach', accent: '#F37100' },
          { label: 'Health Score', value: isNaN(data.healthScore) ? '0' : Math.round(data.healthScore).toString(), sub: 'overall performance', accent: healthColor(data.healthScore) }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)',
            borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: stat.accent as string, filter: 'blur(45px)', opacity: 0.15, borderRadius: '50%' }} />
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: 600 }}>{stat.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontWeight: 600 }}>Combined Traffic — Last 30 Days</div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyClicks}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => { const parts = formatDate(val).split(' '); return `${parts[0]} ${parts[1] || ''}`.replace(',', ''); }} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#08000a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#D92200' }} />
                <Bar dataKey="clicks" fill="url(#fireGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F3500A" />
                    <stop offset="100%" stopColor="#920004" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontWeight: 600 }}>Top Regions (All URLs)</div>
          <div>{renderBreakdown(data.countryBreakdown || [])}</div>
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontWeight: 600 }}>Global Heatmap — Clicks by Hour</div>
        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
          {heatmapCounts.map((count, i) => {
            let bg = 'rgba(255,255,255,0.04)';
            const ratio = count / maxClicks;
            if (count > 0) {
              if (ratio <= 0.25) bg = 'rgba(217,34,0,0.2)';
              else if (ratio <= 0.5) bg = 'rgba(217,34,0,0.4)';
              else if (ratio <= 0.75) bg = 'rgba(217,34,0,0.7)';
              else bg = '#D92200';
            }
            return (
              <div key={i} title={`${count} clicks at ${i}:00`} style={{
                flex: 1, aspectRatio: '1/1', background: bg, borderRadius: '5px',
                boxShadow: ratio > 0.8 ? '0 0 12px rgba(217,34,0,0.4)' : 'none',
                transition: 'all 0.3s'
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {[
          { title: 'Global Device Mix', bd: data.deviceBreakdown },
          { title: 'Global Browser Mix', bd: data.browserBreakdown },
          { title: 'Top Global Referrers', bd: data.referrerBreakdown }
        ].map((col, i) => (
          <div key={i} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>{col.title}</div>
            <div>{renderBreakdown(col.bd || [])}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', paddingBottom: '12px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>Global Recent Activity</div>
        <div>
          {data.recentVisits && data.recentVisits.map((visit: any, i) => (
            <div key={visit.id || i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0',
              borderBottom: i < data.recentVisits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', minWidth: '80px' }}>{timeAgo(visit.visited_at)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>{visit.urlTitle || 'Untitled'}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--accent-color)' }}>/{visit.shortCode}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{visit.country} • {visit.device}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>{visit.referrer_source}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};
