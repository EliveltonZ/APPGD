import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { FormSection } from '../../../components/FormSection';
import { IdentificationSection } from './sections/IdentificationSection';
import { ItemSection } from './sections/ItemSection';
import { SupplierSection } from './sections/SupplierSection';
import { DatesSection } from './sections/DatesSection';
import { StatusSection } from './sections/StatusSection';
import type { Purchase } from '../../../types/purchases';
import './index.css';

interface PurchaseModalProps {
  isOpen: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

export function PurchaseModal({ isOpen, purchase, onClose, onSave }: PurchaseModalProps) {
  const [form, setForm] = useState<Purchase | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && purchase) {
      setForm({ ...purchase });
    } else if (!isOpen) {
      setForm(null);
      setConfirmOpen(false);
    }
  }, [isOpen, purchase]);

  function handleSaveConfirm() {
    if (!form) return;
    onSave(form);
    setConfirmOpen(false);
  }

  if (!isOpen) return null;

  return (
    <>
      <Modal
        title={`Compra #${purchase?.id ?? '—'} — ${purchase?.descricao ?? ''}`}
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={860}
      >
        {form && (
          <div className="pur-modal__content">
            <FormSection step={1} title="Identificação">
              <IdentificationSection data={form} />
            </FormSection>

            <FormSection step={2} title="Informações do Item">
              <ItemSection data={form} onChange={setForm} />
            </FormSection>

            <FormSection step={3} title="Fornecedor e Pagamento">
              <SupplierSection data={form} onChange={setForm} />
            </FormSection>

            <FormSection step={4} title="Datas">
              <DatesSection data={form} onChange={setForm} />
            </FormSection>

            <FormSection step={5} title="Status e Observações">
              <StatusSection data={form} onChange={setForm} />
            </FormSection>

            <div className="pur-modal__footer">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setConfirmOpen(true)}>
                Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        message="Deseja salvar as alterações desta compra?"
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={handleSaveConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
