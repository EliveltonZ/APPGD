import { Layers, Factory, AlertTriangle, CalendarX } from 'lucide-react';
import { SummaryCard } from '../../../components/SummaryCard';
import './index.css';

interface ForecastSummaryCardsProps {
  total: number;
  emProducao: number;
  atrasados: number;
  aguardandoPrevisao: number;
  loading?: boolean;
}

export function ForecastSummaryCards({
  total,
  emProducao,
  atrasados,
  aguardandoPrevisao,
  loading,
}: ForecastSummaryCardsProps) {
  return (
    <div className="fcst-cards">
      <SummaryCard label="Total de Projetos" value={total}              accent="var(--text-h)"  icon={<Layers        size={13} />} loading={loading} />
      <SummaryCard label="Em Produção"        value={emProducao}         accent="var(--accent)"  icon={<Factory       size={13} />} loading={loading} />
      <SummaryCard label="Atrasados"          value={atrasados}          accent="var(--accent2)" icon={<AlertTriangle size={13} />} loading={loading} />
      <SummaryCard label="Sem Previsão"       value={aguardandoPrevisao} accent="#d97706"         icon={<CalendarX     size={13} />} loading={loading} />
    </div>
  );
}