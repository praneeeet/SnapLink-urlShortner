import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { SparkLine } from '../components/SparkLine';
import { analyticsApi } from '../api/analytics.api';
import { urlsApi } from '../api/urls.api';
import type { Overview, Url } from '../types';
import { formatNumber, truncateUrl, healthColor, getShortUrl } from '../utils/format';
import { Plus, Search, BarChart2, TrendingUp, Clock, Globe, Copy, QrCode, Edit2, Trash2, Database } from 'lucide-react';

import { useModal } from '../contexts/ModalContext';
import { useToast } from '../contexts/ToastContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { addToast } = useToast();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Expired'>('All');
  const [search, setSearch] = useState('');
  const [feed, setFeed] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, urlsResult] = await Promise.all([
        analyticsApi.getOverview(),
        urlsApi.getUrls()
      ]);
      setOverview(overviewData);
      setUrls(urlsResult?.urls || []);
    } catch (e) {
      console.error("Dashboard data fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchFeed = async () => {
      try {
        const feedData = await analyticsApi.getFeed();
        setFeed(feedData);
      } catch (err) {}
    };
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (shortCode: string) => {
    navigator.clipboard.writeText(getShortUrl(shortCode));
    addToast('Link copied to clipboard!', 'success');
  };

  const handleDelete = (id: string) => {
    openModal('DELETE', { 
      id, 
      onSuccess: () => fetchData() 
    });
  };

  const handleEdit = (url: Url) => {
    openModal('EDIT', { 
      url, 
      onSuccess: () => fetchData() 
    });
  };

  const handleQR = (short_code: string) => {
    openModal('QR', { short_code });
  };

  const handleNewLink = () => {
    openModal('CREATE', { 
      onSuccess: () => fetchData() 
    });
  };

  const filteredUrls = (urls || []).filter(u => {
    if (filter === 'Active' && !u.is_active) return false;
    if (filter === 'Expired' && u.is_active) return false;
    if (search && !(u.original_url || '').toLowerCase().includes(search.toLowerCase()) && 
        !(u.title && u.title.toLowerCase().includes(search.toLowerCase())) &&
        !(u.short_code || '').toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <AppShell 
      title="Dashboard" 
      actionButton={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToast('Opening Bulk Import...', 'info');
              openModal('BULK', { onSuccess: fetchData });
            }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px',
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Database size={16} /> Bulk Import
          </button>
          <button 
            onClick={handleNewLink}
            style={{
              background: 'var(--fire-gradient)',
              color: 'white', border: 'none', borderRadius: '9px',
              padding: '10px 16px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(217,34,0,0.42)'
            }}
          >
            <Plus size={16} /> New Link
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Card 1 */}
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: 'var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--glass-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '20px', width: '3px', background: 'linear-gradient(to bottom, #D92200, transparent)', borderRadius: '0 3px 3px 0' }} />
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#D92200', filter: 'blur(35px)', opacity: 0.45, borderRadius: '50%' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217,34,0,0.1)', border: '1px solid rgba(217,34,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <BarChart2 size={16} color="#D92200" />
                </div>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Links</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{loading ? '-' : formatNumber(overview?.totalUrls)}</div>
            </div>

            {/* Card 2 */}
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: 'var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--glass-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '20px', width: '3px', background: 'linear-gradient(to bottom, #F3500A, transparent)', borderRadius: '0 3px 3px 0' }} />
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#F3500A', filter: 'blur(35px)', opacity: 0.45, borderRadius: '50%' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(243,80,10,0.1)', border: '1px solid rgba(243,80,10,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <TrendingUp size={16} color="#F3500A" />
                </div>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Clicks</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{loading ? '-' : formatNumber(overview?.totalClicks)}</div>
              {overview?.clicksThisMonth ? (
                <div style={{ fontSize: '11px', color: '#4ADE80', background: 'rgba(74,222,128,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>+{formatNumber(overview.clicksThisMonth)} this month</div>
              ) : null}
            </div>

            {/* Card 3 */}
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: 'var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--glass-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '20px', width: '3px', background: 'linear-gradient(to bottom, #F37100, transparent)', borderRadius: '0 3px 3px 0' }} />
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#F37100', filter: 'blur(35px)', opacity: 0.45, borderRadius: '50%' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(243,113,0,0.1)', border: '1px solid rgba(243,113,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Clock size={16} color="#F37100" />
                </div>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Clicks Today</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{loading ? '-' : formatNumber(overview?.clicksToday)}</div>
              {overview?.clicksThisWeek ? (
                <div style={{ fontSize: '11px', color: '#4ADE80', background: 'rgba(74,222,128,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>+{formatNumber(overview.clicksThisWeek)} this week</div>
              ) : null}
            </div>

            {/* Card 4 */}
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: 'var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--glass-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', left: 0, top: '20px', bottom: '20px', width: '3px', background: 'linear-gradient(to bottom, #920004, transparent)', borderRadius: '0 3px 3px 0' }} />
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#920004', filter: 'blur(35px)', opacity: 0.45, borderRadius: '50%' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(146,0,4,0.1)', border: '1px solid rgba(146,0,4,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Globe size={16} color="#F37100" />
                </div>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Top Country</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loading ? '-' : (overview?.topCountry?.country || 'N/A')}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)' }}>of traffic</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '340px' }}>
              <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input 
                type="text"
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px',
                  padding: '9px 12px 9px 36px',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Active', 'Expired'].map(f => {
                const isActive = filter === f;
                return (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    style={{
                      background: isActive ? 'rgba(243,53,10,0.12)' : 'var(--glass-bg)',
                      border: isActive ? '1px solid rgba(243,53,10,0.26)' : 'var(--glass-border)',
                      color: isActive ? '#F37100' : 'var(--text-secondary)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >{f}</button>
                )
              })}
            </div>
          </div>

          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: 'var(--glass-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--glass-shadow)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(250px, 2fr) 1.5fr 1fr 1fr 100px 160px',
              gap: '16px',
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.28)',
              fontWeight: 600
            }}>
              <div>Link</div>
              <div>Short URL</div>
              <div>Clicks</div>
              <div>Trend 7D</div>
              <div>Health</div>
              <div>Actions</div>
            </div>

            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px' }}>
                  <div style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                </div>
              ))
            ) : filteredUrls.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  <Globe size={24} />
                </div>
                <div style={{ color: 'white', fontWeight: 500, marginBottom: '8px' }}>No links found</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create a new link to get started</div>
              </div>
            ) : (
              filteredUrls.map(url => {
                const hColor = healthColor(url.is_active ? 85 : 0);
                return (
                  <div key={url.id} style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(250px, 2fr) 1.5fr 1fr 1fr 100px 160px',
                    gap: '16px',
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(217,34,0,0.15)', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#F37100', fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                      }}>
                        {url.title ? url.title.charAt(0).toUpperCase() : url.original_url.replace('https://', '').replace('http://', '').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {url.title || truncateUrl(url.original_url, 30)}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {truncateUrl(url.original_url, 40)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        fontFamily: `'Geist Mono', monospace`, color: '#F37100', fontSize: '13px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {getShortUrl(url.short_code)}
                      </div>
                      <button onClick={() => handleCopy(url.short_code)} style={{ 
                        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '4px', display: 'flex'
                      }} title="Copy">
                        <Copy size={12} />
                      </button>
                    </div>

                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{formatNumber(url.clicks)}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>total</div>
                    </div>

                    <div>
                      <SparkLine data={url.sparkline || [0,0,0,0,0,0,0]} />
                    </div>

                    <div>
                      <div style={{ 
                        background: `${hColor}22`, color: hColor, padding: '2px 8px', borderRadius: '10px', 
                        fontSize: '11px', fontWeight: 600, display: 'inline-block'
                      }}>
                        {url.is_active ? 'Active' : 'Expired'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => navigate(`/analytics/${url.id}`)} style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.6)'
                      }} title="Analytics">
                        <BarChart2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleQR(url.short_code)}
                        style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.6)'
                      }} title="QR Code">
                        <QrCode size={14} />
                      </button>
                      <button 
                        onClick={() => handleEdit(url)}
                        style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.6)'
                      }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(url.id)}
                        style={{
                        width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.6)',
                        transition: 'all 0.2s'
                      }} title="Delete" 
                      onMouseOver={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: 'var(--glass-border)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--glass-shadow)',
            position: 'sticky',
            top: '88px',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Activity</h3>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
              {feed.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '20px 0' }}>
                  No recent activity yet
                </div>
              ) : (
                feed.map(v => (
                  <div key={v.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      {v.country ? (
                         <img src={`https://flagcdn.com/w40/${v.country.toLowerCase()}.png`} width="20" alt={v.country} />
                      ) : '🌐'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Click on <span style={{ color: 'var(--accent-color)' }}>{v.shortCode}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        {v.city ? `${v.city}, ` : ''}{v.country || 'Unknown'} • {v.device || 'Desktop'}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
                      {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}</style>
    </AppShell>
  );
};
