import { useMemo } from 'react';
import { DataTable } from '../../../components/DataTable';
import type { TableColumn } from '../../../components/DataTable';
import type { ProjectValue, MarginStatus } from '../../../types/financeiro';
import { MARGIN_STATUS_LABELS } from '../../../data/financeiroConfig';
import { formatBRL, formatPct } from '../../../utils/financeiroUtils';
import './index.css';

// ── MarginBadge ──────────────────────────────────────────

function MarginBadge({ status, value }: { status: MarginStatus; value: number }) {
  return (
    <span className={`fin-badge fin-badge--${status}`}>
      {formatPct(value)}
    </span>
  );
}

// ── Column definitions ───────────────────────────────────

const NUM = 'fin-num';
const NUM_NEG = 'fin-num fin-num--negative';
const NUM_POS = 'fin-num fin-num--positive';

function dateBr(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const COLUMNS: TableColumn<ProjectValue>[] = [
  { key: 'numOC',      label: 'NumOC',       type: 'text',      minWidth: 90,  filterable: true,  sortable: true  },
  { key: 'contrato',   label: 'Contrato',    type: 'text',      minWidth: 80,  filterable: true,  sortable: true  },
  { key: 'data',       label: 'Data',        type: 'date-iso',  minWidth: 95,  filterable: false, sortable: true, valueFormatter: dateBr },
  { key: 'cliente',    label: 'Cliente',     type: 'text',      minWidth: 170, filterable: true,  sortable: true  },
  { key: 'np',         label: 'N.P.',        type: 'text',   minWidth: 60,  filterable: true,  sortable: true  },
  { key: 'loja',       label: 'Loja',        type: 'text',   minWidth: 100, filterable: true,  sortable: true  },
  { key: 'ambiente',   label: 'Ambiente',    type: 'text',   minWidth: 140, filterable: true,  sortable: true  },
  {
    key: 'bruto',
    label: 'Bruto',
    type: 'number',
    minWidth: 120,
    filterable: false,
    render: (v) => <span className={NUM}>{formatBRL(v as number)}</span>,
  },
  {
    key: 'negociado',
    label: 'Negociado',
    type: 'number',
    minWidth: 120,
    filterable: false,
    render: (v) => <span className={NUM}>{formatBRL(v as number)}</span>,
  },
  {
    key: 'material',
    label: 'Material',
    type: 'number',
    minWidth: 120,
    filterable: false,
    render: (v) => <span className={NUM}>{formatBRL(v as number)}</span>,
  },
  {
    key: 'descPct',
    label: 'Desc (%)',
    type: 'number',
    minWidth: 80,
    filterable: false,
    render: (v) => <span className={NUM}>{formatPct(v as number)}</span>,
  },
  {
    key: 'lucroBruto',
    label: 'Lucro Bruto',
    type: 'number',
    minWidth: 120,
    filterable: false,
    render: (v) => (
      <span className={(v as number) < 0 ? NUM_NEG : NUM_POS}>
        {formatBRL(v as number)}
      </span>
    ),
  },
  {
    key: 'margem',
    label: 'Margem',
    type: 'number',
    minWidth: 95,
    filterable: false,
    render: (v, row) => (
      <MarginBadge status={row.marginStatus} value={v as number} />
    ),
  },
];

// ── Component ────────────────────────────────────────────

interface FinanceiroTableProps {
  data: ProjectValue[];
  loading?: boolean;
}

export function FinanceiroTable({ data, loading }: FinanceiroTableProps) {
  const marginStatusLabels = useMemo(
    () => Object.fromEntries(Object.entries(MARGIN_STATUS_LABELS)),
    [],
  );
  void marginStatusLabels;

  return (
    <DataTable<ProjectValue>
      columns={COLUMNS}
      data={data}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum projeto encontrado para os filtros selecionados."
      rowClassName={(row) => (row.lucroBruto < 0 ? 'fin-row--negative' : '')}
    />
  );
}