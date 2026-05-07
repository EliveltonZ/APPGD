import { Trash2 } from 'lucide-react';
import type { ServicePart } from '../../../../types/assistencia';
import { PART_SIDE_LABELS, PART_TYPE_LABELS } from '../../../../data/assistenciaConfig';
import './index.css';

interface SelectedPartsTableProps {
  pecas: ServicePart[];
  onRemove: (id: string) => void;
}

export function SelectedPartsTable({ pecas, onRemove }: SelectedPartsTableProps) {
  if (!pecas.length) {
    return (
      <p className="as-empty">Nenhuma peça adicionada.</p>
    );
  }

  return (
    <div className="as-parts-table-wrap">
      <table className="as-parts-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>Qtd</th>
            <th style={{ minWidth: 130 }}>Peça</th>
            <th style={{ minWidth: 90 }}>Dimensões</th>
            <th style={{ minWidth: 80 }}>Cor</th>
            <th style={{ minWidth: 100 }}>Lado</th>
            <th style={{ minWidth: 200 }}>Falha</th>
            <th style={{ minWidth: 110 }}>Tipo</th>
            <th style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {pecas.map((p) => (
            <tr key={p.id}>
              <td className="as-parts-table__num">{p.qtd}</td>
              <td className="as-parts-table__peca">{p.peca}</td>
              <td>{p.dimensoes || '—'}</td>
              <td>{p.cor || '—'}</td>
              <td>{p.lado ? PART_SIDE_LABELS[p.lado] : '—'}</td>
              <td className="as-parts-table__falha" title={p.falha}>{p.falha}</td>
              <td>{p.tipo ? PART_TYPE_LABELS[p.tipo] : '—'}</td>
              <td>
                <button
                  className="as-table-remove"
                  onClick={() => onRemove(p.id)}
                  title="Remover peça"
                  type="button"
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