import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-elevated border backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : t.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-accent shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
