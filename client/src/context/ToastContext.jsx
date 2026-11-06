import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = 'success', ttl = 3200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value = {
    toast: push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 4500),
    info: (m) => push(m, 'info'),
  };

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          return (
            <div key={t.id} className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lift animate-pop ${t.type === 'error' ? 'border-red-200 bg-red-50 text-red-900' : t.type === 'info' ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-green-200 bg-white text-ink'}`}>
              <Icon size={18} className={t.type === 'error' ? 'text-red-600' : t.type === 'info' ? 'text-sky-600' : 'text-green-600'} />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-ink" aria-label="Dismiss"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
