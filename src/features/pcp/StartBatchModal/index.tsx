import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import type { ProductionProject } from '../../../types/pcp';
import './index.css';

interface Props {
  isOpen: boolean;
  projects: ProductionProject[];
  onClose: () => void;
  onStart: (lote: string, dataInicio: string) => void;
}

export function StartBatchModal({ isOpen, projects, onClose, onStart }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [lote, setLote] = useState('');
  const [dataInicio, setDataInicio] = useState(today);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const availableLotes = useMemo(
    () =>
      [...new Set(projects.filter((p) => p.status === 'em_lote' && p.lote).map((p) => p.lote))].sort(),
    [projects],
  );

  const loteProjects = useMemo(
    () => projects.filter((p) => p.lote === lote && p.status === 'em_lote'),
    [projects, lote],
  );

  useEffect(() => {
    if (!isOpen) {
      setLote('');
      setDataInicio(today);
      setConfirmOpen(false);
    }
  }, [isOpen, today]);

  function handleConfirm() {
    onStart(lote, dataInicio);
    setConfirmOpen(false);
  }

  const canStart = lote.trim().length > 0 && dataInicio.length > 0;

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
                    onChange={(e) => setLote(e.target.value)}
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
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
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
                onClick={() => setConfirmOpen(true)}
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
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
