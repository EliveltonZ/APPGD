import { useMemo } from 'react';
import { DataTable } from '../../../components/DataTable';
import type { TableColumn } from '../../../components/DataTable';
import type { Purchase, PurchaseStatus } from '../../../types/purchases';
import { STATUS_LABELS, CATEGORY_LABELS } from '../../../data/purchasesConfig';
import './index.css';

interface PurchasesTableProps {
  purchases: Purchase[];
  onSelect: (purchase: Purchase) => void;
  loading?: boolean;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

type PurchaseRow = Omit<Purchase, 'entrega' | 'compra' | 'previsao' | 'recebido'> & {
  entrega: string;
  compra: string;
  previsao: string;
  recebido: string;
  _parcelas: string;
  _statusLabel: string;
  _categoriaLabel: string;
};

const STATUS_CLS: Record<PurchaseStatus, string> = {
  pendente: 'pur-badge--pendente',
  comprado: 'pur-badge--comprado',
  recebido: 'pur-badge--recebido',
  atrasado: 'pur-badge--atrasado',
};

const COLUMNS: TableColumn<PurchaseRow>[] = [
  { key: 'id',              label: 'N°',        sortable: true, filterable: false },
  { key: 'contrato',        label: 'Contrato'   },
  { key: 'cliente',         label: 'Cliente',    minWidth: 130 },
  { key: 'ambiente',        label: 'Ambiente',   minWidth: 130 },
  { key: 'descricao',       label: 'Descrição',  minWidth: 180 },
  { key: 'medida',          label: 'Medida',     render: (v) => (v as string) || '—' },
  { key: 'qtd',             label: 'Qtd',        type: 'number' },
  { key: '_parcelas',       label: 'Parc.',      sortable: false, filterable: false },
  { key: 'cartao',          label: 'Cartão',     render: (v) => (v as string) || '—' },
  { key: 'fornecedor',      label: 'Fornecedor', minWidth: 130 },
  { key: 'entrega',         label: 'Entrega',    type: 'date-br' },
  { key: 'compra',          label: 'Compra',     type: 'date-br' },
  { key: 'previsao',        label: 'Previsão',   type: 'date-br' },
  { key: 'recebido',        label: 'Recebido',   type: 'date-br' },
  {
    key: '_statusLabel', label: 'Status',
    render: (_, row) => (
      <span className={`pur-badge ${STATUS_CLS[row.status as PurchaseStatus]}`}>
        {STATUS_LABELS[row.status as PurchaseStatus]}
      </span>
    ),
  },
  { key: '_categoriaLabel', label: 'Categoria'  },
];

export function PurchasesTable({ purchases, onSelect, loading }: PurchasesTableProps) {
  const rows = useMemo<PurchaseRow[]>(
    () =>
      purchases.map((p) => ({
        ...p,
        entrega:         fmt(p.entrega),
        compra:          fmt(p.compra),
        previsao:        fmt(p.previsao),
        recebido:        fmt(p.recebido),
        _parcelas:       `${p.parcelas}x`,
        _statusLabel:    STATUS_LABELS[p.status],
        _categoriaLabel: CATEGORY_LABELS[p.categoria],
      })),
    [purchases]
  );

  return (
    <DataTable<PurchaseRow>
      columns={COLUMNS}
      data={rows}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhuma compra encontrada."
      onRowClick={(row) => {
        const original = purchases.find((p) => p.id === row.id);
        if (original) onSelect(original);
      }}
      rowClassName={(row) =>
        row.status === 'atrasado' ? 'pur-table__row--atrasado' : ''
      }
    />
  );
}
