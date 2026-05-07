import { Clock, Factory, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SummaryCard } from '../../../components/SummaryCard';
import './index.css';

interface SummaryCounts {
  aguardando: number;
  em_producao: number;
  concluido: number;
  atrasado: number;
}

interface StatusSummaryCardsProps {
  counts: SummaryCounts;
  loading?: boolean;
}

export function StatusSummaryCards({ counts, loading }: StatusSummaryCardsProps) {
  return (
    <div className="st-cards">
      <SummaryCard label="Aguardando"   value={counts.aguardando}   accent="var(--text)"    icon={<Clock         size={13} />} loading={loading} />
      <SummaryCard label="Em Produção"  value={counts.em_producao}  accent="var(--accent)"  icon={<Factory       size={13} />} loading={loading} />
      <SummaryCard label="Concluídos"   value={counts.concluido}    accent="#16a34a"         icon={<CheckCircle2  size={13} />} loading={loading} />
      <SummaryCard label="Atrasados"    value={counts.atrasado}     accent="var(--accent2)" icon={<AlertTriangle size={13} />} loading={loading} />
    </div>
  );
}