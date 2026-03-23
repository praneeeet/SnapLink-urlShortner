import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth.api';
import { useToast } from '../contexts/ToastContext';
import { AppShell } from '../components/AppShell';
import { User, Mail, Lock, CheckCircle, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.updateMe({
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      updateUser(res.user);
      addToast('Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell title="Profile Settings">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
          {/* Information Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
             }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', background: 'var(--fire-gradient)',
                  margin: '0 auto 16px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '32px', fontWeight: 'bold', color: 'white', border: '4px solid rgba(255,255,255,0.1)'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{user.name || 'User'}</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Member since {new Date(user.created_at).toLocaleDateString()}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                   <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', flex: 1 }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Links</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{user.totalUrls || 0}</div>
                   </div>
                   <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', flex: 1 }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Clicks</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{user.totalClicks || 0}</div>
                   </div>
                </div>
             </div>

             <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: 'var(--glass-border)',
                borderRadius: '16px',
                padding: '24px'
             }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} color="var(--accent-color)" /> Security Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Password</span>
                      <span style={{ color: '#4ADE80' }}>Secure</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>2FA</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>Disabled</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Last Login</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Today</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Form Column */}
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: 'var(--glass-border)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Display Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '15px', outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(243,53,10,0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '15px', outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(243,53,10,0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>Update Password</h4>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input 
                      type="password" 
                      placeholder="Required to set new password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '15px', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <CheckCircle size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                    <input 
                      type="password" 
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '15px', outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                style={{
                  background: 'var(--fire-gradient)', color: 'white', border: 'none', borderRadius: '12px',
                  padding: '16px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(217,34,0,0.4)', transition: 'all 0.2s', fontSize: '16px'
                }}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
