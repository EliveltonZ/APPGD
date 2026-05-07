import type { InputHTMLAttributes } from 'react'
import './index.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`input-group ${error ? 'input-has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className="input-field" {...props} />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}
