import { Layers, Play, AlertTriangle, CalendarClock } from "lucide-react";
import { SummaryCard } from "../../../components/SummaryCard";
import "./index.css";

interface ForecastSummaryCardsProps {
  total: number;
  iniciados: number;
  atrasados: number;
  aVencer: number;
  loading?: boolean;
}

export function ForecastSummaryCards({
  total,
  iniciados,
  atrasados,
  aVencer,
  loading,
}: ForecastSummaryCardsProps) {
  return (
    <div className="fcst-cards">
      <SummaryCard
        label="Total de Projetos"
        value={total}
        accent="var(--text-h)"
        icon={<Layers size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Iniciados"
        value={iniciados}
        accent="var(--iniciado)"
        icon={<Play size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="A Vencer"
        value={aVencer}
        accent="#d97706"
        icon={<CalendarClock size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Atrasados"
        value={atrasados}
        accent="var(--accent2)"
        icon={<AlertTriangle size={13} />}
        loading={loading}
      />
    </div>
  );
}
