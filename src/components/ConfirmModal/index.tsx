import { useEffect } from "react";
import { CircleQuestionMark } from "lucide-react";
import { Button } from "../Button";
import "./index.css";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="confirm-dialog__icon">
          <CircleQuestionMark size={22} />
        </div>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          {onConfirm && (
            <Button variant="primary" size="sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
