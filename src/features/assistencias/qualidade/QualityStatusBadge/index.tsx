import type { AnalysisStatus } from '../../../../types/qualityControl';
import './index.css';

const LABELS: Record<AnalysisStatus, string> = {
  pendente:  'Pendente',
  analisado: 'Analisado',
};

interface QualityStatusBadgeProps {
  status: AnalysisStatus;
}

export function QualityStatusBadge({ status }: QualityStatusBadgeProps) {
  return (
    <span className={`qc-badge qc-badge--${status}`}>
      <span className="qc-badge__dot" />
      {LABELS[status]}
    </span>
  );
}