import React, { useState } from 'react';
import { urlsApi } from '../../api/urls.api';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../Modal';
import { useModal } from '../../contexts/ModalContext';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export const BulkImportModal: React.FC = () => {
  const { modalType, closeModal, modalProps } = useModal();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: any[], failed: any[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUploadSize = async () => {
    if (!file) {
      addToast('Please select a file first', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await urlsApi.bulkUpload(file);
      setResult(res);
      addToast(`Import complete: ${res.success.length} succeeded, ${res.failed.length} failed.`, 'info');
      if (modalProps.onSuccess) modalProps.onSuccess();
    } catch (err: any) {
      addToast('Failed to upload CSV', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setResult(null);
    closeModal();
  };

  if (modalType !== 'BULK') return null;

  return (
    <Modal isOpen={true} onClose={resetAndClose} title="Bulk CSV Import">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!result ? (
            <>
              <div style={{ padding: '16px', background: 'rgba(255,113,0,0.05)', border: '1px dashed rgba(255,113,0,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', lineHeight: '1.5' }}>
                  Upload a CSV file with your URLs. Use a column named <strong>'url'</strong>, <strong>'link'</strong>, <strong>'destination'</strong>, or <strong>'long_url'</strong>.
                </div>
              </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%'
                }}
              />
              <div style={{
                height: '120px', border: '2px dashed rgba(255,113,0,0.1)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '12px', background: file ? 'rgba(217,34,0,0.05)' : 'rgba(0,0,0,0.2)',
                borderColor: file ? 'rgba(217,34,0,0.3)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
                position: 'relative',
                zIndex: 1
              }}>
                <Upload size={32} style={{ color: file ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)' }} />
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 20px' }}>
                  {file ? file.name : 'Tap to select or drag CSV'}
                </div>
              </div>
            </div>

            <button 
              onClick={(e) => { e.preventDefault(); handleUploadSize(); }}
              disabled={!file || loading}
              style={{
                background: 'var(--fire-gradient)', color: 'white', border: 'none', borderRadius: '12px',
                padding: '14px', fontWeight: 700, cursor: (!file || loading) ? 'not-allowed' : 'pointer', 
                opacity: (!file || loading) ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(217,34,0,0.4)', marginTop: '8px'
              }}
            >
              {loading ? 'Processing...' : 'Start Import'}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, padding: '16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                <CheckCircle size={24} style={{ color: '#4ADE80', marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{result.success.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Success</div>
              </div>
              <div style={{ flex: 1, padding: '16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                <AlertCircle size={24} style={{ color: '#F87171', marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{result.failed.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Failed</div>
              </div>
            </div>

            {result.failed.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Error Details</div>
                {result.failed.map((f, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#F87171', marginBottom: '4px', display: 'flex', gap: '8px' }}>
                    <span style={{ opacity: 0.5 }}>Row {f.row}:</span> {f.reason}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={resetAndClose}
              style={{
                background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
