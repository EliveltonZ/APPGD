import { useState } from 'react';
import { Button } from '../../../../components/Button';
import { SearchSelect } from '../../../../components/SearchSelect';
import type { SearchSelectOption } from '../../../../components/SearchSelect';

interface Props {
  materiaisOptions: SearchSelectOption[];
  inserting?: boolean;
  onSubmit: (data: { materialId: number; quantidade: number; detalhes: string | null }) => void;
}

export function PendingItemForm({ materiaisOptions, inserting, onSubmit }: Props) {
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [detalhes, setDetalhes] = useState('');

  function handleClear() {
    setMaterialId(null);
    setQuantidade('');
    setDetalhes('');
  }

  function handleSubmit() {
    if (!materialId) return;
    const qtd = Number(quantidade.replace(',', '.'));
    if (!qtd || qtd <= 0) return;
    onSubmit({ materialId, quantidade: qtd, detalhes: detalhes.trim() || null });
    handleClear();
  }

  return (
    <div className="pinfo-section">
      <div className="frow frow--3">
        <div className="pfield pfield--span2">
          <label>Material</label>
          <SearchSelect
            options={materiaisOptions}
            value={materialId}
            onChange={setMaterialId}
            placeholder="Buscar material (nome ou código)..."
          />
        </div>
        <div className="pfield">
          <label>Quantidade</label>
          <input
            type="text"
            inputMode="decimal"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="frow frow--1">
        <div className="pfield">
          <label>Detalhes (opcional)</label>
          <input
            type="text"
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            placeholder="Ex.: Branca, 60x210cm, 4mm"
          />
        </div>
      </div>

      <div className="pend-form-actions">
        <Button variant="ghost" size="sm" type="button" onClick={handleClear}>
          Limpar
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          loading={inserting}
          disabled={!materialId || !quantidade.trim()}
          onClick={handleSubmit}
        >
          Inserir Item
        </Button>
      </div>
    </div>
  );
}
