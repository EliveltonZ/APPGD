import { DataTable } from "../../../components/DataTable";
import { StatusBadge } from "../StatusBadge";
import { TableFlag } from "../../../components/TableFlag";
import type { TableColumn } from "../../../types/table";
import type { StatusProject, ProjectStatus } from "../../../types/status";
import "./index.css";

function isoToBR(v: string | null | undefined): string {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

function fmtPrazo(days: number): string {
  if (days === 0) return "Hoje";
  if (days < 0) return `${Math.abs(days)}d atrás`;
  return `${days}d`;
}

const COLUMNS: TableColumn<StatusProject>[] = [
  {
    key: "total",
    label: "",
    minWidth: 36,
    render: (v) => <TableFlag active={(v as number) > 0} />,
  },
  { key: "numOC", label: "NumOC", filterable: true, sortable: true },
  { key: "pdd", label: "Pedido", filterable: true, sortable: true },
  { key: "e", label: "Etapa", filterable: true, sortable: true },
  { key: "cc", label: "C.C.", filterable: true, sortable: true },
  {
    key: "cliente",
    label: "Cliente",
    filterable: true,
    sortable: true,
    minWidth: 140,
  },
  { key: "contrato", label: "Contrato", filterable: true, sortable: true },
  { key: "nProjeto", label: "N° Projeto", filterable: true, sortable: true },
  {
    key: "ambiente",
    label: "Ambiente",
    filterable: true,
    sortable: true,
    minWidth: 140,
  },
  { key: "tipo", label: "Tipo", filterable: true, sortable: true },
  {
    key: "fabrica",
    label: "Fábrica",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
  {
    key: "entrega",
    label: "Entrega",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
  {
    key: "status",
    label: "Status",
    filterable: true,
    sortable: true,
    render: (v) => <StatusBadge status={v as ProjectStatus} />,
  },
  {
    key: "prazo",
    label: "Prazo",
    sortable: true,
    render: (_v, row) => {
      const late = row.prazo <= 0 && row.status !== "ENTREGUE";
      return (
        <span
          className={[late ? "st-prazo--late" : "", "text-center"].join(" ")}
        >
          {row.status === "ENTREGUE" ? "-" : fmtPrazo(row.prazo)}
        </span>
      );
    },
    align: "center",
  },
  {
    key: "iniciado",
    label: "Iniciado",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
  {
    key: "previsao",
    label: "Previsão",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
  {
    key: "pronto",
    label: "Pronto",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
  {
    key: "entregue",
    label: "Entregue",
    filterable: true,
    sortable: true,
    type: "date-iso",
    valueFormatter: isoToBR,
    render: (v) => <span>{isoToBR(v as string)}</span>,
  },
];

interface StatusTableProps {
  projects: StatusProject[];
  onRowClick: (project: StatusProject) => void;
  loading?: boolean;
  onFilteredDataChange?: (data: StatusProject[]) => void;
}

export function StatusTable({
  projects,
  onRowClick,
  loading,
  onFilteredDataChange,
}: StatusTableProps) {
  return (
    <DataTable<StatusProject>
      columns={COLUMNS}
      data={projects}
      rowKey="id"
      loading={loading}
      storageKey="dt:status"
      emptyMessage="Nenhum projeto encontrado para os filtros aplicados."
      onRowClick={onRowClick}
      onFilteredDataChange={onFilteredDataChange}
      rowClassName={(row) =>
        row.status === "ATRASADO" ? "st-row--atrasado" : ""
      }
    />
  );
}
