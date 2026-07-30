import type { ReactNode } from 'react'
import './index.css'

interface FormSectionProps {
  step: number
  title: string
  children: ReactNode
}

export function FormSection({ step, title, children }: FormSectionProps) {
  return (
    <section className="form-section">
      <div className="form-section__header">
        <span className="form-section__step">{step}</span>
        <h3 className="form-section__title">{title}</h3>
      </div>
      <div className="form-section__body">{children}</div>
    </section>
  )
}
