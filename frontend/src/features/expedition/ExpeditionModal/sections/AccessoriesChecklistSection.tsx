import type { ExpeditionDetail } from '../../../../types/expedition';
import './AccessoriesChecklistSection.css';

const AVULSOS_ITEMS = [
  { key: 'avulso',        label: 'Avulsos',           lKey: 'avulsol',        qKey: 'avulsoq'        },
  { key: 'cabide',        label: 'Cabide',             lKey: 'cabidel',        qKey: 'cabideq'        },
  { key: 'paineis',       label: 'Painéis',            lKey: 'paineisl',       qKey: 'paineisq'       },
  { key: 'pecaspintadas', label: 'Peças Pintadas',     lKey: 'pecaspintadasl', qKey: 'pecaspintadasq' },
  { key: 'portaaluminio', label: 'Porta Alumínio',     lKey: 'portaaluminiol', qKey: 'portaaluminioq' },
  { key: 'serralheria',   label: 'Serralheria',        lKey: 'serralherial',   qKey: 'serralheriaq'   },
  { key: 'tapecaria',     label: 'Tapeçaria',          lKey: 'tapecarial',     qKey: 'tapecariaq'     },
  { key: 'trilho',        label: 'Trilho',             lKey: 'trilhol',        qKey: 'trilhoq'        },
  { key: 'vidros',        label: 'Vidros',             lKey: 'vidrosl',        qKey: 'vidrosq'        },
  { key: 'volmod',        label: 'Vol. Modulação',     lKey: 'modulosl',       qKey: 'modulosq'       },
] as const;

interface AvulsosSectionProps {
  detail: ExpeditionDetail;
  onChange: (updates: Partial<ExpeditionDetail>) => void;
}

export function AccessoriesChecklistSection({ detail, onChange }: AvulsosSectionProps) {
  return (
    <div className="acc-checklist">
      <div className="acc-checklist__table-wrap">
        <table className="acc-checklist__table">
          <thead>
            <tr>
              <th className="acc-checklist__th acc-checklist__th--check">Tem</th>
              <th className="acc-checklist__th acc-checklist__th--item">Item</th>
              <th className="acc-checklist__th acc-checklist__th--local">Descrição / Local</th>
              <th className="acc-checklist__th acc-checklist__th--qtd">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {AVULSOS_ITEMS.map(({ key, label, lKey, qKey }) => (
              <tr key={key} className="acc-checklist__row">
                <td className="acc-checklist__td acc-checklist__td--check">
                  <input
                    type="checkbox"
                    className="acc-checklist__checkbox"
                    checked={detail[key] as boolean}
                    onChange={(e) => onChange({ [key]: e.target.checked })}
                  />
                </td>
                <td className="acc-checklist__td acc-checklist__td--item">{label}</td>
                <td className="acc-checklist__td acc-checklist__td--local">
                  <input
                    type="text"
                    className="acc-checklist__input acc-checklist__input--local"
                    value={detail[lKey] as string}
                    onChange={(e) => onChange({ [lKey]: e.target.value })}
                    placeholder="Descrição / local..."
                  />
                </td>
                <td className="acc-checklist__td acc-checklist__td--qtd">
                  <input
                    type="number"
                    className="acc-checklist__input acc-checklist__input--num"
                    value={detail[qKey] as number}
                    min={0}
                    onChange={(e) => onChange({ [qKey]: Number(e.target.value) })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acc-checklist__volumes">
        <div className="acc-checklist__volumes-title">Volumes</div>
        <div className="acc-checklist__volumes-row">
          <label className="acc-checklist__vol-label">
            <span>Tamanho</span>
            <select
              className="acc-checklist__input acc-checklist__input--vol"
              value={detail.tamanho}
              onChange={(e) => onChange({ tamanho: e.target.value })}
            >
              <option value="">Selecione</option>
              <option value="PEQUENO">Pequeno</option>
              <option value="MEDIO">Médio</option>
              <option value="GRANDE">Grande</option>
            </select>
          </label>
          <label className="acc-checklist__vol-label">
            <span>Total Volumes</span>
            <input
              type="number"
              className="acc-checklist__input acc-checklist__input--vol acc-checklist__input--total"
              value={detail.totalvolumes}
              min={0}
              onChange={(e) => onChange({ totalvolumes: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
