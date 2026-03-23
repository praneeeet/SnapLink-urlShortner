import React, { useState } from 'react';
import { Modal } from '../Modal';
import { urlsApi } from '../../api/urls.api';
import { useToast } from '../../contexts/ToastContext';
import { useModal } from '../../contexts/ModalContext';

export const DeleteConfirmModal: React.FC = () => {
  const { modalType, closeModal, modalProps } = useModal();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!modalProps.id) return;
    try {
      setLoading(true);
      await urlsApi.deleteUrl(modalProps.id);
      addToast('Link deleted successfully', 'success');
      if (modalProps.onSuccess) modalProps.onSuccess();
      closeModal();
    } catch (err) {
      addToast('Failed to delete link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={modalType === 'DELETE'} onClose={closeModal} title="Delete Link">
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          Are you sure you want to delete this link? This action is permanent and will remove all associated analytics.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            disabled={loading}
            onClick={closeModal}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={handleDelete}
            style={{
              flex: 1,
              background: '#F87171',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(248,113,113,0.3)'
            }}
          >
            {loading ? 'Deleting...' : 'Delete Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
