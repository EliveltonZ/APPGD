import { Pencil, Trash2 } from 'lucide-react';
import { computeAccessoryLaunchStatus, ACC_LAUNCH_STATUS_LABELS } from '../../../../data/accessoryLaunchConfig';
import type { AccessoryLaunchItem, AccessoryLaunchStatus } from '../../../../types/accessoryLaunch';
import './AccessoryItemsTable.css';

interface Props {
  items: AccessoryLaunchItem[];
  onEdit: (item: AccessoryLaunchItem) => void;
  onDelete: (id: number) => void;
}

function fmt(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const ROW_CLS: Record<AccessoryLaunchStatus, string> = {
  pendente: '',
  comprado: '',
  atrasado: 'acclt-row--atrasado',
  recebido: 'acclt-row--recebido',
};

export function AccessoryItemsTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="acclt-table-wrapper">
      <table className="acclt-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Medida</th>
            <th className="acclt-th--center">Qtd</th>
            <th>Fornecedor</th>
            <th className="acclt-th--center">Compra</th>
            <th className="acclt-th--center">Previsão</th>
            <th className="acclt-th--center">Recebido</th>
            <th>Status</th>
            <th className="acclt-th--center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={10} className="acclt-table__empty">
                Nenhum item cadastrado.
              </td>
            </tr>
          )}
          {items.map((item) => {
            const status = computeAccessoryLaunchStatus(item);
            return (
              <tr key={item.id} className={`acclt-row ${ROW_CLS[status]}`}>
                <td>{item.categoria || '—'}</td>
                <td className="acclt-td--desc">{item.descricao || '—'}</td>
                <td>{item.medida || '—'}</td>
                <td className="acclt-td--center">{item.qtd}</td>
                <td className="acclt-td--min">{item.fornecedor || '—'}</td>
                <td className="acclt-td--center">{fmt(item.compra)}</td>
                <td className="acclt-td--center">{fmt(item.previsao)}</td>
                <td className="acclt-td--center">{fmt(item.recebido)}</td>
                <td>
                  <span className={`acclt-badge acclt-badge--${status}`}>
                    {ACC_LAUNCH_STATUS_LABELS[status]}
                  </span>
                </td>
                <td className="acclt-td--actions">
                  <button
                    type="button"
                    className="acclt-action-btn"
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    className="acclt-action-btn acclt-action-btn--delete"
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
