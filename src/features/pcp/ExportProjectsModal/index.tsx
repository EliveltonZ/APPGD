import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import type { ExportProjectsFormData } from '../../../types/pcp';
import './index.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (form: ExportProjectsFormData) => void;
}

const emptyForm = (): ExportProjectsFormData => ({ dataInicial: '', dataFinal: '' });

export function ExportProjectsModal({ isOpen, onClose, onExport }: Props) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({ dataInicial: '', dataFinal: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm());
      setErrors({ dataInicial: '', dataFinal: '' });
      setConfirmOpen(false);
    }
  }, [isOpen]);

  function validate(): boolean {
    const errs = { dataInicial: '', dataFinal: '' };
    if (!form.dataInicial) errs.dataInicial = 'Data inicial obrigatória.';
    if (!form.dataFinal)   errs.dataFinal   = 'Data final obrigatória.';
    if (form.dataInicial && form.dataFinal && form.dataFinal < form.dataInicial) {
      errs.dataFinal = 'Data final não pode ser anterior à data inicial.';
    }
    setErrors(errs);
    return !errs.dataInicial && !errs.dataFinal;
  }

  function handleExportClick() {
    if (validate()) setConfirmOpen(true);
  }

  function handleConfirm() {
    onExport(form);
    setConfirmOpen(false);
  }

  function fmt(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Exportar Projetos" isOpen={isOpen} onClose={onClose} maxWidth={420}>
        <div className="xprt-content">
          <p className="xprt-desc">
            Selecione o período para exportar os projetos.
          </p>

          <div className="xprt-fields">
            <div className="pfield">
              <label>Data Inicial</label>
              <input
                type="date"
                value={form.dataInicial}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, dataInicial: e.target.value }));
                  setErrors((prev) => ({ ...prev, dataInicial: '' }));
                }}
              />
              {errors.dataInicial && (
                <span className="xprt-error">{errors.dataInicial}</span>
              )}
            </div>
            <div className="pfield">
              <label>Data Final</label>
              <input
                type="date"
                value={form.dataFinal}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, dataFinal: e.target.value }));
                  setErrors((prev) => ({ ...prev, dataFinal: '' }));
                }}
              />
              {errors.dataFinal && (
                <span className="xprt-error">{errors.dataFinal}</span>
              )}
            </div>
          </div>

          <div className="xprt-footer">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleExportClick}>
              Exportar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Exportar projetos de ${fmt(form.dataInicial)} a ${fmt(form.dataFinal)}?`}
        confirmLabel="Exportar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
