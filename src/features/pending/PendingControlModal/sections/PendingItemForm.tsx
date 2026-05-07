import { Button } from '../../../../components/Button';
import { ALL_PEND_CATEGORIES, PEND_CATEGORY_LABELS } from '../../../../data/pendingConfig';
import type { PendingCategory, PendingItem } from '../../../../types/pending';

interface Props {
  item: PendingItem;
  isEditing: boolean;
  onChange: (item: PendingItem) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function PendingItemForm({ item, isEditing, onChange, onSubmit, onClear }: Props) {
  function set<K extends keyof PendingItem>(field: K, value: PendingItem[K]) {
    onChange({ ...item, [field]: value });
  }

  return (
    <div className="pinfo-section">
      <div className="frow frow--4">
        <div className="pfield pfield--span3">
          <label>Descrição</label>
          <input
            type="text"
            value={item.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            placeholder="Descrição do item..."
          />
        </div>
        <div className="pfield">
          <label>Categoria</label>
          <select
            className="pfield__select"
            value={item.categoria}
            onChange={(e) => set('categoria', e.target.value as PendingCategory)}
          >
            {ALL_PEND_CATEGORIES.map((c) => (
              <option key={c} value={c}>{PEND_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="frow frow--4">
        <div className="pfield pfield--span2">
          <label>Medida</label>
          <input
            type="text"
            value={item.medida}
            onChange={(e) => set('medida', e.target.value)}
            placeholder="Ex: 35mm, 2750x1830mm..."
          />
        </div>
        <div className="pfield">
          <label>Quantidade</label>
          <input
            type="number"
            min={1}
            value={item.qtd}
            onChange={(e) => set('qtd', Number(e.target.value))}
          />
        </div>
        <div className="pfield">
          <label>Fornecedor</label>
          <input
            type="text"
            value={item.fornecedor}
            onChange={(e) => set('fornecedor', e.target.value)}
            placeholder="Nome do fornecedor..."
          />
        </div>
      </div>

      <div className="frow frow--3">
        <div className="pfield">
          <label>Data da Compra</label>
          <input
            type="date"
            value={item.compra}
            onChange={(e) => set('compra', e.target.value)}
          />
        </div>
        <div className="pfield">
          <label>Previsão de Entrega</label>
          <input
            type="date"
            value={item.previsao}
            onChange={(e) => set('previsao', e.target.value)}
          />
        </div>
        <div className="pfield">
          <label>Recebido em</label>
          <input
            type="date"
            value={item.recebido}
            onChange={(e) => set('recebido', e.target.value)}
          />
        </div>
      </div>

      <div className="pend-form-actions">
        <Button variant="ghost" size="sm" type="button" onClick={onClear}>
          Limpar
        </Button>
        <Button variant="primary" size="sm" type="button" onClick={onSubmit}>
          {isEditing ? 'Salvar Alteração' : 'Inserir Item'}
        </Button>
      </div>
    </div>
  );
}
