import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map((toast) => {
          let accentBase = '#F37100'; // info
          if (toast.type === 'success') accentBase = '#4ADE80';
          if (toast.type === 'error') accentBase = '#F87171';

          return (
            <div key={toast.id} style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '16px',
              padding: '16px 20px',
              minWidth: '280px',
              boxShadow: '0 6px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
              position: 'relative',
              overflow: 'hidden',
              animation: 'slideInRight 0.3s ease-out forwards',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: '3px',
                background: accentBase
              }} />
              {toast.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
