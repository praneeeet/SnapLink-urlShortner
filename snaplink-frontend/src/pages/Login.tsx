import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await authApi.login(email, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Orb Backgrounds */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '300px', height: '300px', background: '#920004', filter: 'blur(120px)', opacity: 0.3, borderRadius: '50%', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '400px', height: '400px', background: '#F37100', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(217,34,0,0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1 }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          background: 'var(--fire-gradient)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          boxShadow: '0 4px 24px rgba(217,34,0,0.5)'
        }}>
          <ArrowRight color="white" size={24} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>SnapLink</h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>Shorten. Track. Grow.</p>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: 'var(--glass-border)',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', marginBottom: '24px' }}>Sign in to your SnapLink account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 500 }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
                padding: '11px 14px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(243,53,10,0.50)';
                e.target.style.boxShadow = '0 0 0 3px rgba(243,53,10,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.10)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
                padding: '11px 14px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(243,53,10,0.50)';
                e.target.style.boxShadow = '0 0 0 3px rgba(243,53,10,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.10)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.5)',
              borderRadius: '8px',
              padding: '12px',
              color: '#F87171',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button disabled={loading} type="submit" style={{
            width: '100%',
            background: 'var(--fire-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: '9px',
            padding: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(217,34,0,0.42)',
            opacity: loading ? 0.7 : 1,
            marginTop: '8px',
            transition: 'transform 0.1s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' }}>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>or</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
