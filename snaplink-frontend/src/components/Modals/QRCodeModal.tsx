import React, { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { useModal } from '../../contexts/ModalContext';
import { getShortUrl } from '../../utils/format';
import { Download, Copy } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import QRCode from 'qrcode';

export const QRCodeModal: React.FC = () => {
  const { modalType, closeModal, modalProps } = useModal();
  const { addToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const shortUrl = getShortUrl(modalProps.short_code);

  useEffect(() => {
    if (modalType === 'QR' && modalProps.short_code) {
      QRCode.toDataURL(shortUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error(err);
        addToast('Failed to generate QR Code', 'error');
      });
    }
  }, [modalType, modalProps.short_code, shortUrl, addToast]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${modalProps.short_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shortUrl);
    addToast('Link copied!', 'success');
  };

  return (
    <Modal isOpen={modalType === 'QR'} onClose={closeModal} title="QR Code">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block', imageRendering: 'crisp-edges' }} />
          ) : (
            <div style={{ width: '200px', height: '200px', background: '#f5f5f5', borderRadius: '8px' }} />
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Short URL</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'Geist Mono' }}>{shortUrl.replace('http://', '')}</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button 
            onClick={copyUrl}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Copy size={18} /> Copy Link
          </button>
          <button 
            onClick={downloadQR}
            style={{
              flex: 1,
              background: 'var(--fire-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(217,34,0,0.4)'
            }}
          >
            <Download size={18} /> Download PNG
          </button>
        </div>
      </div>
    </Modal>
  );
};
