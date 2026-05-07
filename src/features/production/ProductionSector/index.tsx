import { useState } from 'react'
import { Users } from 'lucide-react'
import { ConfirmModal } from '../../../components/ConfirmModal'
import type { SectorConfig, SectorData } from '../../../types/production'
import './index.css'

interface ProductionSectorProps {
  config: SectorConfig
  data: SectorData
  onChange: (field: keyof SectorData, value: string | boolean) => void
  onPickEmployee: () => void
}

function nowDatetimeLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ProductionSector({
  config,
  data,
  onChange,
  onPickEmployee,
}: ProductionSectorProps) {
  const [pendingField, setPendingField] = useState<'inicio' | 'fim' | null>(null)
  const [warningMsg, setWarningMsg] = useState<string | null>(null)

  function handleConfirm() {
    if (pendingField) onChange(pendingField, nowDatetimeLocal())
    setPendingField(null)
  }

  function requestFill(field: 'inicio' | 'fim') {
    if (field === 'fim' && !data.inicio) {
      setWarningMsg(`Preencha o Início de ${config.label} antes de registrar o Fim.`)
      return
    }
    setPendingField(field)
  }

  function handleFimChange(value: string) {
    if (value && !data.inicio) {
      setWarningMsg(`Preencha o Início de ${config.label} antes de registrar o Fim.`)
      return
    }
    onChange('fim', value)
  }

  function handlePausaChange(checked: boolean) {
    if (checked && !data.inicio) {
      setWarningMsg(`Preencha o Início de ${config.label} antes de pausar a etapa.`)
      return
    }
    onChange('pausa', checked)
  }

  const state = data.fim ? 'done' : data.pausa ? 'paused' : data.inicio ? 'active' : 'waiting'

  const BADGE: Record<string, string> = {
    waiting: 'Aguardando',
    active:  'Em Andamento',
    paused:  'Pausado',
    done:    'Concluído',
  }

  return (
    <>
    <div className={`sector-card${state !== 'waiting' ? ` sector-card--${state}` : ''}`}>
      <div className="sector-card__header">
        <span className="sector-card__title">{config.label}</span>
        <span className={`sector-card__badge sector-card__badge--${state}`}>{BADGE[state]}</span>
      </div>

      <div className="sector-card__body">
        <div className="sector-card__row">
          <div className="sector-card__field">
            <label className="sector-card__label">Início</label>
            <input
              type="datetime-local"
              className="sector-card__input"
              value={data.inicio}
              onChange={(e) => onChange('inicio', e.target.value)}
            />
          </div>
          <label className="sector-card__check" title="Preencher com horário atual">
            <input
              type="checkbox"
              checked={false}
              onChange={() => requestFill('inicio')}
            />
          </label>
        </div>

        <div className="sector-card__row">
          <div className="sector-card__field">
            <label className="sector-card__label">Fim</label>
            <input
              type="datetime-local"
              className="sector-card__input"
              value={data.fim}
              disabled={!data.inicio}
              onChange={(e) => handleFimChange(e.target.value)}
            />
          </div>
          <label className="sector-card__check" title="Preencher com horário atual">
            <input
              type="checkbox"
              checked={false}
              onChange={() => requestFill('fim')}
            />
          </label>
        </div>

        <label className="sector-card__check sector-card__check--standalone">
          <input
            type="checkbox"
            checked={data.pausa}
            disabled={!data.inicio}
            onChange={(e) => handlePausaChange(e.target.checked)}
          />
          <span>Pausa</span>
        </label>

        <div className="sector-card__responsible">
          <div className="sector-card__field sector-card__field--id">
            <label className="sector-card__label">ID</label>
            <input
              type="text"
              className="sector-card__input"
              value={data.responsavelId}
              onChange={(e) => onChange('responsavelId', e.target.value)}
            />
          </div>
          <div className="sector-card__field">
            <label className="sector-card__label">Responsável</label>
            <input
              type="text"
              className="sector-card__input"
              value={data.responsavelNome}
              readOnly
              placeholder="—"
            />
          </div>
          <button
            className="sector-card__pick"
            type="button"
            onClick={onPickEmployee}
            title="Buscar funcionário"
          >
            <Users size={13} />
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      isOpen={pendingField !== null}
      message={`Preencher ${pendingField === 'inicio' ? 'Início' : 'Fim'} de ${config.label} com o horário atual?`}
      confirmLabel="Sim, preencher"
      onConfirm={handleConfirm}
      onCancel={() => setPendingField(null)}
    />

    <ConfirmModal
      isOpen={warningMsg !== null}
      message={warningMsg ?? ''}
      cancelLabel="Entendido"
      onCancel={() => setWarningMsg(null)}
    />
    </>
  )
}
