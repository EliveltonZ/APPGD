import type { Purchase, PurchaseCategory } from "../../../../types/purchases";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
} from "../../../../data/purchasesConfig";

interface Props {
  data: Purchase;
  onChange: (data: Purchase) => void;
}

export function ItemSection({ data, onChange }: Props) {
  function set<K extends keyof Purchase>(field: K, value: Purchase[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield pfield--span3">
          <label>Descrição</label>
          <input
            type="text"
            value={data.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Descrição do item..."
          />
        </div>
        <div className="pfield">
          <label>Categoria</label>
          <select
            className="pfield__select"
            value={data.categoria}
            onChange={(e) =>
              set("categoria", e.target.value as PurchaseCategory)
            }
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="pfield pfield--span2">
          <label>Medida</label>
          <input
            type="text"
            value={data.medida}
            onChange={(e) => set("medida", e.target.value)}
            placeholder="Ex: 35mm, 2750x1830mm..."
          />
        </div>
        <div className="pfield">
          <label>Quantidade</label>
          <input
            type="number"
            min={1}
            value={data.qtd}
            onChange={(e) => set("qtd", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
