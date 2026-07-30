import type { Purchase } from '../../../../types/purchases';

interface Props {
  data: Purchase;
  onChange: (data: Purchase) => void;
}

export function SupplierSection({ data, onChange }: Props) {
  function set<K extends keyof Purchase>(field: K, value: Purchase[K]) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield pfield--span2">
          <label>Fornecedor</label>
          <input
            type="text"
            value={data.fornecedor}
            onChange={(e) => set('fornecedor', e.target.value)}
            placeholder="Nome do fornecedor..."
          />
        </div>
        <div className="pfield">
          <label>Parcelamento</label>
          <input
            type="number"
            min={1}
            max={48}
            value={data.parcelas}
            onChange={(e) => set('parcelas', Number(e.target.value))}
          />
        </div>
        <div className="pfield">
          <label>Cartão</label>
          <input
            type="text"
            value={data.cartao}
            onChange={(e) => set('cartao', e.target.value)}
            placeholder="Ex: Nubank PJ..."
          />
        </div>
      </div>
    </div>
  );
}
