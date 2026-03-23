import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  actionButton?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, title, actionButton }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', 
      backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ 
        marginLeft: '220px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          height: '64px',
          padding: '0 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(5,0,7,0.7)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: 5
        }}>
          <div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              color: 'white', 
              letterSpacing: '-0.5px',
              margin: '0 0 2px 0'
            }}>{title}</h1>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)' }}>
              {today}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {actionButton}
            <div 
              onClick={() => navigate('/profile')}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', background: 'var(--fire-gradient)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
                fontWeight: 700, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)',
                fontSize: '14px', position: 'relative'
              }}
              title={user?.name || 'Profile'}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: '24px 28px', 
          overflowY: 'auto', 
          flex: 1,
          position: 'relative',
          zIndex: 1
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};
