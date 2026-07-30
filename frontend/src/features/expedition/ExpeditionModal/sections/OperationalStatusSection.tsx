import { User } from 'lucide-react';
import type { ExpeditionDetail } from '../../../../types/expedition';
import './OperationalStatusSection.css';

export type PickRole = 'embalagem' | 'conferido' | 'motorista';

interface OperationalStatusSectionProps {
  data: ExpeditionDetail;
  onChange: (updates: Partial<ExpeditionDetail>) => void;
  onPickUser: (role: PickRole) => void;
}

const EMB_BADGE: Record<string, string> = {
  active: 'EM ANDAMENTO',
  paused: 'PAUSADO',
  done:   'CONCLUÍDO',
};

export function OperationalStatusSection({ data, onChange, onPickUser }: OperationalStatusSectionProps) {
  const embState = data.embalagemfim
    ? 'done'
    : data.embalagempausa
      ? 'paused'
      : data.embalageminicio
        ? 'active'
        : null;

  function handleEmbalagemInicio(value: string) {
    const updates: Partial<ExpeditionDetail> = { embalageminicio: value };
    if (!value) {
      updates.embalagemfim    = '';
      updates.embalagempausa  = false;
    }
    onChange(updates);
  }

  function setEmbalagem(field: 'embalagemfim' | 'embalagempausa', value: string | boolean) {
    if (field === 'embalagemfim' && value && !data.embalageminicio) return;
    if (field === 'embalagempausa' && value === true && !data.embalageminicio) return;
    onChange({ [field]: value });
  }

  return (
    <div className="ops-status">
      <div className="ops-status__cards-row">
        {/* Embalagem */}
        <div className={`ops-status__card${embState ? ` ops-status__card--${embState}` : ''}`}>
          <div className="ops-status__card-header">
            Embalagem
            {embState && (
              <span className={`ops-status__card-badge ops-status__card-badge--${embState}`}>
                {EMB_BADGE[embState]}
              </span>
            )}
          </div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Início</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.embalageminicio}
                onChange={(e) => handleEmbalagemInicio(e.target.value)}
              />
            </div>
            <div className="ops-status__field">
              <label className="ops-status__label">Fim</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.embalagemfim}
                disabled={!data.embalageminicio}
                onChange={(e) => setEmbalagem('embalagemfim', e.target.value)}
              />
            </div>
            <div className="ops-status__field ops-status__field--row">
              <input
                type="checkbox"
                className="ops-status__checkbox"
                id="emb-pausa"
                checked={data.embalagempausa}
                disabled={!data.embalageminicio}
                onChange={(e) => setEmbalagem('embalagempausa', e.target.checked)}
              />
              <label className="ops-status__label ops-status__label--inline" htmlFor="emb-pausa">
                Pausa
              </label>
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="number"
                  className="ops-status__input ops-status__input--id"
                  value={data.embalagemresp || ''}
                  onChange={(e) => onChange({ embalagemresp: Number(e.target.value) })}
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Nome</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.embalagemname}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button type="button" className="ops-status__pick-btn" onClick={() => onPickUser('embalagem')}>
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pronto / Conferido */}
        <div className="ops-status__card">
          <div className="ops-status__card-header">Pronto</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data Pronto</label>
              <input
                type="date"
                className="ops-status__input"
                value={data.pronto}
                onChange={(e) => onChange({ pronto: e.target.value })}
              />
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="number"
                  className="ops-status__input ops-status__input--id"
                  value={data.conferido || ''}
                  onChange={(e) => onChange({ conferido: Number(e.target.value) })}
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Conferido por</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.conferidoname}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button type="button" className="ops-status__pick-btn" onClick={() => onPickUser('conferido')}>
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entrega / Motorista */}
        <div className="ops-status__card">
          <div className="ops-status__card-header">Entrega</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data Entrega</label>
              <input
                type="date"
                className="ops-status__input"
                value={data.entrega}
onChange={(e) => onChange({ entrega: e.target.value })}
              />
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="number"
                  className="ops-status__input ops-status__input--id"
                  value={data.motorista || ''}
                  onChange={(e) => onChange({ motorista: Number(e.target.value) })}
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Motorista</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.motoristaname}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button type="button" className="ops-status__pick-btn" onClick={() => onPickUser('motorista')}>
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Separação + Flags */}
      <div className="ops-status__bottom-row">
        <div className="ops-status__card ops-status__card--alm">
          <div className="ops-status__card-header">Separação</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data / Hora</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.separacao}
                onChange={(e) => onChange({ separacao: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="ops-status__card ops-status__card--alertas">
          <div className="ops-status__card-header">Alertas</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field ops-status__field--row">
              <input
                type="checkbox"
                className="ops-status__checkbox"
                id="flag-pendencia"
                checked={data.pendencia}
                onChange={(e) => onChange({ pendencia: e.target.checked })}
              />
              <label className="ops-status__label ops-status__label--inline" htmlFor="flag-pendencia">
                Pendências
              </label>
            </div>
            <div className="ops-status__field ops-status__field--row ops-status__field--mt">
              <input
                type="checkbox"
                className="ops-status__checkbox"
                id="flag-parcial"
                checked={data.parcial}
                onChange={(e) => onChange({ parcial: e.target.checked })}
              />
              <label className="ops-status__label ops-status__label--inline" htmlFor="flag-parcial">
                Entrega Parcial
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
