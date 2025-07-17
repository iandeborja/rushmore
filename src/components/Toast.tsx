"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-[300px] p-4 rounded-xl shadow-lg transform transition-all duration-300 ease-out
              ${toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500 text-white"
              }
              animate-slide-in-from-right
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
                </span>
                <span className="font-light lowercase">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
} 