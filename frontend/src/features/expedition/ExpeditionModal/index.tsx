import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { FormSection } from '../../../components/FormSection';
import { UsersModal } from '../UsersModal';
import { StatusBadge } from '../../forecast/StatusBadge';
import { ProjectInfoSection } from './sections/ProjectInfoSection';
import { AccessoriesChecklistSection } from './sections/AccessoriesChecklistSection';
import { OperationalStatusSection } from './sections/OperationalStatusSection';
import { NotesSection } from './sections/NotesSection';
import { MaterialsTable } from '../../../components/MaterialsTable';
import type { ExpeditionDetail, ExpeditionUser } from '../../../types/expedition';
import type { PickRole } from './sections/OperationalStatusSection';
import './index.css';

function validate(f: ExpeditionDetail): string | null {
  if (f.pendencia) return null;
  if (!f.entrega && !f.pronto) return null;
  if (f.entrega && !f.pronto) return 'Projeto não finalizado';
  if (!f.etapa) return 'Etapas de produção em aberto';
  if (f.acessoriosCompra.some((a) => !a.recebido)) return 'Acessórios pendentes';
  return null;
}

interface ExpeditionModalProps {
  isOpen: boolean;
  detail: ExpeditionDetail | null;
  users: ExpeditionUser[];
  status?: string;
  loading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (detail: ExpeditionDetail) => void;
}

export function ExpeditionModal({
  isOpen,
  detail,
  users,
  status,
  loading = false,
  saving = false,
  onClose,
  onSave,
}: ExpeditionModalProps) {
  const [form, setForm] = useState<ExpeditionDetail | null>(() =>
    detail ? { ...detail } : null,
  );
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<PickRole | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  function updateForm(updates: Partial<ExpeditionDetail>) {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev));
    setValidationWarning(null);
  }

  function handleSaveClick() {
    if (!form) return;
    const warning = validate(form);
    if (warning) { setValidationWarning(warning); return; }
    setValidationWarning(null);
    setSaveConfirmOpen(true);
  }

  function handlePickUser(role: PickRole) {
    setPickingFor(role);
    setUserModalOpen(true);
  }

  function handleSelectUser(user: ExpeditionUser) {
    if (!pickingFor) return;
    const id = Number(user.id);
    if (pickingFor === 'embalagem') {
      updateForm({ embalagemresp: id, embalagemname: user.nome });
    } else if (pickingFor === 'conferido') {
      updateForm({ conferido: id, conferidoname: user.nome });
    } else if (pickingFor === 'motorista') {
      updateForm({ motorista: id, motoristaname: user.nome });
    }
    setUserModalOpen(false);
    setPickingFor(null);
  }

  function footer() {
    return (
      <div className="exped-modal__footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setPickingFor(null);
            setUserModalOpen(true);
          }}
        >
          Funcionários
        </Button>
        <div className="exped-modal__footer-actions">
          {validationWarning && (
            <span className="exped-modal__validation-warning">
              <AlertTriangle size={13} />
              {validationWarning}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={saving || loading || !form}
            onClick={handleSaveClick}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;
  return (
    <>
      <Modal
        title="Controle de Expedição"
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={1080}
        footer={footer()}
      >
        {loading && (
          <div className="exped-modal__loading">Carregando...</div>
        )}
        {!loading && form && (
          <div className="exped-modal__content">
            <FormSection step={1} title="Identificação">
              <div className="plan-modal__section-header" style={{ marginBottom: 4 }}>
                <h3 className="plan-modal__section-title">Dados do Projeto</h3>
                {status && <StatusBadge status={status} />}
              </div>
              <ProjectInfoSection detail={form} />
            </FormSection>

            <FormSection step={2} title="Avulsos e Volumes">
              <AccessoriesChecklistSection detail={form} onChange={updateForm} />
            </FormSection>

            <FormSection step={3} title="Status Operacional">
              <OperationalStatusSection
                data={form}
                onChange={updateForm}
                onPickUser={handlePickUser}
              />
            </FormSection>

            <FormSection step={4} title="Observações">
              <NotesSection value={form.observacoes} onChange={(v) => updateForm({ observacoes: v })} />
            </FormSection>

            <FormSection step={5} title="Compras Pendentes">
              <MaterialsTable materials={form.acessoriosCompra} />
            </FormSection>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={saveConfirmOpen}
        message="Deseja salvar as alterações deste pedido de expedição?"
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={() => { if (form) onSave(form); setSaveConfirmOpen(false); }}
        onCancel={() => setSaveConfirmOpen(false)}
      />

      <UsersModal
        isOpen={userModalOpen}
        users={users}
        onClose={() => { setUserModalOpen(false); setPickingFor(null); }}
        onSelect={handleSelectUser}
      />
    </>
  );
}
