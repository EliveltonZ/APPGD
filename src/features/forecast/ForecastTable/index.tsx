import { useMemo } from "react";
import { Flag } from "lucide-react";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import type {
  ForecastProject,
  ForecastProjectStatus,
  StageStatus,
} from "../../../types/forecast";
import { FORECAST_PROJECT_STATUS_LABELS } from "../../../data/forecastConfig";
import { StatusBadge } from "../StatusBadge";
import "./index.css";

interface ForecastTableProps {
  projects: ForecastProject[];
  onSelect: (project: ForecastProject) => void;
  loading?: boolean;
}

type ForecastRow = {
  id: number;
  numOC: string;
  pedido: string;
  urgente: boolean;
  e: string;
  corteCC: string;
  lote: string;
  cliente: string;
  contrato: string;
  ambiente: string;
  status: ForecastProjectStatus;
  prazo: string;
  previsao: string;
  _corte: StageStatus;
  _customizacao: StageStatus;
  _coladeira: StageStatus;
  _usinagem: StageStatus;
  _painel: StageStatus;
  _montagem: StageStatus;
  _acabamento: StageStatus;
  _embalagem: StageStatus;
};

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const STAGE_COLORS: Record<StageStatus, string> = {
  nao_iniciado: "var(--border)",
  em_andamento: "#ca8a04",
  pausado: "#f97316",
  concluido: "#16a34a",
  atrasado: "var(--accent2)",
};

const STAGE_TITLES: Record<StageStatus, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
  atrasado: "Atrasado",
};

function StageDot({
  status,
  stageKey,
}: {
  status: StageStatus;
  stageKey?: string;
}) {
  return (
    <span
      className="fcst-table__dot"
      style={{ background: STAGE_COLORS[status] }}
      title={`${stageKey} ${STAGE_TITLES[status]}`}
    />
  );
}

const COLUMNS: TableColumn<ForecastRow>[] = [
  { key: "id", label: "N°", sortable: true, filterable: false, minWidth: 48 },
  {
    key: "urgente",
    label: "!",
    sortable: false,
    filterable: false,
    minWidth: 24,
    render: (v) => (v ? <Flag size={12} className="fcst-table__flag" /> : null),
  },
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
  { key: "prazo", label: "Prazo", type: "date-br", filterable: false },
  {
    key: "_corte",
    label: "Crt",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => <StageDot status={v as StageStatus} stageKey={"Corte"} />,
  },
  {
    key: "_customizacao",
    label: "Cst",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => (
      <StageDot status={v as StageStatus} stageKey={"Customização"} />
    ),
  },
  {
    key: "_coladeira",
    label: "Cld",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => (
      <StageDot status={v as StageStatus} stageKey={"Coladeira"} />
    ),
  },
  {
    key: "_usinagem",
    label: "Usn",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => <StageDot status={v as StageStatus} stageKey={"Usinagem"} />,
  },
  {
    key: "_painel",
    label: "Pan",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => <StageDot status={v as StageStatus} stageKey={"Paineis"} />,
  },
  {
    key: "_montagem",
    label: "Mnt",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => <StageDot status={v as StageStatus} stageKey={"Montagem"} />,
  },
  {
    key: "_acabamento",
    label: "Acb",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => (
      <StageDot status={v as StageStatus} stageKey={"Acabamento"} />
    ),
  },
  {
    key: "_embalagem",
    label: "Emb",
    sortable: false,
    filterable: false,
    minWidth: 36,
    render: (v) => (
      <StageDot status={v as StageStatus} stageKey={"Embalagem"} />
    ),
  },
  { key: "previsao", label: "Previsão", type: "date-br", filterable: false },
];

export function ForecastTable({ projects, onSelect, loading }: ForecastTableProps) {
  const rows = useMemo<ForecastRow[]>(
    () =>
      projects.map((p) => ({
        id: p.id,
        numOC: p.numOC,
        pedido: p.pedido,
        urgente: p.urgente,
        e: p.e,
        corteCC: p.corteCC,
        lote: p.lote,
        cliente: p.cliente,
        contrato: p.contrato,
        ambiente: p.ambiente,
        status: p.status,
        prazo: fmtDate(p.prazo),
        previsao: fmtDate(p.previsao),
        _corte: p.stages.corte?.status ?? "nao_iniciado",
        _customizacao: p.stages.customizacao?.status ?? "nao_iniciado",
        _coladeira: p.stages.coladeira?.status ?? "nao_iniciado",
        _usinagem: p.stages.usinagem?.status ?? "nao_iniciado",
        _painel: p.stages.painel?.status ?? "nao_iniciado",
        _montagem: p.stages.montagem?.status ?? "nao_iniciado",
        _acabamento: p.stages.acabamento?.status ?? "nao_iniciado",
        _embalagem: p.stages.embalagem?.status ?? "nao_iniciado",
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
      rowClassName={(row) =>
        row.status === "atrasado" ? "fcst-table__row--atrasado" : ""
      }
    />
  );
}
