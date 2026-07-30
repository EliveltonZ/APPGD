import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toDatetimeLocal } from '../../../utils/dateUtils';
import type { Stage, Operator } from '../types';
import './index.css';

const STATUS_LABELS = {
  nao_iniciado: 'Aguardando',
  em_andamento: 'Em Andamento',
  pausado:      'Pausado',
  finalizado:   'Concluído',
} as const;

interface Props {
  stage: Stage;
  operators: Operator[];
  onSave: (updated: Partial<Stage>) => void;
  onClose: () => void;
}

export function StageDetailPanel({ stage, operators, onSave, onClose }: Props) {
  const [responsavelId, setResponsavelId] = useState(stage.responsavelId ?? '');
  const [inicio,        setInicio]        = useState(toDatetimeLocal(stage.inicio));
  const [fim,           setFim]           = useState(toDatetimeLocal(stage.fim));
  const [pausa,         setPausa]         = useState(stage.pausa);

  useEffect(() => {
    setResponsavelId(stage.responsavelId ?? '');
    setInicio(toDatetimeLocal(stage.inicio));
    setFim(toDatetimeLocal(stage.fim));
    setPausa(stage.pausa);
  }, [stage]);

  function handleSave() {
    const op = operators.find(o => o.id === responsavelId);
    onSave({
      responsavelId:   responsavelId || null,
      responsavelNome: op?.nome ?? null,
      inicio:          inicio || null,
      fim:             fim || null,
      pausa,
    });
  }

  return (
    <div className="apt-detail">
      <div className="apt-detail__header">
        <div className="apt-detail__title-wrap">
          <span className="apt-detail__stage-num">{stage.order}</span>
          <h3 className="apt-detail__stage-name">{stage.label}</h3>
          <span className={`apt-detail__badge apt-detail__badge--${stage.status}`}>
            {STATUS_LABELS[stage.status]}
          </span>
        </div>
        <button className="apt-detail__close" type="button" onClick={onClose} title="Fechar">
          <X size={16} />
        </button>
      </div>

      <div className="apt-detail__body">
        <div className="apt-detail__field">
          <label className="apt-detail__lbl">Responsável</label>
          <select
            className="apt-detail__sel"
            value={responsavelId}
            onChange={e => setResponsavelId(e.target.value)}
          >
            <option value="">— Sem responsável —</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.nome}</option>
            ))}
          </select>
        </div>

        <div className="apt-detail__field">
          <label className="apt-detail__lbl">Início</label>
          <input
            className="apt-detail__input"
            type="datetime-local"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
          />
        </div>

        <div className="apt-detail__field">
          <label className="apt-detail__lbl">Fim</label>
          <input
            className="apt-detail__input"
            type="datetime-local"
            value={fim}
            onChange={e => setFim(e.target.value)}
          />
        </div>

        <label className="apt-detail__check-row">
          <input
            type="checkbox"
            checked={pausa}
            onChange={e => setPausa(e.target.checked)}
          />
          <span>Etapa pausada</span>
        </label>
      </div>

      <div className="apt-detail__footer">
        <button className="apt-detail__btn apt-detail__btn--cancel" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button className="apt-detail__btn apt-detail__btn--save" type="button" onClick={handleSave}>
          <Save size={14} />
          Salvar
        </button>
      </div>
    </div>
  );
}
