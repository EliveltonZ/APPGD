import type { Purchase } from '../../../../types/purchases';

interface Props {
  data: Purchase;
  onChange: (data: Purchase) => void;
}

export function DatesSection({ data, onChange }: Props) {
  function set<K extends keyof Purchase>(field: K, value: Purchase[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield">
          <label>Data da Compra</label>
          <input
            type="date"
            value={data.compra}
            onChange={(e) => set('compra', e.target.value)}
          />
        </div>
        <div className="pfield">
          <label>Previsão</label>
          <input
            type="date"
            value={data.previsao}
            onChange={(e) => set('previsao', e.target.value)}
          />
        </div>
        <div className="pfield">
          <label>Entrega</label>
          <input
            type="date"
            value={data.entrega}
            onChange={(e) => set('entrega', e.target.value)}
          />
        </div>
        <div className="pfield">
          <label>Recebido em</label>
          <input
            type="date"
            value={data.recebido}
            onChange={(e) => set('recebido', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
