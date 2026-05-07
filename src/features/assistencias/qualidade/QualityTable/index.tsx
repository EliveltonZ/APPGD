import { DataTable } from '../../../../components/DataTable';
import type { TableColumn } from '../../../../components/DataTable';
import type { QualityItem, AnalysisStatus } from '../../../../types/qualityControl';
import { QualityStatusBadge } from '../QualityStatusBadge';
import './index.css';

const COLUMNS: TableColumn<QualityItem>[] = [
  {
    key: 'codigo',
    label: 'Código',
    type: 'text',
    minWidth: 120,
    filterable: true,
    sortable: true,
    render: (v) => <span className="qc-code">{v as string}</span>,
  },
  { key: 'idAssistencia', label: 'ID Assistência', type: 'text', minWidth: 120, filterable: true, sortable: true },
  {
    key: 'qtd',
    label: 'Qtd',
    type: 'number',
    minWidth: 52,
    sortable: true,
    render: (v) => <span className="qc-num">{v as number}</span>,
  },
  { key: 'cor',        label: 'Cor',        type: 'text', minWidth: 110, filterable: true  },
  { key: 'peca',       label: 'Peça',       type: 'text', minWidth: 160, filterable: true, sortable: true,
    render: (v) => <span className="qc-peca">{v as string}</span> },
  { key: 'dimensoes',  label: 'Dimensões',  type: 'text', minWidth: 95  },
  { key: 'orientacao', label: 'Orientação', type: 'text', minWidth: 90  },
  { key: 'cliente',    label: 'Cliente',    type: 'text', minWidth: 170, filterable: true, sortable: true },
  { key: 'ambiente',   label: 'Ambiente',   type: 'text', minWidth: 130, filterable: true, sortable: true },
  {
    key: 'status',
    label: 'Status',
    type: 'text',
    minWidth: 110,
    filterable: true,
    render: (v) => <QualityStatusBadge status={v as AnalysisStatus} />,
  },
];

interface Props {
  data: QualityItem[];
  loading?: boolean;
  onRowClick: (row: QualityItem) => void;
}

export function QualityTable({ data, loading, onRowClick }: Props) {
  return (
    <DataTable<QualityItem>
      columns={COLUMNS}
      data={data}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum item encontrado para os filtros aplicados."
      onRowClick={onRowClick}
      rowClassName={(row) => (row.status === 'pendente' ? 'qc-row--pendente' : '')}
    />
  );
}