import { Clock, Factory, Truck, AlertTriangle } from "lucide-react";
import { SummaryCard } from "../../../components/SummaryCard";
import "./index.css";

interface SummaryCounts {
  aguardando: number;
  em_producao: number;
  atrasado: number;
  entregues: number;
}

interface StatusSummaryCardsProps {
  counts: SummaryCounts;
  loading?: boolean;
}

export function StatusSummaryCards({
  counts,
  loading,
}: StatusSummaryCardsProps) {
  return (
    <div className="st-cards">
      <SummaryCard
        label="Aguardando"
        value={counts.aguardando}
        accent="var(--aguardando)"
        icon={<Clock size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Em Produção"
        value={counts.em_producao}
        accent="var(--iniciado)"
        icon={<Factory size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Atrasados"
        value={counts.atrasado}
        accent="var(--atrasado)"
        icon={<AlertTriangle size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Entregues"
        value={counts.entregues}
        accent="var(--entregues)"
        icon={<Truck size={13} />}
        loading={loading}
      />
    </div>
  );
}
