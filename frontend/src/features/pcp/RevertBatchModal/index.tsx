import { useReducer, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { fetchLotesIniciados } from '../../../services/pcp';
import type { ProductionProject } from '../../../types/pcp';
import '../StartBatchModal/index.css';

interface Props {
  isOpen: boolean;
  projects: ProductionProject[];
  onClose: () => void;
  onRevert: (lote: string) => void;
}

type State = { lote: string; confirmOpen: boolean; availableLotes: string[] };
type Action =
  | { type: 'set_lote';    value: string }
  | { type: 'set_confirm'; value: boolean }
  | { type: 'set_lotes';   value: string[] }
  | { type: 'reset' };

const INITIAL: State = { lote: '', confirmOpen: false, availableLotes: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_lote':    return { ...state, lote: action.value };
    case 'set_confirm': return { ...state, confirmOpen: action.value };
    case 'set_lotes':   return { ...state, availableLotes: action.value };
    case 'reset':       return INITIAL;
  }
}

export function RevertBatchModal({ isOpen, projects, onClose, onRevert }: Props) {
  const [{ lote, confirmOpen, availableLotes }, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (isOpen) {
      fetchLotesIniciados().then((lotes) =>
        dispatch({ type: 'set_lotes', value: lotes.map(String) }),
      );
    } else {
      dispatch({ type: 'reset' });
    }
  }, [isOpen]);

  const loteProjects = useMemo(
    () => projects.filter((p) => p.lote === lote && p.status === 'em_producao'),
    [projects, lote],
  );

  function handleConfirm() {
    onRevert(lote);
    dispatch({ type: 'set_confirm', value: false });
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Reverter Lote para Em Lote" isOpen={isOpen} onClose={onClose} maxWidth={480}>
        <div className="sbatch-content">
          {availableLotes.length === 0 ? (
            <p className="sbatch-empty">Nenhum lote em produção para reverter.</p>
          ) : (
            <>
              <div className="sbatch-fields">
                <div className="pfield">
                  <label>Lote em Produção</label>
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
                variant="danger"
                size="sm"
                disabled={!lote}
                onClick={() => dispatch({ type: 'set_confirm', value: true })}
              >
                Reverter Lote
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Reverter o ${lote} para "Em Lote"? A data de início será removida.`}
        confirmLabel="Reverter"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => dispatch({ type: 'set_confirm', value: false })}
      />
    </>
  );
}
