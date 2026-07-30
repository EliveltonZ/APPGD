import { DataTable } from "../../../../components/DataTable";
import type { TableColumn } from "../../../../components/DataTable";
import type {
  AssistanceProduction,
  AssistanceStatus,
} from "../../../../types/assistenciaProducao";
import { StatusBadge } from "../StatusBadge";
import "./index.css";

function DeadlineBadge({
  dias,
  prazo,
}: {
  dias: number | null;
  prazo: string;
}) {
  if (!prazo || prazo === "—") return <span className="ap-prazo">—</span>;
  if (dias !== null && dias < 0)
    return <span className="ap-prazo ap-prazo--vencido">{prazo}</span>;
  if (dias !== null && dias <= 2)
    return <span className="ap-prazo ap-prazo--critico">{prazo}</span>;
  return <span className="ap-prazo">{prazo}</span>;
}

const COLUMNS: TableColumn<AssistanceProduction>[] = [
  {
    key: "urgente",
    label: "",
    type: "text",
    align: "center",
    render: (v) =>
      v === "sim" ? (
        <span className="ap-urgente-icon" title="Urgente">
          !
        </span>
      ) : null,
  },
  {
    key: "num",
    label: "N°",
    type: "number",
    sortable: true,
    render: (v) => <span className="ap-num">{v as number}</span>,
  },
  {
    key: "numSolicitacao",
    label: "Solicitação",
    type: "text",
    filterable: true,
    sortable: true,
  },
  {
    key: "corte",
    label: "Corte",
    type: "text",
    filterable: true,
    sortable: true,
  },
  {
    key: "numContrato",
    label: "Contrato",
    type: "text",
    filterable: true,
    sortable: true,
  },
  {
    key: "cliente",
    label: "Cliente",
    type: "text",
    filterable: true,
    sortable: true,
  },
  {
    key: "ambiente",
    label: "Ambiente",
    type: "text",
    filterable: true,
    sortable: true,
  },
  { key: "dataHora", label: "Data", type: "text" },
  {
    key: "prazo",
    label: "Prazo",
    type: "text",
    render: (_v, row) => (
      <DeadlineBadge dias={row.prazoDias} prazo={row.prazo} />
    ),
  },
  {
    key: "status",
    label: "Status",
    type: "text",
    filterable: true,
    render: (v) => <StatusBadge status={v as AssistanceStatus} />,
  },
  {
    key: "iniciado",
    label: "Iniciado",
    type: "text",
    render: (v) => <span>{(v as string) || "—"}</span>,
  },
  {
    key: "previsao",
    label: "Previsão",
    type: "text",
    render: (v) => <span>{(v as string) || "—"}</span>,
  },
  {
    key: "pronto",
    label: "Pronto",
    type: "text",
    render: (v) => <span>{(v as string) || "—"}</span>,
  },
  {
    key: "entregue",
    label: "Entregue",
    type: "text",
    render: (v) => <span>{(v as string) || "—"}</span>,
  },
];

interface TableProps {
  data: AssistanceProduction[];
  loading?: boolean;
  onRowClick: (row: AssistanceProduction) => void;
  storageKey?: string;
}

export function Table({
  data,
  loading,
  onRowClick,
  storageKey = "dt:assistencias-producao",
}: TableProps) {
  return (
    <DataTable<AssistanceProduction>
      columns={COLUMNS}
      data={data}
      rowKey="id"
      loading={loading}
      storageKey={storageKey}
      emptyMessage="Nenhuma assistência encontrada para os filtros aplicados."
      onRowClick={onRowClick}
      rowClassName={(row) => (row.urgente === "sim" ? "ap-row--urgente" : "")}
    />
  );
}
