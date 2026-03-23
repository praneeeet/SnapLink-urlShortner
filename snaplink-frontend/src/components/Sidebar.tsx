import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart2, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { openModal } = useModal();

  const handleNewLink = () => {
    openModal('CREATE');
  };

  return (
    <aside style={{
      width: '220px',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(5,0,7,0.97)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10
    }}>
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'var(--fire-gradient)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 10px rgba(217,34,0,0.5)'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>&#8594;</span>
        </div>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>SnapLink</span>
      </div>

      <nav style={{
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
      }}>
        <NavLink to="/dashboard" style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '9px',
          color: isActive ? '#F37100' : 'rgba(255,255,255,0.42)',
          background: isActive ? 'rgba(243,53,10,0.12)' : 'transparent',
          border: isActive ? '1px solid rgba(243,53,10,0.26)' : '1px solid transparent',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s'
        })}>
          <LayoutGrid size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/analytics" end style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '9px',
          color: isActive ? '#F37100' : 'rgba(255,255,255,0.42)',
          background: isActive ? 'rgba(243,53,10,0.12)' : 'transparent',
          border: isActive ? '1px solid rgba(243,53,10,0.26)' : '1px solid transparent',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s'
        })}>
          <BarChart2 size={18} />
          Global Analytics
        </NavLink>
        
        <div 
          onClick={handleNewLink}
          style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '9px',
          color: 'rgba(255,255,255,0.42)',
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}>
          <Plus size={18} />
          New Link
        </div>
      </nav>

      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {user && (
          <NavLink to="/profile" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            borderRadius: '9px', textDecoration: 'none', cursor: 'pointer',
            background: isActive ? 'rgba(243,53,10,0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(243,53,10,0.26)' : '1px solid transparent',
            transition: 'all 0.2s'
          })}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--fire-gradient)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                View Profile
              </div>
            </div>
          </NavLink>
        )}
        
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#F87171',
            cursor: 'pointer',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
};
