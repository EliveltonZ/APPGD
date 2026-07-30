import type { CSSProperties, ReactNode } from 'react';
import './index.css';

interface SummaryCardProps {
  label: string;
  value: string | number;
  accent?: string;
  icon?: ReactNode;
  secondary?: string;
  loading?: boolean;
}

export function SummaryCard({ label, value, accent, icon, secondary, loading }: SummaryCardProps) {
  return (
    <div className="sc-card" style={{ '--sc-accent': accent } as CSSProperties}>
      {icon ? (
        <div className="sc-card__header">
          <span className="sc-card__icon">{icon}</span>
          <span className="sc-card__label">{label}</span>
        </div>
      ) : (
        <span className="sc-card__label">{label}</span>
      )}
      <span className={`sc-card__value${loading ? ' sc-card__value--loading' : ''}`}>
        {loading ? '—' : value}
      </span>
      {secondary && !loading && <span className="sc-card__secondary">{secondary}</span>}
    </div>
  );
}