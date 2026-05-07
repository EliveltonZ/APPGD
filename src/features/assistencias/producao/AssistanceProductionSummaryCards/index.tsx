import { LayoutList, FolderOpen, Wrench, PackageCheck, PackageX, Truck } from 'lucide-react';
import { SummaryCard } from '../../../../components/SummaryCard';
import type { AssistanceSummary } from '../../../../types/assistenciaProducao';
import './index.css';

interface SummaryCardsProps {
  summary: AssistanceSummary;
  loading?: boolean;
}

const CARDS = [
  { key: 'total'       as const, label: 'Total',        accent: '#2080c5', icon: <LayoutList    size={13} /> },
  { key: 'emAberto'    as const, label: 'Em Aberto',    accent: '#5a5265', icon: <FolderOpen    size={13} /> },
  { key: 'iniciadas'   as const, label: 'Iniciadas',    accent: '#a07a00', icon: <Wrench        size={13} /> },
  { key: 'prontas'     as const, label: 'Prontas',      accent: '#0a8e00', icon: <PackageCheck  size={13} /> },
  { key: 'semMaterial' as const, label: 'Sem Material', accent: '#bb4400', icon: <PackageX      size={13} /> },
  { key: 'entregues'   as const, label: 'Entregues',    accent: '#0065ad', icon: <Truck         size={13} /> },
];

export function AssistanceProductionSummaryCards({ summary, loading }: SummaryCardsProps) {
  return (
    <div className="ap-cards">
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