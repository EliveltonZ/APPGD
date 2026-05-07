import type { RequestSituation } from '../../../../types/assistencia';
import { SITUATION_LABELS } from '../../../../data/assistenciaConfig';
import './index.css';

interface StatusBadgeProps {
  situacao: RequestSituation;
  urgente: 'sim' | 'nao';
}

export function StatusBadge({ situacao, urgente }: StatusBadgeProps) {
  const cls = `as-badge as-badge--${situacao.replace(/_/g, '-')}`;
  return (
    <div className="as-badges">
      <span className={cls}>{SITUATION_LABELS[situacao]}</span>
      {urgente === 'sim' && (
        <span className="as-badge as-badge--urgente">⚠ URGENTE</span>
      )}
    </div>
  );
}