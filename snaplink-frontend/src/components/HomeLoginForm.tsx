import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { authApi } from '../api/auth.api';

export const HomeLoginForm: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.login(email, password);
      login(res.token, res.user);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(30px) saturate(160%)',
      border: 'var(--glass-border)',
      borderRadius: '24px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Sign in directly</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>To manage your links and view analytics</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
            <Mail size={18} />
          </div>
          <input 
            type="email" 
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '14px 14px 14px 48px', color: 'white', fontSize: '15px', outline: 'none',
              transition: 'all 0.2s', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
            <Lock size={18} />
          </div>
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '14px 14px 14px 48px', color: 'white', fontSize: '15px', outline: 'none',
              transition: 'all 0.2s', boxSizing: 'border-box'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: 'var(--fire-gradient)', color: 'white', border: 'none', borderRadius: '12px',
            padding: '14px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 8px 24px rgba(217,34,0,0.35)', opacity: loading ? 0.7 : 1, transition: 'all 0.3s'
          }}
        >
          {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In Now</>}
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Don't have an account? <span onClick={() => navigate('/signup')} style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }}>Create one here</span>
        </div>
      </form>
    </div>
  );
};
