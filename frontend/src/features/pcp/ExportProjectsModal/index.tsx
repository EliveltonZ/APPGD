import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { exportarProjetos, type ExportedProject } from '../../../services/pcp';
import type { ExportProjectsFormData } from '../../../types/pcp';
import './index.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = (): ExportProjectsFormData => ({ dataInicial: '', dataFinal: '' });

const HEADERS = ['N° OC', 'Contrato', 'Cliente', 'Ambiente', 'N° Projeto', 'Chegou Fábrica', 'Entrega', 'Vendedor'];

function downloadXlsx(rows: ExportedProject[], dataInicial: string, dataFinal: string) {
  const wsData = [
    HEADERS,
    ...rows.map((r) => [
      r.ordemdecompra, r.contrato, r.cliente, r.ambiente,
      r.numproj, r.chegoufabrica, r.dataentrega, r.vendedor,
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projetos');
  XLSX.writeFile(wb, `projetos_${dataInicial}_${dataFinal}.xlsx`);
}

export function ExportProjectsModal({ isOpen, onClose }: Props) {
  const [form, setForm]     = useState(emptyForm());
  const [errors, setErrors] = useState({ dataInicial: '', dataFinal: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting]     = useState(false);

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

  async function handleConfirm() {
    setConfirmOpen(false);
    setExporting(true);
    try {
      const rows = await exportarProjetos(form);
      downloadXlsx(rows, form.dataInicial, form.dataFinal);
      onClose();
    } catch {
      setErrors((prev) => ({ ...prev, dataFinal: 'Erro ao exportar. Tente novamente.' }));
    } finally {
      setExporting(false);
    }
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
            <Button variant="primary" size="sm" onClick={handleExportClick} loading={exporting}>
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
