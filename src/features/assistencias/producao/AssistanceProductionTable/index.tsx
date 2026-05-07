import { DataTable } from '../../../../components/DataTable';
import type { TableColumn } from '../../../../components/DataTable';
import type { AssistanceProduction, AssistanceStatus } from '../../../../types/assistenciaProducao';
import { ApStatusBadge } from '../StatusBadge';
import './index.css';

// ── Sub-renderers ────────────────────────────────────────

function PrazoBadge({ dias, prazo }: { dias: number; prazo: string }) {
  if (dias < 0) return <span className="ap-prazo ap-prazo--vencido">{prazo}</span>;
  if (dias <= 2) return <span className="ap-prazo ap-prazo--critico">{prazo}</span>;
  return <span className="ap-prazo">{prazo}</span>;
}

function UrgenteBadge({ urgente }: { urgente: boolean }) {
  return urgente
    ? <span className="ap-urgente-yes">Urgente</span>
    : <span className="ap-urgente-no">—</span>;
}

// ── Columns ──────────────────────────────────────────────

const COLUMNS: TableColumn<AssistanceProduction>[] = [
  {
    key: 'num',
    label: 'N°',
    type: 'number',
    minWidth: 48,
    sortable: true,
    render: (v) => <span className="ap-num">{v as number}</span>,
  },
  { key: 'numSolicitacao', label: 'Solicitação', type: 'text', minWidth: 120, filterable: true, sortable: true },
  { key: 'corte',          label: 'Corte',       type: 'text', minWidth: 120, filterable: true, sortable: true },
  { key: 'numContrato',    label: 'Contrato',    type: 'text', minWidth: 90,  filterable: true, sortable: true },
  { key: 'cliente',        label: 'Cliente',     type: 'text', minWidth: 170, filterable: true, sortable: true },
  { key: 'ambiente',       label: 'Ambiente',    type: 'text', minWidth: 130, filterable: true, sortable: true },
  { key: 'dataHora',       label: 'Data',        type: 'text', minWidth: 120 },
  {
    key: 'prazo',
    label: 'Prazo',
    type: 'text',
    minWidth: 100,
    render: (_v, row) => <PrazoBadge dias={row.prazoDias} prazo={row.prazo} />,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'text',
    minWidth: 120,
    filterable: true,
    render: (v) => <ApStatusBadge status={v as AssistanceStatus} />,
  },
  { key: 'iniciado', label: 'Iniciado',  type: 'text', minWidth: 95,
    render: (v) => <span>{(v as string) || '—'}</span> },
  { key: 'previsao', label: 'Previsão',  type: 'text', minWidth: 95,
    render: (v) => <span>{(v as string) || '—'}</span> },
  { key: 'pronto',   label: 'Pronto',    type: 'text', minWidth: 95,
    render: (v) => <span>{(v as string) || '—'}</span> },
  { key: 'entregue', label: 'Entregue',  type: 'text', minWidth: 95,
    render: (v) => <span>{(v as string) || '—'}</span> },
  {
    key: 'urgente',
    label: 'Urgente',
    type: 'text',
    minWidth: 80,
    render: (v) => <UrgenteBadge urgente={v as boolean} />,
  },
];

// ── Component ────────────────────────────────────────────

interface TableProps {
  data: AssistanceProduction[];
  loading?: boolean;
  onRowClick: (row: AssistanceProduction) => void;
}

export function AssistanceProductionTable({ data, loading, onRowClick }: TableProps) {
  return (
    <DataTable<AssistanceProduction>
      columns={COLUMNS}
      data={data}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhuma assistência encontrada para os filtros aplicados."
      onRowClick={onRowClick}
      rowClassName={(row) =>
        [
          row.urgente ? 'ap-row--urgente' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
    />
  );
}