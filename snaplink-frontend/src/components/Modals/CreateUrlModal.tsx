import React, { useState } from 'react';
import { Modal } from '../Modal';
import { urlsApi } from '../../api/urls.api';
import { useToast } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';
import { ChevronDown, ChevronUp, Calendar, MousePointer2, Type } from 'lucide-react';

export const CreateUrlModal: React.FC = () => {
  const { modalType, closeModal, modalProps } = useModal();
  const { addToast } = useToast();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<number | ''>('');
  const [isPublicStats, setIsPublicStats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    try {
      setLoading(true);
      await urlsApi.createUrl({ 
        originalUrl: formattedUrl, 
        title: title || undefined,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt || undefined,
        maxClicks: maxClicks === '' ? undefined : Number(maxClicks),
        isPublicStats
      });
      addToast('Link created successfully!', 'success');
      if (modalProps.onSuccess) modalProps.onSuccess();
      closeModal();
      resetForm();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setCustomAlias('');
    setExpiresAt('');
    setMaxClicks('');
    setIsPublicStats(false);
  };

  return (
    <Modal isOpen={modalType === 'CREATE'} onClose={closeModal} title="Create New Link">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Target URL</label>
          <input 
            type="url" 
            autoFocus
            required
            placeholder="https://example.com/very-long-link"
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
          <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Title (Optional)</label>
          <input 
            type="text" 
            placeholder="Marketing Pitch Website"
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

        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-color)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            width: 'fit-content'
          }}
        >
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                <Type size={14} /> Custom Alias
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0 16px' }}>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', paddingRight: '4px' }}>snp.lk/</span>
                <input 
                  type="text" 
                  placeholder="my-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 0',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                  <MousePointer2 size={14} /> Click Limit
                </label>
                <input 
                  type="number" 
                  placeholder="Unlimited"
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="public-stats"
                checked={isPublicStats}
                onChange={(e) => setIsPublicStats(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="public-stats" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer' }}>Make statistics public</label>
            </div>
          </div>
        )}

        <button 
          disabled={loading}
          type="submit" 
          style={{
            marginTop: '12px',
            background: 'var(--fire-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 16px rgba(217,34,0,0.4)',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Creating...' : 'Create Link'}
        </button>
      </form>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Modal>
  );
};
