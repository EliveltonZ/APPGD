import { useReducer, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { fetchLotes } from '../../../services/pcp';
import { localDateStr } from '../../../utils/dateUtils';
import type { ProductionProject } from '../../../types/pcp';
import './index.css';

interface Props {
  isOpen: boolean;
  projects: ProductionProject[];
  onClose: () => void;
  onStart: (lote: string, startDate: string) => void;
}

const TODAY = localDateStr();

type State = { lote: string; startDate: string; confirmOpen: boolean; availableLotes: string[] };
type Action =
  | { type: 'set_lote'; value: string }
  | { type: 'set_date'; value: string }
  | { type: 'set_confirm'; value: boolean }
  | { type: 'set_lotes'; value: string[] }
  | { type: 'reset' };

const INITIAL: State = { lote: '', startDate: TODAY, confirmOpen: false, availableLotes: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_lote':    return { ...state, lote: action.value };
    case 'set_date':    return { ...state, startDate: action.value };
    case 'set_confirm': return { ...state, confirmOpen: action.value };
    case 'set_lotes':   return { ...state, availableLotes: action.value };
    case 'reset':       return INITIAL;
  }
}

export function StartBatchModal({ isOpen, projects, onClose, onStart }: Props) {
  const [{ lote, startDate, confirmOpen, availableLotes }, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (isOpen) {
      fetchLotes().then((lotes) => dispatch({ type: 'set_lotes', value: lotes.map(String) }));
    } else {
      dispatch({ type: 'reset' });
    }
  }, [isOpen]);

  const loteProjects = useMemo(
    () => projects.filter((p) => p.lote === lote && p.status === 'em_lote'),
    [projects, lote],
  );

  function handleConfirm() {
    onStart(lote, startDate);
    dispatch({ type: 'set_confirm', value: false });
  }

  const canStart = lote.trim().length > 0 && startDate.length > 0;

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Iniciar Lote de Produção" isOpen={isOpen} onClose={onClose} maxWidth={480}>
        <div className="sbatch-content">
          {availableLotes.length === 0 ? (
            <p className="sbatch-empty">Nenhum lote aguardando início de produção.</p>
          ) : (
            <>
              <div className="sbatch-fields">
                <div className="pfield">
                  <label>Lote</label>
                  <select
                    className="pfield__select"
                    value={lote}
                    onChange={(e) => dispatch({ type: 'set_lote', value: e.target.value })}
                  >
                    <option value="">Selecione um lote...</option>
                    {availableLotes.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="pfield">
                  <label>Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => dispatch({ type: 'set_date', value: e.target.value })}
                  />
                </div>
              </div>

              {lote && loteProjects.length > 0 && (
                <div className="sbatch-preview">
                  <p className="sbatch-preview__label">
                    {loteProjects.length} projeto{loteProjects.length !== 1 ? 's' : ''} em {lote}
                  </p>
                  <ul className="sbatch-preview__list">
                    {loteProjects.map((p) => (
                      <li key={p.id} className="sbatch-preview__item">
                        <span className="sbatch-preview__oc">{p.numOC}</span>
                        <span className="sbatch-preview__amb">{p.cliente} — {p.ambiente}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="sbatch-footer">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            {availableLotes.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                disabled={!canStart}
                onClick={() => dispatch({ type: 'set_confirm', value: true })}
              >
                Iniciar Lote
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Iniciar produção do ${lote}?`}
        confirmLabel="Iniciar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => dispatch({ type: 'set_confirm', value: false })}
      />
    </>
  );
}
