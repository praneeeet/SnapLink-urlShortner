import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsApi } from '../api/analytics.api';
import type { AnalyticsData } from '../types';
import { formatNumber, formatDate } from '../utils/format';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const PublicStats: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (shortCode) {
          const res = await analyticsApi.getPublicStats(shortCode);
          setData(res);
        }
      } catch (e: any) {
        if (e.response?.status === 403) {
          setError('Stats for this link are private');
        } else {
          setError('Link not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortCode]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ fontSize: '24px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>{error}</div>
        <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', background: 'rgba(243,113,0,0.1)', padding: '8px 16px', borderRadius: '8px' }}>Go to homepage</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--fire-gradient)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>&#8594;</span>
          </div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>SnapLink</span>
        </div>
      </header>

      <main style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Public Stats for {data.url.short_code}</h1>
          <a href={data.url.original_url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>{data.url.original_url}</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Clicks</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{formatNumber(data.totalClicks)}</div>
          </div>
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Created</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{formatDate(data.url.created_at)}</div>
          </div>
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Status</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: data.url.is_active ? '#4ADE80' : '#F87171' }}>{data.url.is_active ? 'Active' : 'Expired'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Daily Clicks</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyClicks}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => { const parts = formatDate(val).split(' '); return `${parts[0]} ${parts[1] || ''}`.replace(',', ''); }} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D92200' }} itemStyle={{ color: '#D92200' }} />
                <Bar dataKey="clicks" fill="#D92200" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Countries</div>
            {data.countryBreakdown.slice(0, 5).map((item, i) => {
              const sum = data.countryBreakdown.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
              const pct = Math.min(Math.round(((item.count || 0) / sum) * 100), 100);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '60px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || 'Unknown'}</div>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'var(--fire-gradient)', borderRadius: '2px' }} />
                  </div>
                  <div style={{ width: '30px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{pct}%</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Devices</div>
            {data.deviceBreakdown.slice(0, 5).map((item, i) => {
              const sum = data.deviceBreakdown.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
              const pct = Math.min(Math.round(((item.count || 0) / sum) * 100), 100);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '60px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || 'Unknown'}</div>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'var(--fire-gradient)', borderRadius: '2px' }} />
                  </div>
                  <div style={{ width: '30px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
