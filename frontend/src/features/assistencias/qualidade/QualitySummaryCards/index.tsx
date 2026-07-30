import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { SummaryCard } from '../../../../components/SummaryCard';
import type { QualitySummary } from '../../../../types/qualityControl';
import './index.css';

interface Props {
  summary: QualitySummary;
  loading?: boolean;
}

const CARDS = [
  { key: 'total'      as const, label: 'Total de Itens',       accent: '#2080c5', icon: <ClipboardList size={13} /> },
  { key: 'pendentes'  as const, label: 'Pendentes de Análise', accent: '#b45309', icon: <Clock         size={13} /> },
  { key: 'analisados' as const, label: 'Analisados',           accent: '#0a8e00', icon: <CheckCircle2  size={13} /> },
];

export function QualitySummaryCards({ summary, loading }: Props) {
  return (
    <div className="qc-cards">
      {CARDS.map(({ key, label, accent, icon }) => (
        <SummaryCard
          key={key}
          label={label}
          value={summary[key]}
          accent={accent}
          icon={icon}
          loading={loading}
        />
      ))}
    </div>
  );
}