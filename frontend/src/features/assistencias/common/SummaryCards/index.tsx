import {
  LayoutList,
  FolderOpen,
  Wrench,
  PackageCheck,
  PackageX,
  Truck,
} from "lucide-react";
import { SummaryCard } from "../../../../components/SummaryCard";
import type { AssistanceSummary } from "../../../../types/assistenciaProducao";
import "./index.css";

interface Props {
  summary: AssistanceSummary;
  loading?: boolean;
}

const CARDS = [
  {
    key: "total" as const,
    label: "Total",
    accent: "var(--text-h)",
    icon: <LayoutList size={13} />,
  },
  {
    key: "emAberto" as const,
    label: "Em Aberto",
    accent: "var(--aguardando)",
    icon: <FolderOpen size={13} />,
  },
  {
    key: "iniciadas" as const,
    label: "Iniciadas",
    accent: "var(--iniciado)",
    icon: <Wrench size={13} />,
  },
  {
    key: "prontas" as const,
    label: "Prontas",
    accent: "var(--pronto)",
    icon: <PackageCheck size={13} />,
  },
  {
    key: "semMaterial" as const,
    label: "Sem Material",
    accent: "var(--atrasado)",
    icon: <PackageX size={13} />,
  },
  {
    key: "entregues" as const,
    label: "Entregues",
    accent: "var(--entregue)",
    icon: <Truck size={13} />,
  },
];

export function SummaryCards({ summary, loading }: Props) {
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
