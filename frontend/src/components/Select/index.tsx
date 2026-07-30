import type { SelectHTMLAttributes } from "react";
import "./index.css";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder = "Selecione...",
  id,
  className = "",
  ...props
}: SelectProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`select-group${error ? " select-has-error" : ""}`}>
      {label && (
        <label className="select-label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={fieldId}
          className={`select-field ${className}`.trim()}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="select-error-msg">{error}</span>}
    </div>
  );
}
