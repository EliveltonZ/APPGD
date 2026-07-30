import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import "./index.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

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
        ref={ref}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});
