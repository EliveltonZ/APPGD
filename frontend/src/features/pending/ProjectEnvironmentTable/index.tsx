import { useMemo } from 'react';
import { DataTable } from '../../../components/DataTable';
import type { TableColumn } from '../../../components/DataTable';
import type { PendingProject } from '../../../types/pending';
import './index.css';

interface ProjectEnvironmentTableProps {
  projects: PendingProject[];
  onSelect: (project: PendingProject) => void;
  loading?: boolean;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

type ProjectRow = {
  id: number;
  numOC: string;
  contrato: string;
  cliente: string;
  ambiente: string;
  entrega: string;
  _itens: number;
};

const COLUMNS: TableColumn<ProjectRow>[] = [
  { key: 'numOC',      label: 'N° OC'                           },
  { key: 'contrato',   label: 'Contrato'                        },
  { key: 'cliente',    label: 'Cliente',   minWidth: 140        },
  { key: 'ambiente',   label: 'Ambiente',  minWidth: 140        },
  { key: 'entrega',    label: 'Entrega',   type: 'date-br'      },
  {
    key: '_itens', label: 'Itens', type: 'number',
    render: (v) => <span className="penv-count">{v as number}</span>,
  },
];

export function ProjectEnvironmentTable({ projects, onSelect, loading }: ProjectEnvironmentTableProps) {
  const rows = useMemo<ProjectRow[]>(
    () =>
      projects.map((p) => ({
        id:          p.id,
        numOC:       p.numOC,
        contrato:    p.contrato,
        cliente:     p.cliente,
        ambiente:    p.ambiente,
        entrega:     fmt(p.entrega),
        _itens:      p.total,
      })),
    [projects]
  );

  return (
    <DataTable<ProjectRow>
      columns={COLUMNS}
      data={rows}
      rowKey="id"
      loading={loading}
      emptyMessage="Nenhum projeto encontrado."
      onRowClick={(row) => {
        const original = projects.find((p) => p.id === row.id);
        if (original) onSelect(original);
      }}
    />
  );
}
