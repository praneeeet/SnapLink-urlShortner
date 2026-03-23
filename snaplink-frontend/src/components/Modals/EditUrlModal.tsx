import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { urlsApi } from '../../api/urls.api';
import { useToast } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';
import { ToggleLeft as ToggleIcon, Calendar, MousePointer2 } from 'lucide-react';

export const EditUrlModal: React.FC = () => {
  const { modalType, closeModal, modalProps } = useModal();
  const { addToast } = useToast();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<number | ''>('');
  const [isPublicStats, setIsPublicStats] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalType === 'EDIT' && modalProps.url) {
      const u = modalProps.url;
      setUrl(u.original_url || '');
      setTitle(u.title || '');
      setExpiresAt(u.expires_at ? new Date(u.expires_at).toISOString().split('T')[0] : '');
      setMaxClicks(u.max_clicks || '');
      setIsPublicStats(u.is_public_stats || false);
      setIsActive(u.is_active !== undefined ? u.is_active : true);
    }
  }, [modalType, modalProps.url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    try {
      setLoading(true);
      await urlsApi.updateUrl(modalProps.url.id, {
        originalUrl: formattedUrl,
        title,
        expiresAt: expiresAt || null,
        maxClicks: maxClicks === '' ? null : Number(maxClicks),
        isPublicStats,
        isActive
      });
      addToast('Link updated successfully!', 'success');
      if (modalProps.onSuccess) modalProps.onSuccess();
      closeModal();
    } catch (err) {
      addToast('Failed to update link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={modalType === 'EDIT'} onClose={closeModal} title="Edit Link Settings">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Destination URL</label>
          <input 
            type="url" 
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Display Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              <Calendar size={14} /> Expiration
            </label>
            <input 
              type="date" 
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '11px 16px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
              <MousePointer2 size={14} /> Click Limit
            </label>
            <input 
              type="number" 
              placeholder="No limit"
              value={maxClicks}
              onChange={(e) => setMaxClicks(e.target.value ? parseInt(e.target.value) : '')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Public Analytics</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Allow anyone to view stats</div>
            </div>
            <button 
              type="button"
              onClick={() => setIsPublicStats(!isPublicStats)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isPublicStats ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s'
              }}
            >
              <ToggleIcon size={28} style={{ transform: isPublicStats ? 'rotate(0deg)' : 'rotate(180deg)' }} />
            </button>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Link Active</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Toggle link availability</div>
            </div>
            <button 
              type="button"
              onClick={() => setIsActive(!isActive)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#4ADE80' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                transition: 'all 0.2s'
              }}
            >
              <ToggleIcon size={28} style={{ transform: isActive ? 'rotate(0deg)' : 'rotate(180deg)' }} />
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          style={{
            marginTop: '8px',
            background: 'var(--fire-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(217,34,0,0.4)'
          }}
        >
          {loading ? 'Saving Changes...' : 'Update Link Settings'}
        </button>
      </form>
    </Modal>
  );
};
