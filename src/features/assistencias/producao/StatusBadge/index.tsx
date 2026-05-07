import type { AssistanceStatus } from '../../../../types/assistenciaProducao';
import { ASSISTANCE_STATUS_LABELS } from '../../../../data/assistenciaProducaoConfig';
import './index.css';

interface ApStatusBadgeProps {
  status: AssistanceStatus;
}

export function ApStatusBadge({ status }: ApStatusBadgeProps) {
  return (
    <span className={`ap-badge ap-badge--${status.replace(/_/g, '-')}`}>
      {ASSISTANCE_STATUS_LABELS[status]}
    </span>
  );
}