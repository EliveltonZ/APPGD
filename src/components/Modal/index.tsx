import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import './index.css'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: number
}

export function Modal({ title, isOpen, onClose, children, maxWidth = 520 }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          <h2 className="modal__title" id="modal-title">
            {title}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            type="button"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
