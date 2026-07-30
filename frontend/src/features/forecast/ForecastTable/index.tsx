import { useMemo } from "react";
import { DataTable } from "../../../components/DataTable";
import { TableFlag } from "../../../components/TableFlag";
import type { TableColumn } from "../../../components/DataTable";
import type {
  ForecastProject,
  ForecastProjectStatus,
  ForecastStageStatus,
} from "../../../types/forecast";
import { FORECAST_PROJECT_STATUS_LABELS } from "../../../data/forecastConfig";
import { StatusBadge } from "../StatusBadge";
import "./index.css";

const STAGE_COLORS: Record<ForecastStageStatus, string> = {
  FINALIZADO: "#16a34a",
  INICIADO: "#ca8a04",
  AGUARDE: "var(--border)",
  PAUSADO: "var(--atrasado)",
};

const STAGE_TITLES: Record<ForecastStageStatus, string> = {
  FINALIZADO: "Finalizado",
  INICIADO: "Em andamento",
  AGUARDE: "Aguardando",
  PAUSADO: "Pausado",
};

function StageDot({
  status,
  title,
}: {
  status: ForecastStageStatus;
  title: string;
}) {
  return (
    <span
      className="fcst-table__dot"
      style={{ background: STAGE_COLORS[status] }}
      title={`${title}: ${STAGE_TITLES[status]}`}
    />
  );
}

function fmtPrazo(days: number): string {
  if (days === 0) return "Hoje";
  if (days < 0) return `${Math.abs(days)}d atr.`;
  return `${days}d`;
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

type ForecastRow = {
  id: number;
  seq: number;
  numOC: string;
  pedido: string;
  total: number;
  e: string;
  corteCC: string;
  lote: string;
  cliente: string;
  contrato: string;
  ambiente: string;
  status: ForecastProjectStatus;
  prazo: number;
  entrega: string;
  previsao: string;
  _corte: ForecastStageStatus;
  _custom: ForecastStageStatus;
  _coladeira: ForecastStageStatus;
  _usinagem: ForecastStageStatus;
  _montagem: ForecastStageStatus;
  _paineis: ForecastStageStatus;
  _separacao: ForecastStageStatus;
  _acabamento: ForecastStageStatus;
  _embalagem: ForecastStageStatus;
};

const COLUMNS: TableColumn<ForecastRow>[] = [
  {
    key: "total",
    label: "",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => <TableFlag active={(v as number) > 0} />,
  },
  { key: "seq", label: "N°", sortable: false, filterable: false, minWidth: 48 },
  { key: "numOC", label: "OC", minWidth: 88 },
  { key: "pedido", label: "Pedido", filterable: false },
  { key: "e", label: "E", minWidth: 32 },
  { key: "corteCC", label: "C.C." },
  { key: "lote", label: "Lote" },
  { key: "cliente", label: "Cliente", minWidth: 140 },
  { key: "contrato", label: "Contrato" },
  { key: "ambiente", label: "Ambiente", minWidth: 120 },
  {
    key: "status",
    label: "Status",
    minWidth: 100,
    render: (v) => (
      <StatusBadge
        status={v as string}
        label={FORECAST_PROJECT_STATUS_LABELS[v as ForecastProjectStatus]}
      />
    ),
  },
  {
    key: "prazo",
    label: "Prazo",
    filterable: false,
    render: (v) => fmtPrazo(v as number),
  },
  {
    key: "_corte",
    label: "Crt",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => <StageDot status={v as ForecastStageStatus} title="Corte" />,
  },
  {
    key: "_coladeira",
    label: "Cld",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Coladeira" />
    ),
  },
  {
    key: "_custom",
    label: "Cst",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Customização" />
    ),
  },
  {
    key: "_usinagem",
    label: "Usn",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Usinagem" />
    ),
  },
  {
    key: "_paineis",
    label: "Pan",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Painéis" />
    ),
  },
  {
    key: "_montagem",
    label: "Mnt",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Montagem" />
    ),
  },
  {
    key: "_acabamento",
    label: "Acb",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Acabamento" />
    ),
  },
  {
    key: "_embalagem",
    label: "Emb",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Embalagem" />
    ),
  },
  {
    key: "_separacao",
    label: "Sep",
    sortable: false,
    filterable: false,
    minWidth: 30,
    render: (v) => (
      <StageDot status={v as ForecastStageStatus} title="Separação" />
    ),
  },
  {
    key: "previsao",
    label: "Previsão",
    filterable: false,
    render: (v, row) => {
      const diff = (v as string) && row.entrega && (v as string) !== row.entrega;
      return (
        <span className={diff ? "row--previsao-alt" : ""}>
          {fmtDate(v as string)}
        </span>
      );
    },
  },
];

export type { ForecastRow };

interface ForecastTableProps {
  projects: ForecastProject[];
  onSelect: (project: ForecastProject) => void;
  onFilteredRowsChange?: (rows: ForecastRow[]) => void;
  loading?: boolean;
}

export function ForecastTable({
  projects,
  onSelect,
  onFilteredRowsChange,
  loading,
}: ForecastTableProps) {
  const rows = useMemo<ForecastRow[]>(
    () =>
      projects.map((p, i) => ({
        id: p.id,
        seq: i + 1,
        numOC: p.numOC,
        pedido: p.pedido,
        total: p.total,
        e: p.e,
        corteCC: p.corteCC,
        lote: p.lote,
        cliente: p.cliente,
        contrato: p.contrato,
        ambiente: p.ambiente,
        status: p.status,
        prazo: p.diasRestantes,
        entrega: p.entrega,
        previsao: p.previsao,
        _corte: p.stages.corte,
        _custom: p.stages.custom,
        _coladeira: p.stages.coladeira,
        _usinagem: p.stages.usinagem,
        _montagem: p.stages.montagem,
        _paineis: p.stages.paineis,
        _separacao: p.stages.separacao,
        _acabamento: p.stages.acabamento,
        _embalagem: p.stages.embalagem,
      })),

    [projects],
  );

  function handleRowClick(row: ForecastRow) {
    const project = projects.find((p) => p.id === row.id);
    if (project) onSelect(project);
  }

  return (
    <DataTable<ForecastRow>
      columns={COLUMNS}
      data={rows}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum projeto encontrado."
      onRowClick={handleRowClick}
      onFilteredDataChange={onFilteredRowsChange}
      rowClassName={(row) =>
        row.status === "ATRASADO" ? "fcst-table__row--atrasado" : ""
      }
    />
  );
}
