import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { urlsApi } from '../api/urls.api';
import { analyticsApi } from '../api/analytics.api';
import { getShortUrl } from '../utils/format';
import { Link as LinkIcon, Copy, QrCode, ArrowRight, BarChart2, Clock, MapPin, Database, Award } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import { HomeLoginForm } from '../components/HomeLoginForm';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { openModal } = useModal();
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [lastShortCode, setLastShortCode] = useState('');
  const [globalStats, setGlobalStats] = useState({ totalUrls: 0, totalClicks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await analyticsApi.getGlobalStats();
        setGlobalStats(stats);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (!user) {
      addToast('Please sign in to shorten links', 'info');
      navigate('/signup');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await urlsApi.createUrl({ originalUrl: url });
      const code = res.url.short_code;
      setLastShortCode(code);
      setShortUrl(getShortUrl(code));
      addToast('Link shortened successfully!', 'success');
      setUrl('');
    } catch (e) {
      console.error(e);
      addToast('Failed to shorten link. Please check the URL.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    addToast('Copied to clipboard!', 'success');
  };

  const handleQR = () => {
    openModal('QR', { short_code: lastShortCode });
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K+';
    return num.toLocaleString();
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <nav style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(13,0,5,0.7)',
        backdropFilter: 'blur(20px)', zIndex: 10, height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--fire-gradient)',
            borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>&#8594;</span>
          </div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>SnapLink</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Pricing</a>
          {user ? (
            <Link to="/dashboard" style={{
              background: 'var(--fire-gradient)', color: 'white', padding: '10px 20px',
              borderRadius: '9px', fontWeight: 600, fontSize: '14px', textDecoration: 'none'
            }}>Login</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in</Link>
              <Link to="/signup" style={{
                background: 'var(--fire-gradient)', color: 'white', padding: '10px 20px',
                borderRadius: '9px', fontWeight: 600, fontSize: '14px', textDecoration: 'none'
              }}>Get started free</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          border: '1px solid var(--primary-color)', background: 'rgba(217,34,0,0.1)',
          padding: '6px 14px', borderRadius: '50px', display: 'flex',
          alignItems: 'center', gap: '8px', marginBottom: '32px'
        }}>
          <div style={{ width: '6px', height: '6px', background: 'var(--primary-color)', borderRadius: '50%' }}></div>
          <span style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 500 }}>No account needed · Free forever</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '80px', width: '100%', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '64px', fontWeight: 900, textAlign: 'left', letterSpacing: '-2.5px', lineHeight: '1.1', marginBottom: '24px', margin: 0 }}>
              <div style={{ color: 'white' }}>Shorten. Share.</div>
              <div style={{ background: 'var(--fire-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Track everything.</div>
            </h1>
            <p style={{
              fontSize: '17px', color: 'rgba(255,255,255,0.38)', maxWidth: '440px', textAlign: 'left', marginBottom: '32px', lineHeight: '1.6'
            }}>
              Paste any URL and get a short link instantly. Sign in to unlock analytics, QR codes, and custom aliases.
            </p>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <form onSubmit={handleSubmit} style={{
                background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                border: 'var(--glass-border)', borderRadius: '16px', padding: '8px',
                display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--glass-shadow)',
                transition: 'border 0.3s'
              }}>
                <div style={{ paddingLeft: '16px', color: 'rgba(255,255,255,0.3)' }}>
                  <LinkIcon size={20} />
                </div>
                <input 
                  type="url" placeholder="https://example.com/very-long-url"
                  value={url} onChange={(e) => setUrl(e.target.value)} required
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
                />
                <button disabled={isSubmitting} type="submit" style={{
                  background: 'var(--fire-gradient)', color: 'white', border: 'none', borderRadius: '9px', padding: '12px 24px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(217,34,0,0.42)', opacity: isSubmitting ? 0.7 : 1
                }}>
                  Shorten <ArrowRight size={16} />
                </button>
              </form>
              {shortUrl && (
                <div style={{
                  marginTop: '16px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(243,53,10,0.3)', borderRadius: '16px', padding: '16px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.3s ease-out'
                }}>
                  <a href={shortUrl} target="_blank" rel="noreferrer" style={{ fontFamily: `'Geist Mono', monospace`, color: 'var(--accent-color)', fontSize: '16px', fontWeight: 600 }}>{shortUrl.replace('http://', '')}</a>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <Copy size={14} /> Copy
                    </button>
                    <button onClick={handleQR} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <QrCode size={14} /> QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {!user && (
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <HomeLoginForm />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '48px', marginTop: '80px', marginBottom: '60px' }}>
          {[
            { tag: formatCount(globalStats.totalUrls), label: 'Links created' },
            { tag: formatCount(globalStats.totalClicks), label: 'Clicks tracked' },
            { tag: '140+', label: 'Countries' },
            { tag: '99.9%', label: 'Uptime' }
          ].map((stat, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>{stat.tag}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</span>
              </div>
              {i < 3 && <div style={{ alignSelf: 'center', color: 'var(--border-color)', fontSize: '24px' }}>·</div>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', maxWidth: '800px', marginBottom: '80px' }}>
          {[
            { icon: <BarChart2 size={14}/>, label: 'Click Analytics' },
            { icon: <Clock size={14}/>, label: 'Expiry Dates' },
            { icon: <QrCode size={14}/>, label: 'QR Codes' },
            { icon: <LinkIcon size={14}/>, label: 'Custom Aliases' },
            { icon: <MapPin size={14}/>, label: 'Geo Tracking' },
            { icon: <Database size={14}/>, label: 'Bulk CSV' },
            { icon: <Award size={14}/>, label: 'Health Score' }
          ].map((pill, i) => (
            <div key={i} style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', borderRadius: '50px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
              <span style={{ color: 'var(--accent-color)', display: 'flex' }}>{pill.icon}</span>
              {pill.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '960px', width: '100%', marginBottom: '100px' }}>
          {[
            { tag: '01', title: 'Paste URL', desc: 'Enter any long URL to create a short link.' },
            { tag: '02', title: 'Get short link', desc: 'Copy your new shortened URL easily.' },
            { tag: '03', title: 'Track every click', desc: 'Monitor traffic with deep analytics.' }
          ].map((step, i) => (
            <div key={i} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '52px', fontWeight: 900, background: 'var(--fire-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', lineHeight: 1 }}>{step.tag}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}>RECENT LINKS — SIGN IN TO SEE YOURS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { domain: 'startup.com/pitch', code: 'snp.lk/pitch', clicks: 842, max: 1000 },
              { domain: 'github.com/repo', code: 'snp.lk/repo-a', clicks: 356, max: 1000 },
              { domain: 'dribbble.com/shot', code: 'snp.lk/design', clicks: 120, max: 1000 }
            ].map((link, i) => (
              <div key={i} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--glass-shadow)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.domain}</div>
                <div style={{ fontFamily: `'Geist Mono', monospace`, color: '#F37100', fontSize: '12px', marginBottom: '12px' }}>{link.code}</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${(link.clicks / link.max) * 100}%`, height: '100%', background: 'var(--fire-gradient)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>{link.clicks} clicks</span>
                  <span>US / Desktop</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
