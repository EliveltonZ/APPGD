import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ToastStack } from "../components/Toast";

export type ToastType = "success" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  exiting: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 3500;
const EXIT_MS = 300;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      EXIT_MS,
    );
  }, []);

  const add = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, message, exiting: false }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const success = useCallback((msg: string) => add("success", msg), [add]);
  const error = useCallback((msg: string) => add("error", msg), [add]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
