import type {
  AccessoryChecklistItem,
  VolumeSize,
} from "../../../../types/expedition";
import "./AccessoriesChecklistSection.css";

interface AccessoriesChecklistSectionProps {
  checklist: AccessoryChecklistItem[];
  volumes: VolumeSize;
  totalVolumes: number;
  onChecklistChange: (checklist: AccessoryChecklistItem[]) => void;
  onVolumesChange: (volumes: VolumeSize) => void;
  onTotalVolumesChange: (total: number) => void;
}

export function AccessoriesChecklistSection({
  checklist,
  volumes,
  totalVolumes,
  onChecklistChange,
  onTotalVolumesChange,
}: AccessoriesChecklistSectionProps) {
  function handleChecklistField(
    index: number,
    field: keyof AccessoryChecklistItem,
    value: boolean | number | string,
  ) {
    const updated = checklist.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChecklistChange(updated);
  }

  return (
    <div className="acc-checklist">
      <div className="acc-checklist__table-wrap">
        <table className="acc-checklist__table">
          <thead>
            <tr>
              <th className="acc-checklist__th acc-checklist__th--item">
                Item
              </th>
              <th className="acc-checklist__th acc-checklist__th--check">
                Conferido
              </th>
              <th className="acc-checklist__th acc-checklist__th--qtd">Qtd</th>
              <th className="acc-checklist__th acc-checklist__th--local">
                Local
              </th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item, index) => (
              <tr key={item.id} className="acc-checklist__row">
                <td className="acc-checklist__td acc-checklist__td--item">
                  {item.label}
                </td>
                <td className="acc-checklist__td acc-checklist__td--check">
                  <input
                    type="checkbox"
                    className="acc-checklist__checkbox"
                    checked={item.conferido}
                    onChange={(e) =>
                      handleChecklistField(index, "conferido", e.target.checked)
                    }
                  />
                </td>
                <td className="acc-checklist__td acc-checklist__td--qtd">
                  <input
                    type="number"
                    className="acc-checklist__input acc-checklist__input--num"
                    value={item.qtd}
                    min={0}
                    onChange={(e) =>
                      handleChecklistField(index, "qtd", Number(e.target.value))
                    }
                  />
                </td>
                <td className="acc-checklist__td acc-checklist__td--local">
                  <input
                    type="text"
                    className="acc-checklist__input acc-checklist__input--local"
                    value={item.local}
                    onChange={(e) =>
                      handleChecklistField(index, "local", e.target.value)
                    }
                    placeholder="Local..."
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
            <span>Grande</span>
            <select
              name=""
              className="acc-checklist__input acc-checklist__input--vol"
              id="tamanho"
            >
              <option value="">selecione</option>
              <option value="1">PEQUENO</option>
              <option value="2">MEDIO</option>
              <option value="3">GRANDE</option>
            </select>
          </label>
          <label className="acc-checklist__vol-label">
            <span>Total Volumes</span>
            <input
              type="number"
              className="acc-checklist__input acc-checklist__input--vol acc-checklist__input--total"
              value={totalVolumes}
              min={0}
              onChange={(e) => onTotalVolumesChange(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
