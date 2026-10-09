import { Trash2 } from 'lucide-react';
import { PEND_STATUS_LABELS } from '../../../../data/pendingConfig';
import type { PendingItem } from '../../../../types/pending';

interface Props {
  items: PendingItem[];
  onDelete: (id: number) => void;
}

const TIPO_LABEL: Record<string, string> = { CHAPA: 'Chapa', FITA: 'Fita', FERRAGEM: 'Ferragem' };
const UNIDADE_LABEL: Record<string, string> = { M2: 'm²', M: 'm', UN: 'un' };
const ORIGEM_LABEL: Record<string, string> = { XML: 'XML', MANUAL: 'Manual' };

export function PendingItemsTable({ items, onDelete }: Props) {
  return (
    <div className="pend-items-table-wrapper">
      <table className="pend-items-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Detalhes</th>
            <th className="pend-th--center">Tipo</th>
            <th className="pend-th--center">Qtd</th>
            <th className="pend-th--center">Origem</th>
            <th>Status</th>
            <th className="pend-th--actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="pend-items-table__empty">
                Nenhum item lançado.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} className="pend-items-row">
              <td className="pend-td--nowrap">{item.codigoInterno || '—'}</td>
              <td className="pend-td--desc">{item.descricao || '—'}</td>
              <td className="pend-td--nowrap">{item.detalhes || '—'}</td>
              <td className="pend-td--center">{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
              <td className="pend-td--center">
                {item.quantidade} {UNIDADE_LABEL[item.unidade] ?? item.unidade}
              </td>
              <td className="pend-td--center">{ORIGEM_LABEL[item.origem] ?? item.origem}</td>
              <td>
                <span className={`pend-badge pend-badge--${item.status.toLowerCase()}`}>
                  {PEND_STATUS_LABELS[item.status]}
                </span>
              </td>
              <td className="pend-td--actions">
                <button
                  type="button"
                  className="pend-action-btn pend-action-btn--delete"
                  onClick={() => onDelete(item.id)}
                  title={item.origem === 'XML' ? 'Item veio do XML — não pode ser excluído por aqui' : 'Excluir'}
                  disabled={item.origem === 'XML'}
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
