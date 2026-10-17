'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckIcon } from './Icons';

type Toast = { id: number; message: string };
type ToastApi = { push: (message: string) => void };

const ToastContext = createContext<ToastApi>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3200);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-[var(--radius-card)] border border-accent/40 bg-surface-2/95 px-4 py-3 text-[0.85rem] text-ink shadow-2xl backdrop-blur"
          >
            <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
