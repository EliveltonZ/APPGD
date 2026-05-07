import { Pencil, Trash2 } from 'lucide-react';
import { computeItemStatus, PEND_STATUS_LABELS, PEND_CATEGORY_LABELS } from '../../../../data/pendingConfig';
import type { PendingItem, PendingStatus } from '../../../../types/pending';

interface Props {
  items: PendingItem[];
  onEdit: (item: PendingItem) => void;
  onDelete: (id: number) => void;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const STATUS_CLS: Record<PendingStatus, string> = {
  pendente:  'pend-badge--pendente',
  comprado:  'pend-badge--comprado',
  atrasado:  'pend-badge--atrasado',
  recebido:  'pend-badge--recebido',
};

const ROW_CLS: Record<PendingStatus, string> = {
  pendente:  '',
  comprado:  '',
  atrasado:  'pend-items-row--atrasado',
  recebido:  'pend-items-row--recebido',
};

export function PendingItemsTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="pend-items-table-wrapper">
      <table className="pend-items-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Medida</th>
            <th className="pend-th--center">Qtd</th>
            <th>Fornecedor</th>
            <th className="pend-th--center">Compra</th>
            <th className="pend-th--center">Previsão</th>
            <th className="pend-th--center">Recebido</th>
            <th>Status</th>
            <th className="pend-th--actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={10} className="pend-items-table__empty">
                Nenhum item cadastrado.
              </td>
            </tr>
          )}
          {items.map((item) => {
            const status = computeItemStatus(item);
            return (
              <tr key={item.id} className={`pend-items-row ${ROW_CLS[status]}`}>
                <td className="pend-td--nowrap">{PEND_CATEGORY_LABELS[item.categoria]}</td>
                <td className="pend-td--desc">{item.descricao || '—'}</td>
                <td className="pend-td--nowrap">{item.medida || '—'}</td>
                <td className="pend-td--center">{item.qtd}</td>
                <td className="pend-td--min">{item.fornecedor || '—'}</td>
                <td className="pend-td--center">{fmt(item.compra)}</td>
                <td className="pend-td--center">{fmt(item.previsao)}</td>
                <td className="pend-td--center">{fmt(item.recebido)}</td>
                <td>
                  <span className={`pend-badge ${STATUS_CLS[status]}`}>
                    {PEND_STATUS_LABELS[status]}
                  </span>
                </td>
                <td className="pend-td--actions">
                  <button
                    type="button"
                    className="pend-action-btn pend-action-btn--edit"
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    className="pend-action-btn pend-action-btn--delete"
                    onClick={() => onDelete(item.id)}
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
