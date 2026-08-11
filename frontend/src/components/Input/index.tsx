import { useRef, useCallback } from "react";
import type { InputHTMLAttributes } from "react";
import "./index.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  uppercase?: boolean;
}

export function Input({
  label,
  error,
  id,
  className = "",
  uppercase,
  onChange,
  ref: _ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (uppercase) {
        const start = e.target.selectionStart ?? 0;
        const end   = e.target.selectionEnd   ?? 0;
        e.target.value = e.target.value.toUpperCase();
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(start, end);
        });
      }
      onChange?.(e);
    },
    [uppercase, onChange],
  );

  return (
    <div
      className={`input-group ${error ? "input-has-error" : ""} ${className}`.trim()}
    >
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        autoComplete="off"
        id={inputId}
        className="input-field"
        ref={inputRef}
        onChange={handleChange}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}