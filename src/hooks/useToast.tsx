"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (message: string, options?: { variant?: ToastVariant; action?: Toast["action"] }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastVariant, { ring: string; icon: string; iconBg: string }> = {
  success: { ring: "ring-emerald-200", icon: "✓", iconBg: "bg-emerald-100 text-emerald-700" },
  error: { ring: "ring-red-200", icon: "!", iconBg: "bg-red-100 text-red-700" },
  info: { ring: "ring-slate-200", icon: "i", iconBg: "bg-brand-100 text-brand-700" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, options) => {
      const id = nextId.current++;
      setToasts((prev) => [
        ...prev.slice(-2),
        { id, message, variant: options?.variant ?? "success", action: options?.action },
      ]);
      window.setTimeout(() => dismiss(id), options?.action ? 6000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => {
          const s = STYLES[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ${s.ring}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.iconBg}`}>
                {s.icon}
              </span>
              <p className="flex-1 text-sm text-slate-700">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(t.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
