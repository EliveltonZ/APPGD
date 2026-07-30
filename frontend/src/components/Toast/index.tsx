import { CheckCircle, XCircle } from 'lucide-react'
import type { ToastItem } from '../../context/ToastContext'
import './index.css'

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}${t.exiting ? ' toast--out' : ''}`}
        >
          <span className="toast__icon">
            {t.type === 'success' ? <CheckCircle size={17} /> : <XCircle size={17} />}
          </span>
          <span className="toast__msg">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
